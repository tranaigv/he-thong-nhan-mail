import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Clock,
  Mail,
  Edit3,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCw,
  Send,
  FileCheck,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';
import { DocumentItem, AdvisorySheet, AdvisoryTask, TaskItem, EmailDraft, UserProfile } from '../types';

interface AdvisorySheetModalProps {
  document: DocumentItem | null;
  users: UserProfile[];
  isOpen: boolean;
  onClose: () => void;
  onApproveAndDispatch: (
    docId: string,
    tasks: TaskItem[],
    emailDraft?: EmailDraft,
    advisorySheet?: AdvisorySheet,
  ) => void;
  onReject: (docId: string, reason: string) => void;
}

export const AdvisorySheetModal: React.FC<AdvisorySheetModalProps> = ({
  document,
  users,
  isOpen,
  onClose,
  onApproveAndDispatch,
  onReject,
}) => {
  if (!isOpen || !document || !document.advisorySheet) return null;

  const [sheet, setSheet] = useState<AdvisorySheet>(JSON.parse(JSON.stringify(document.advisorySheet)));
  const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null);
  const [showAiAdjustInput, setShowAiAdjustInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [diffHistory, setDiffHistory] = useState<{ before: AdvisoryTask[]; after: AdvisoryTask[]; prompt: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEmailDraft, setShowEmailDraft] = useState(true);

  // Editable task change
  const handleTaskChange = (index: number, field: keyof AdvisoryTask, value: any) => {
    const updated = [...sheet.tasks];
    updated[index] = { ...updated[index], [field]: value };
    setSheet({ ...sheet, tasks: updated });
  };

  const handleAddTask = () => {
    const newTask: AdvisoryTask = {
      taskId: `NV-NEW-${sheet.tasks.length + 1}`,
      title: 'Nhiệm vụ mới thêm bổ sung',
      description: 'Mô tả chi tiết nhiệm vụ triển khai',
      owner: 'ThS. Trần Văn Hùng (Phó Hiệu trưởng)',
      collaborators: ['Cô Phạm Thu Hà (Văn thư)'],
      approver: 'TS. Đỗ Thị Lan (Hiệu trưởng)',
      deadline: sheet.deadline || '2026-09-30',
      priority: 'Cao',
      outputRequired: 'Báo cáo hoặc Biên bản',
      reportReceiver: 'Ban Giám hiệu',
      evidence: 'Biên bản/File đính kèm',
      confidence: 1.0,
    };
    setSheet({ ...sheet, tasks: [...sheet.tasks, newTask] });
    setEditingTaskIdx(sheet.tasks.length);
  };

  const handleDeleteTask = (index: number) => {
    if (confirm('Thầy/Cô có chắc muốn xóa nhiệm vụ này khỏi Phiếu tham mưu?')) {
      const updated = sheet.tasks.filter((_, i) => i !== index);
      setSheet({ ...sheet, tasks: updated });
    }
  };

  // Section XII Human-in-the-loop AI adjustment
  const handleRequestAiAdjust = async () => {
    if (!aiPrompt.trim()) return;
    setAdjusting(true);
    try {
      const response = await fetch('/api/ai/adjust-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTasks: sheet.tasks,
          userInstruction: aiPrompt,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setDiffHistory({
        before: sheet.tasks,
        after: data.adjustedTasks,
        prompt: aiPrompt,
      });

      setSheet({
        ...sheet,
        tasks: data.adjustedTasks,
      });
      setShowAiAdjustInput(false);
      setAiPrompt('');
    } catch (err: any) {
      alert('Không thể điều chỉnh: ' + err.message);
    } finally {
      setAdjusting(false);
    }
  };

  // Final Action: Approve & Dispatch
  const handleFinalApprove = () => {
    // Generate real TaskItems from the advisory tasks
    const newTasks: TaskItem[] = sheet.tasks.map((t, idx) => ({
      id: `TSK-${Date.now().toString().slice(-5)}-${idx}`,
      code: t.taskId || `NV-${idx + 1}`,
      title: t.title,
      description: t.description,
      sourceDocId: document.id,
      sourceDocNumber: document.documentNumber,
      owner: t.owner,
      ownerId: users.find((u) => u.name.includes(t.owner.split(' ')[1] || ''))?.id || 'USR-02',
      department: users.find((u) => t.owner.includes(u.name))?.department || 'Tổ chuyên môn',
      collaborators: t.collaborators,
      approver: t.approver,
      assignDate: new Date().toISOString().split('T')[0],
      deadline: t.deadline,
      outputRequired: t.outputRequired,
      evidenceFiles: [],
      priority: t.priority as any,
      progress: 0,
      status: 'ĐÃ GIAO',
      comments: [
        {
          id: `CMT-${Date.now()}`,
          author: 'Ban Giám hiệu',
          role: 'Người phê duyệt',
          timestamp: new Date().toLocaleString('vi-VN'),
          content: 'Đã phê duyệt phân công từ Phiếu tham mưu xử lý số ' + document.documentNumber,
        },
      ],
      history: [
        'Khởi tạo tự động bởi AI',
        `Phê duyệt & giao việc bởi BGH lúc ${new Date().toLocaleString('vi-VN')}`,
      ],
    }));

    // Draft email item
    const emailItem: EmailDraft | undefined = sheet.draftEmail
      ? {
          id: `EML-${Date.now()}`,
          to: 'canbo-giaovien@thpt-ngoquyen.edu.vn',
          recipientName: 'Toàn thể Cán bộ Giáo viên được phân công',
          subject: sheet.draftEmail.subject,
          body: sheet.draftEmail.body,
          status: 'Đã gửi',
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          relatedDocNumber: document.documentNumber,
          reviewedBy: 'TS. Đỗ Thị Lan (Hiệu trưởng)',
        }
      : undefined;

    onApproveAndDispatch(document.id, newTasks, emailItem, {
      ...sheet,
      status: 'Đã duyệt',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-serif">PHIẾU THAM MƯU XỬ LÝ VĂN BẢN</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950">
                  {sheet.status}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Số CV: {document.documentNumber} • {document.issuingAgency} • Ngày ban hành: {document.issueDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Thông tin tóm tắt & Yêu cầu trọng tâm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
              <div className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                Nội dung trọng tâm (AI Summary):
              </div>
              <textarea
                value={sheet.aiSummary}
                onChange={(e) => setSheet({ ...sheet, aiSummary: e.target.value })}
                rows={3}
                className="w-full p-2.5 text-xs bg-white rounded-xl border border-blue-200 focus:border-blue-500 outline-hidden font-medium text-slate-800 leading-relaxed"
              />
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                Hạn chót toàn văn bản:
              </div>
              <input
                type="date"
                value={sheet.deadline || ''}
                onChange={(e) => setSheet({ ...sheet, deadline: e.target.value })}
                className="w-full p-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-amber-900"
              />
              <div className="text-[11px] text-amber-800">
                Người đề xuất chủ trì: <br />
                <span className="font-bold">{sheet.proposedOwner}</span>
              </div>
            </div>
          </div>

          {/* Section XII Diff History Alert: "Nội dung cũ → Nội dung mới" */}
          {diffHistory && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Kết quả điều chỉnh theo yêu cầu của Lãnh đạo: "{diffHistory.prompt}"
                </span>
                <button
                  onClick={() => setDiffHistory(null)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  Đóng so sánh
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-white/80 rounded-xl border border-red-200">
                  <div className="font-bold text-red-700 mb-1">Nội dung cũ:</div>
                  {diffHistory.before.map((b, i) => (
                    <div key={i} className="text-slate-600">
                      • {b.title} ({b.owner} - Hạn {b.deadline})
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200">
                  <div className="font-bold text-emerald-700 mb-1">Nội dung mới (AI cập nhật):</div>
                  {diffHistory.after.map((a, i) => (
                    <div key={i} className="text-slate-800 font-medium">
                      • {a.title} ({a.owner} - Hạn {a.deadline})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Natural language adjustment prompt box */}
          {showAiAdjustInput && (
            <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Ra lệnh cho AI điều chỉnh phân công nhiệm vụ:
                </span>
                <button
                  onClick={() => setShowAiAdjustInput(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: Đổi nhiệm vụ số 2 sang Cô Loan phụ trách, lùi deadline nhiệm vụ 1 đến 20/09..."
                  className="flex-1 p-2.5 text-xs bg-white rounded-xl border border-indigo-200 focus:border-indigo-600 outline-hidden font-medium"
                />
                <button
                  onClick={handleRequestAiAdjust}
                  disabled={adjusting || !aiPrompt.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  AI Cập nhật
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Danh sách các nhiệm vụ cụ thể */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Danh sách nhiệm vụ phân công ({sheet.tasks.length})
                </h3>
                <span className="text-xs text-slate-400">
                  (Bấm vào từng trường để chỉnh sửa trực tiếp)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiAdjustInput(!showAiAdjustInput)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Yêu cầu AI đề xuất lại
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  Thêm nhiệm vụ
                </button>
              </div>
            </div>

            <div className="space-y-3.5">
              {sheet.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={task.taskId}
                        onChange={(e) => handleTaskChange(idx, 'taskId', e.target.value)}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      />
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Độ tin cậy AI: {Math.round((task.confidence || 0.95) * 100)}%
                      </span>
                      <button
                        onClick={() => handleDeleteTask(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa nhiệm vụ này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task details: Owner, Approver, Deadline, Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Người phụ trách:
                      </label>
                      <select
                        value={task.owner}
                        onChange={(e) => handleTaskChange(idx, 'owner', e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={`${u.name} (${u.roleTitle})`}>
                            {u.name} ({u.roleTitle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Người duyệt:
                      </label>
                      <select
                        value={task.approver}
                        onChange={(e) => handleTaskChange(idx, 'approver', e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="TS. Đỗ Thị Lan (Hiệu trưởng)">TS. Đỗ Thị Lan (Hiệu trưởng)</option>
                        <option value="ThS. Trần Văn Hùng (Phó Hiệu trưởng)">ThS. Trần Văn Hùng (Phó Hiệu trưởng)</option>
                        <option value="Cô Lê Thị Mai (Phó Hiệu trưởng)">Cô Lê Thị Mai (Phó Hiệu trưởng)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Hạn hoàn thành:
                      </label>
                      <input
                        type="date"
                        value={task.deadline}
                        onChange={(e) => handleTaskChange(idx, 'deadline', e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Độ ưu tiên:
                      </label>
                      <select
                        value={task.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Bình thường">Bình thường</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Cao">Cao</option>
                        <option value="Khẩn cấp">Khẩn cấp</option>
                      </select>
                    </div>
                  </div>

                  {/* Output product & evidence requirement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Sản phẩm đầu ra yêu cầu:
                      </label>
                      <input
                        type="text"
                        value={task.outputRequired}
                        onChange={(e) => handleTaskChange(idx, 'outputRequired', e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">
                        Minh chứng kiểm tra:
                      </label>
                      <input
                        type="text"
                        value={task.evidence}
                        onChange={(e) => handleTaskChange(idx, 'evidence', e.target.value)}
                        className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Email dự thảo tự động */}
          {sheet.draftEmail && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Dự thảo Email thông báo giao việc tự động
                </span>
                <button
                  onClick={() => setShowEmailDraft(!showEmailDraft)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {showEmailDraft ? 'Thu gọn' : 'Xem nội dung'}
                </button>
              </div>

              {showEmailDraft && (
                <div className="space-y-2 pt-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Tiêu đề:</span>
                    <input
                      type="text"
                      value={sheet.draftEmail.subject}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          draftEmail: { ...sheet.draftEmail!, subject: e.target.value },
                        })
                      }
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Nội dung thư:</span>
                    <textarea
                      value={sheet.draftEmail.body}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          draftEmail: { ...sheet.draftEmail!, body: e.target.value },
                        })
                      }
                      rows={4}
                      className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer: The mandatory buttons from Section VIII:
            [PHÂN TÍCH LẠI] [CHỈNH SỬA] [THÊM NHIỆM VỤ] [GỘP NHIỆM VỤ] [ĐỔI NGƯỜI PHỤ TRÁCH] [YÊU CẦU AI ĐỀ XUẤT LẠI] [DUYỆT] [TỪ CHỐI] [DUYỆT & GIAO VIỆC] */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const reason = prompt('Nhập lý do từ chối phiếu tham mưu:');
                if (reason) onReject(document.id, reason);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
            >
              Từ chối
            </button>
            <button
              onClick={() => setShowAiAdjustInput(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              Yêu cầu AI đề xuất lại
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Lưu nháp
            </button>
            <button
              onClick={handleFinalApprove}
              className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              Duyệt & Giao việc (Phát hành)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
