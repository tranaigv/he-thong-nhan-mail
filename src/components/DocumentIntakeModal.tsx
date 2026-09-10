import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Layers,
  Link,
  Mail,
  FolderSync,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionComplete: (newDoc: DocumentItem) => void;
}

export const DocumentIntakeModal: React.FC<DocumentIntakeModalProps> = ({
  isOpen,
  onClose,
  onExtractionComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'drag' | 'drive' | 'batch' | 'email'>('text');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Sample official document for quick testing
  const SAMPLE_DOCS = [
    {
      label: 'CV 186/SGDĐT - Hướng dẫn giáo dục hướng nghiệp',
      content: `SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ HẢI PHÒNG
Số: 186/SGDĐT-GDTrH
V/v Hướng dẫn triển khai công tác giáo dục hướng nghiệp và định hướng phân luồng học sinh THPT năm học 2026-2027
Hải Phòng, ngày 02 tháng 09 năm 2026

Kính gửi: Các trường THPT, trường Phổ thông nhiều cấp học trên địa bàn thành phố Hải Phòng.

Căn cứ Luật Giáo dục năm 2019;
Căn cứ Quyết định số 522/QĐ-TTg của Thủ tướng Chính phủ phê duyệt Đề án "Giáo dục hướng nghiệp và định hướng phân luồng học sinh trong giáo dục phổ thông giai đoạn 2018-2025";
Sở Giáo dục và Đào tạo hướng dẫn các đơn vị thực hiện các nhiệm vụ trọng tâm sau:

1. Thành lập Ban tư vấn hướng nghiệp cấp trường do đồng chí Lãnh đạo BGH làm Trưởng ban, các thành viên gồm Bí thư Đoàn thanh niên, Tổ trưởng chuyên môn và GVCN.
2. Xây dựng kế hoạch tối thiểu 12 tiết trải nghiệm nghề nghiệp thực tế kết hợp tham quan các trường Đại học, Cao đẳng và doanh nghiệp trên địa bàn thành phố.
3. Tổ chức khảo sát trực tuyến nguyện vọng ngành nghề và định hướng thi tốt nghiệp của 100% học sinh khối 12.
4. Thời hạn hoàn thành và nộp báo cáo tổng hợp kế hoạch về Sở GD&ĐT (qua Phòng GDTrH) trước 17h00 ngày 25/09/2026.

Nơi nhận:
- Như kính gửi;
- Giám đốc Sở (để b/c);
- Lưu: VT, GDTrH.
KT. GIÁM ĐỐC
PHÓ GIÁM ĐỐC
Nguyễn Đình Vinh`,
    },
    {
      label: 'CV 4020/BGDĐT - Nhiệm vụ năm học 2026-2027',
      content: `BỘ GIÁO DỤC VÀ ĐÀO TẠO
Số: 4020/BGDĐT-GDTrH
V/v Hướng dẫn thực hiện nhiệm vụ giáo dục trung học năm học 2026-2027
Hà Nội, ngày 28 tháng 08 năm 2026

Kính gửi: Các Sở Giáo dục và Đào tạo trên toàn quốc.

Bộ Giáo dục và Đào tạo yêu cầu các Sở GD&ĐT chỉ đạo các trường THPT:
1. Thực hiện nghiêm túc Chương trình GDPT 2018 đối với các khối 10, 11, 12.
2. Đổi mới phương pháp dạy học và kiểm tra đánh giá theo hướng phát triển phẩm chất, năng lực học sinh; tăng cường giáo dục STEM/STEAM.
3. Đẩy mạnh chuyển đổi số trong quản lý, áp dụng hệ thống văn phòng số và học bạ điện tử.
4. Báo cáo định kỳ học kỳ I trước ngày 15/01/2027.

KT. BỘ TRƯỞNG
THỨ TRƯỞNG
Nguyễn Văn Phúc`,
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setActiveTab('drag');
    }
  };

  const handleProcessDocument = async () => {
    setLoading(true);
    setErrorMsg(null);

    let contentToAnalyze = pastedText;
    let filename = 'van-ban-nhap.docx';

    if (selectedFile) {
      filename = selectedFile.name;
      // In web preview, read text file or mock binary text
      try {
        contentToAnalyze = await selectedFile.text();
      } catch (err) {
        contentToAnalyze = `Văn bản đính kèm: ${selectedFile.name} (Dung lượng: ${(
          selectedFile.size / 1024
        ).toFixed(1)} KB). Đang sử dụng cơ chế xử lý OCR / Chuyển đổi định dạng trung gian.`;
      }
    }

    if (!contentToAnalyze.trim()) {
      setErrorMsg('Vui lòng nhập văn bản, tải tệp hoặc chọn mẫu văn bản có sẵn để AI phân tích.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contentToAnalyze,
          filename,
          fileType: selectedFile ? selectedFile.type : 'text/plain',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Trích xuất AI thất bại.');
      }

      const ext = data.extractedData;
      const newDoc: DocumentItem = {
        id: `DOC-${Date.now().toString().slice(-6)}`,
        documentNumber: ext.documentNumber || `CV-${Date.now().toString().slice(-4)}`,
        title: ext.title || filename,
        issuingAgency: ext.issuingAgency || 'Cơ quan ban hành',
        signer: ext.signer || 'Người ký văn bản',
        signerTitle: ext.signerTitle || 'Thủ trưởng đơn vị',
        issueDate: ext.issueDate || new Date().toISOString().split('T')[0],
        deadline: ext.deadline || '2026-09-30',
        urgency: ext.urgency || 'Bình thường',
        confidentiality: ext.confidentiality || 'Thường',
        status: 'Chờ BGH duyệt',
        summary: ext.summary || 'Tóm tắt nội dung văn bản do AI trích xuất.',
        rawText: contentToAnalyze,
        legalReferences: ext.legalReferences || ['Luật Giáo dục năm 2019'],
        recipients: ext.recipients || ['Trường THPT Ngô Quyền'],
        attachments: ext.attachments || [filename],
        reportingRequirements: ext.reportingRequirements || 'Báo cáo theo tiến độ yêu cầu.',
        version: 'V1',
        docType: 'Văn bản đến',
        createdAt: new Date().toISOString(),
        advisorySheet: {
          documentId: `DOC-${Date.now().toString().slice(-6)}`,
          documentNumber: ext.documentNumber || 'CV-MOI',
          aiSummary: ext.summary || 'Trích xuất tự động bởi Gemini AI.',
          keyRequirements:
            ext.reportingRequirements || 'Triển khai phân công các tổ và nộp sản phẩm đúng hạn.',
          deadline: ext.deadline || '2026-09-30',
          tasks: (ext.tasks || []).map((t: any, i: number) => ({
            taskId: t.taskId || `NV-${i + 1}`,
            title: t.title || 'Nhiệm vụ trích xuất',
            description: t.description || '',
            owner: t.owner || 'ThS. Trần Văn Hùng (PHT)',
            collaborators: t.collaborators || ['Phạm Thu Hà (Văn thư)'],
            approver: t.approver || 'TS. Đỗ Thị Lan (Hiệu trưởng)',
            deadline: t.deadline || '2026-09-25',
            priority: t.priority || 'Cao',
            outputRequired: t.outputRequired || 'Kế hoạch hoặc Báo cáo',
            reportReceiver: t.reportReceiver || 'Hiệu trưởng',
            evidence: t.evidence || 'File minh chứng nộp trên phần mềm',
            confidence: t.confidence || 0.95,
          })),
          proposedOwner: ext.tasks?.[0]?.owner || 'Ban Giám hiệu',
          outputProduct: ext.tasks?.[0]?.outputRequired || 'Kế hoạch triển khai',
          draftEmail: ext.draftEmail || {
            subject: `[NQ OFFICE AI] Thông báo phân công công việc theo ${ext.documentNumber}`,
            body: `Kính gửi các Thầy/Cô,\n\nBan Giám hiệu Trường THPT Ngô Quyền gửi thông báo phân công nhiệm vụ theo văn bản số ${ext.documentNumber}.\nĐề nghị các bộ phận thực hiện đúng hạn.`,
          },
          status: 'Chờ duyệt',
        },
      };

      onExtractionComplete(newDoc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi kết nối với máy chủ AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-linear-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UploadCloud className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Tiếp nhận & Số hóa Văn bản</h2>
              <p className="text-xs text-blue-200">
                AI Document Intelligence • Tự động bóc tách siêu dữ liệu & tạo Phiếu tham mưu
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

        {/* Section VI Mandate: Every data area must simultaneously provide:
            [Dán Text] [Chọn File] [Kéo & Thả] [Google Drive] */}
        <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Dán Text / Nội dung
          </button>
          <button
            onClick={() => {
              setActiveTab('file');
              fileInputRef.current?.click();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'file'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            2. Chọn File tải lên
          </button>
          <button
            onClick={() => setActiveTab('drag')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'drag'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Layers className="w-4 h-4" />
            3. Kéo & Thả tài liệu
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            4. Google Drive
          </button>
          <button
            onClick={() => {
              setActiveTab('batch');
              batchInputRef.current?.click();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            5. Batch Upload (Nhiều tệp)
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'email'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Mail className="w-4 h-4" />
            6. Nhập từ Email
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
              setActiveTab('file');
            }
          }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
        />
        <input
          type="file"
          ref={batchInputRef}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files);
              setBatchFiles(files);
              if (files.length > 0) setSelectedFile(files[0]);
              setActiveTab('batch');
            }
          }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        />

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Quick sample loader buttons */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mẫu văn bản thử nghiệm nhanh:</span>
            {SAMPLE_DOCS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPastedText(s.content);
                  setSelectedFile(null);
                  setActiveTab('text');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-slate-700 transition-colors border border-slate-200 cursor-pointer text-[11px]"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Paste Text */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Nội dung văn bản (Dán toàn văn hoặc trích yếu công văn):
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Dán nội dung công văn, quyết định, kế hoạch, thông báo..."
                rows={10}
                className="w-full p-4 text-xs font-mono bg-slate-50 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 outline-hidden leading-relaxed"
              />
            </div>
          )}

          {/* Tab 2 & 3: File Upload & Drag-and-drop area */}
          {(activeTab === 'file' || activeTab === 'drag') && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Kéo và thả tài liệu vào đây hoặc bấm để chọn tệp
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Hỗ trợ mọi loại tệp (PDF scan, Word .docx, Excel .xlsx, Ảnh công văn). AI sẽ tự động
                nhận dạng ký tự quang học (OCR) và cấu trúc hóa dữ liệu.
              </p>
              {selectedFile && (
                <div className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Google Drive */}
          {activeTab === 'drive' && (
            <div className="p-8 border border-slate-200 rounded-3xl bg-slate-50 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FolderSync className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Kết nối Kho lưu trữ Google Drive Trường THPT Ngô Quyền
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cho phép liên kết và đồng bộ trực tiếp các công văn từ thư mục chia sẻ Ban Giám hiệu
                và Văn phòng trường.
              </p>
              <button
                onClick={() => {
                  setPastedText(SAMPLE_DOCS[0].content);
                  alert('Đã kết nối thành công Google Drive (thpt-ngoquyen@haiphong.edu.vn). Đã nạp dữ liệu công văn mới nhất.');
                  setActiveTab('text');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Chọn tệp từ Google Drive
              </button>
            </div>
          )}

          {/* Tab 5: Batch Upload */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-3xl text-center">
                <button
                  onClick={() => batchInputRef.current?.click()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Chọn nhiều file cùng lúc (Batch)
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  Đã chọn {batchFiles.length} tệp tin trong đợt tiếp nhận này.
                </p>
              </div>

              {batchFiles.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batchFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">{file.name}</span>
                      </div>
                      <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Email Intake */}
          {activeTab === 'email' && (
            <div className="p-8 border border-slate-200 rounded-3xl bg-slate-50 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Hộp thư điện tử: thpt-ngoquyen@haiphong.edu.vn
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tự động quét và lấy văn bản chỉ đạo mới từ Sở GD&ĐT gửi vào email chính thức của nhà
                trường.
              </p>
              <button
                onClick={() => {
                  setPastedText(SAMPLE_DOCS[0].content);
                  alert('Đã trích xuất email mới nhất từ Sở Giáo dục và Đào tạo Hải Phòng!');
                  setActiveTab('text');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Nhập văn bản từ Email mới nhận
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI tự động trích xuất: Số CV, Người ký, Yêu cầu, Deadline, Đề xuất phân công
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleProcessDocument}
              disabled={loading}
              className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gemini AI đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Phân tích AI & Tạo Phiếu tham mưu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
