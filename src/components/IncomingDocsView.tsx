import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Search,
  Filter,
  Plus,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  Eye,
  Layers,
} from 'lucide-react';
import { DocumentItem, UserProfile } from '../types';

interface IncomingDocsViewProps {
  documents?: DocumentItem[];
  onOpenIntake: () => void;
  onOpenAdvisory: (doc: DocumentItem) => void;
  onSelectDoc: (doc: DocumentItem) => void;
  initialFilter?: string;
  currentUser?: UserProfile;
}

export const IncomingDocsView: React.FC<IncomingDocsViewProps> = ({
  documents = [],
  onOpenIntake,
  onOpenAdvisory,
  onSelectDoc,
  initialFilter,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(initialFilter || 'ALL');

  const safeDocs = documents || [];
  const incomingDocs = safeDocs.filter((d) => d && d.docType === 'Văn bản đến');

  const filteredDocs = incomingDocs.filter((d) => {
    if (!d) return false;
    if (searchTerm && !d.title.toLowerCase().includes(searchTerm.toLowerCase()) && !d.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedUrgency !== 'ALL' && d.urgency !== selectedUrgency) return false;
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'NEW') return d.issueDate >= '2026-09-01';
      if (d.status !== selectedStatus) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">Sổ Quản Lý Văn Bản Đến</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tiếp nhận công văn từ Sở GD&ĐT, Bộ GD&ĐT, UBND Thành phố và các cơ quan hữu quan
          </p>
        </div>

        <button
          onClick={onOpenIntake}
          className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tiếp nhận & Số hóa công văn
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo số công văn, trích yếu, người ký..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-hidden"
          >
            <option value="ALL">Độ khẩn: Tất cả</option>
            <option value="Hỏa tốc">Hỏa tốc</option>
            <option value="Thượng khẩn">Thượng khẩn</option>
            <option value="Khẩn">Khẩn</option>
            <option value="Bình thường">Bình thường</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-hidden"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="NEW">Văn bản mới</option>
            <option value="Mới tiếp nhận">Mới tiếp nhận</option>
            <option value="Chờ BGH duyệt">Chờ BGH duyệt</option>
            <option value="Đã duyệt & giao việc">Đã duyệt & giao việc</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-blue-100 text-blue-900">
                  Số: {doc.documentNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    doc.urgency === 'Hỏa tốc'
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : doc.urgency === 'Khẩn' || doc.urgency === 'Thượng khẩn'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {doc.urgency}
                </span>
                <span className="text-xs text-slate-400">
                  {doc.issuingAgency} • Ngày ban hành: {doc.issueDate}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {doc.version}
                </span>
              </div>

              <h3
                onClick={() => onSelectDoc(doc)}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {doc.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{doc.summary}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span>Người ký: {doc.signer} ({doc.signerTitle})</span>
                <span>•</span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Hạn xử lý: {doc.deadline}
                </span>
                {doc.attachments && doc.attachments.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Paperclip className="w-3 h-3" /> {doc.attachments.length} tệp đính kèm
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenAdvisory(doc)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Phiếu tham mưu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
