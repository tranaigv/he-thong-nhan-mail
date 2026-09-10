import React, { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Send,
  Download,
  Eye,
  Edit3,
} from 'lucide-react';
import { DocumentItem, UserProfile } from '../types';

interface OutgoingDocsViewProps {
  documents?: DocumentItem[];
  currentUser: UserProfile;
  onCreateOutgoingDoc: (doc: DocumentItem) => void;
}

export const OutgoingDocsView: React.FC<OutgoingDocsViewProps> = ({
  documents = [],
  currentUser,
  onCreateOutgoingDoc,
}) => {
  const safeDocs = documents || [];
  const outgoingDocs = safeDocs.filter((d) => d && d.docType === 'Văn bản đi');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState(`216/BC-THPTNQ`);
  const [recipients, setRecipients] = useState('Sở Giáo dục và Đào tạo TP. Hải Phòng');
  const [summary, setSummary] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentItem = {
      id: `DOC-OUT-${Date.now().toString().slice(-4)}`,
      documentNumber: docNumber,
      title: title.trim(),
      issuingAgency: 'Trường THPT Ngô Quyền',
      signer: 'TS. Đỗ Thị Lan',
      signerTitle: 'Hiệu trưởng',
      issueDate: new Date().toISOString().split('T')[0],
      urgency: 'Bình thường',
      confidentiality: 'Thường',
      status: 'Chờ BGH duyệt',
      summary: summary || 'Báo cáo/Công văn phát hành của Trường THPT Ngô Quyền.',
      legalReferences: ['Luật Giáo dục năm 2019'],
      recipients: recipients.split(',').map((r) => r.trim()),
      attachments: ['Dự_thảo_văn_bản_phát_hành.docx'],
      version: 'V1',
      docType: 'Văn bản đi',
      createdAt: new Date().toISOString(),
    };
    onCreateOutgoingDoc(newDoc);
    setShowCreateModal(false);
    setTitle('');
    setSummary('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">Sổ Quản Lý Văn Bản Đi</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình phát hành: Dự thảo → Trình duyệt → Sửa → Ký số → Phát hành → Lưu kho số
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Soạn dự thảo văn bản đi
        </button>
      </div>

      {/* Lifecycle stages illustration */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs">
        <div className="p-2 bg-blue-50 text-blue-700 rounded-xl font-bold">1. Dự thảo</div>
        <div className="p-2 bg-amber-50 text-amber-700 rounded-xl font-bold">2. Trình duyệt</div>
        <div className="p-2 bg-purple-50 text-purple-700 rounded-xl font-bold">3. Tiếp thu & Sửa</div>
        <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl font-bold">4. Ký số BGH</div>
        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold">5. Cấp số & Đóng dấu</div>
        <div className="p-2 bg-slate-100 text-slate-700 rounded-xl font-bold">6. Phát hành & Lưu</div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {outgoingDocs.map((doc) => (
          <div key={doc.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-indigo-100 text-indigo-900">
                  Số: {doc.documentNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {doc.status}
                </span>
                <span className="text-xs text-slate-400">Ngày phát hành: {doc.issueDate}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{doc.summary}</p>
              <div className="text-[11px] text-slate-500">
                Nơi nhận: {doc.recipients?.join(', ') || 'Sở GD&ĐT'} • Người ký: {doc.signer} ({doc.signerTitle})
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => alert(`Tải bản ký số công văn: ${doc.documentNumber}`)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải bản ký số
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Soạn thảo dự thảo Văn bản đi
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số / Ký hiệu dự kiến:</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trích yếu nội dung:</label>
              <textarea
                required
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Báo cáo công tác bồi dưỡng giáo viên Chương trình GDPT 2018..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nơi nhận:</label>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
              >
                Trình Ban Giám hiệu duyệt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
