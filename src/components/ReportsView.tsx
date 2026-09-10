import React, { useState } from 'react';
import {
  FileBarChart,
  Sparkles,
  Download,
  Copy,
  Mail,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import { ReportItem, DocumentItem, TaskItem, UserProfile } from '../types';

interface ReportsViewProps {
  reports?: ReportItem[];
  documents?: DocumentItem[];
  tasks?: TaskItem[];
  currentUser: UserProfile;
  onCreateReport: (report: ReportItem) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports = [],
  documents = [],
  tasks = [],
  currentUser,
  onCreateReport,
}) => {
  const safeReports = reports || [];
  const safeDocs = documents || [];
  const safeTasks = tasks || [];

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(safeReports[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCheckerModal, setShowCheckerModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkDocId, setCheckDocId] = useState(safeDocs[0]?.id || '');
  const [checkReportContent, setCheckReportContent] = useState('');
  const [checkerResult, setCheckerResult] = useState<any>(null);

  // New report creation form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Hàng tuần');
  const [newPeriod, setNewPeriod] = useState('Tuần 2 Tháng 9/2026');

  // Copy report text
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép nội dung báo cáo vào clipboard!');
  };

  // Export to simulated Word / PDF / Excel
  const handleExport = (format: 'word' | 'pdf' | 'excel') => {
    if (!selectedReport) return;
    const blob = new Blob([selectedReport.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport.code}_${selectedReport.title.slice(0, 20)}.${
      format === 'word' ? 'doc' : format === 'excel' ? 'csv' : 'txt'
    }`;
    link.click();
  };

  // Section XV: AI Report Checker execution
  const handleRunAiReportChecker = async () => {
    const doc = documents.find((d) => d.id === checkDocId);
    if (!doc) return;
    const reqText = doc.reportingRequirements || doc.summary;
    const content = checkReportContent || selectedReport?.content || '';

    if (!content.trim()) {
      alert('Vui lòng nhập nội dung báo cáo cần đối soát.');
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/ai/check-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentRequirements: reqText,
          reportContent: content,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setCheckerResult(data.evaluation);
    } catch (err: any) {
      alert('Lỗi kiểm tra báo cáo: ' + err.message);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle create report
  const handleGenerateWeeklyReport = () => {
    const completed = tasks.filter((t) => t.status === 'HOÀN THÀNH');
    const inProgress = tasks.filter((t) => t.status === 'ĐANG LÀM');
    const overdue = tasks.filter((t) => t.status === 'QUÁ HẠN');

    const generatedContent = `BÁO CÁO KẾT QUẢ ĐIỀU HÀNH VÀ THỰC HIỆN NHIỆM VỤ
Kỳ báo cáo: ${newPeriod}
Đơn vị: Trường THPT Ngô Quyền, Hải Phòng

I. TỔNG HỢP TIẾN ĐỘ THỰC HIỆN CÁC VĂN BẢN VÀ NHIỆM VỤ
- Tổng số nhiệm vụ đang quản lý: ${tasks.length}
- Đã hoàn thành: ${completed.length} nhiệm vụ (${Math.round(
      (completed.length / (tasks.length || 1)) * 100,
    )}%)
- Đang thực hiện đúng hạn: ${inProgress.length} nhiệm vụ
- Nhiệm vụ quá hạn cần giải quyết: ${overdue.length} nhiệm vụ

II. CHI TIẾT KẾT QUẢ THEO CÔNG VĂN SỞ GD&ĐT VÀ BGH
${tasks
  .map(
    (t, idx) =>
      `${idx + 1}. [${t.code}] ${t.title}\n   - Người phụ trách: ${t.owner} (${t.department})\n   - Hạn hoàn thành: ${
        t.deadline
      } | Tiến độ: ${t.progress}% | Trạng thái: ${t.status}\n   - Sản phẩm yêu cầu: ${t.outputRequired}`,
  )
  .join('\n\n')}

III. KIẾN NGHỊ VÀ ĐỀ XUẤT BAN GIÁM HIỆU
1. Đề nghị các tổ chuyên môn hoàn thiện việc nộp minh chứng trên phần mềm NQ Office AI trước hạn quy định.
2. Phê duyệt dự toán kinh phí chuẩn bị Hội trại truyền thống 20/11.`;

    const newReport: ReportItem = {
      id: `RPT-${Date.now().toString().slice(-4)}`,
      code: `BC-${Date.now().toString().slice(-4)}`,
      title: newTitle || `Báo cáo công tác tuần - ${newPeriod}`,
      type: newType as any,
      period: newPeriod,
      author: currentUser.name,
      department: currentUser.department,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Chờ duyệt',
      content: generatedContent,
      taskIds: tasks.map((t) => t.id),
      version: 'V1',
    };

    onCreateReport(newReport);
    setSelectedReport(newReport);
    setShowCreateModal(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-serif">
            Trung tâm Báo cáo & Thẩm định AI (Report Checker)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu thời gian thực từ tiến độ nhiệm vụ • Đối chiếu tiêu chí không bịa đặt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCheckReportContent(selectedReport?.content || '');
              setShowCheckerModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            AI Report Checker (Thẩm định)
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tổng hợp Báo cáo tự động
          </button>
        </div>
      </div>

      {/* Grid: Left List of Reports, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Reports List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase px-2">
            Danh sách Báo cáo ({reports.length})
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  selectedReport?.id === report.id
                    ? 'bg-blue-50 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {report.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.status === 'Đã duyệt'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{report.title}</h4>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{report.period}</span>
                  <span>{report.createdDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Report Preview, Export, and AI Checker Evaluation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-100 text-blue-800">
                      {selectedReport.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Loại: {selectedReport.type} • Phiên bản: {selectedReport.version}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 font-serif mt-1">
                    {selectedReport.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Người lập: {selectedReport.author} ({selectedReport.department}) • Ngày lập:{' '}
                    {selectedReport.createdDate}
                  </p>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(selectedReport.content)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Sao chép toàn văn"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExport('word')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Word (.doc)
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* AI Checker badge if report was evaluated */}
              {selectedReport.checkerResult && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Kết quả thẩm định AI: {selectedReport.checkerResult.evaluation} (
                      {selectedReport.checkerResult.score}/100 điểm)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">Đạt chuẩn Sở GD&ĐT</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {selectedReport.checkerResult.summary}
                  </p>
                </div>
              )}

              {/* Content Preview */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {selectedReport.content}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
              Chọn một báo cáo để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* CREATE REPORT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tổng hợp Báo cáo Số liệu Thực tế</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên báo cáo:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Báo cáo công tác tuần 2 tháng 9/2026"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại báo cáo:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="Hàng ngày">Hàng ngày</option>
                  <option value="Hàng tuần">Hàng tuần</option>
                  <option value="Hàng tháng">Hàng tháng</option>
                  <option value="Hàng quý">Hàng quý</option>
                  <option value="Năm học">Năm học</option>
                  <option value="Đột xuất">Đột xuất</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ báo cáo:</label>
                <input
                  type="text"
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl">
              Hệ thống sẽ tự động tập hợp {tasks.length} nhiệm vụ hiện có trên bảng Kanban, tính toán
              tỷ lệ % hoàn thành và phân loại theo tổ chuyên môn mà không bịa đặt số liệu.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleGenerateWeeklyReport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Tạo báo cáo ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION XV AI REPORT CHECKER MODAL */}
      {showCheckerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  AI Report Checker • Thẩm định đối chiếu Báo cáo & Yêu cầu gốc
                </h3>
              </div>
              <button onClick={() => setShowCheckerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn Văn bản chỉ đạo / Công văn gốc để đối chiếu:
              </label>
              <select
                value={checkDocId}
                onChange={(e) => setCheckDocId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.documentNumber} - {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung Báo cáo thẩm định:
              </label>
              <textarea
                value={checkReportContent}
                onChange={(e) => setCheckReportContent(e.target.value)}
                rows={6}
                placeholder="Dán nội dung báo cáo nộp của tổ/cán bộ..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRunAiReportChecker}
                disabled={isChecking}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                Chạy Thẩm định AI
              </button>
            </div>

            {/* Checker Results: 5 Evaluation Levels Mandate */}
            {checkerResult && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        checkerResult.evaluation === 'Đã đáp ứng'
                          ? 'bg-emerald-100 text-emerald-800'
                          : checkerResult.evaluation === 'Đáp ứng một phần'
                          ? 'bg-amber-100 text-amber-800'
                          : checkerResult.evaluation === 'Thiếu minh chứng'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Kết luận: {checkerResult.evaluation}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Điểm số: {checkerResult.score}/100
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {checkerResult.summary}
                </p>

                {checkerResult.details && checkerResult.details.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="text-xs font-bold text-slate-800 uppercase">
                      Chi tiết từng tiêu chí:
                    </div>
                    {checkerResult.details.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{item.criterion}</span>
                          <span className="text-blue-700">{item.status}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{item.notes}</p>
                        {item.evidenceProvided && (
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            Minh chứng: {item.evidenceProvided}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
