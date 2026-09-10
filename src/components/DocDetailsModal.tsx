import React from 'react';
import {
  X,
  FileText,
  Clock,
  Building,
  User,
  Paperclip,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onOpenAdvisory: (doc: DocumentItem) => void;
}

export const DocDetailsModal: React.FC<DocDetailsModalProps> = ({
  isOpen,
  onClose,
  document,
  onOpenAdvisory,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-100 text-blue-900">
                {document.documentNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  document.urgency === 'Hỏa tốc'
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {document.urgency}
              </span>
              <span className="text-xs text-slate-400">Phiên bản {document.version}</span>
            </div>
            <h2 className="text-base font-black text-slate-900 font-serif leading-snug">
              {document.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cơ quan ban hành</span>
            <span className="font-bold text-slate-800">{document.issuingAgency}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Người ký</span>
            <span className="font-bold text-slate-800">{document.signer}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Ngày ban hành</span>
            <span className="font-bold text-slate-800">{document.issueDate}</span>
          </div>

          <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100">
            <span className="text-red-600 block text-[10px] uppercase font-bold">Hạn xử lý</span>
            <span className="font-bold text-red-800">{document.deadline}</span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
          <div className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Tóm tắt trích yếu AI:
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">{document.summary}</p>
        </div>

        {/* Legal References & Reporting requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-700 uppercase text-[10px]">Căn cứ pháp lý:</span>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              {document.legalReferences?.map((ref, idx) => (
                <li key={idx}>{ref}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-700 uppercase text-[10px]">Yêu cầu báo cáo Sở:</span>
            <p className="text-slate-600 leading-relaxed">
              {document.reportingRequirements || 'Báo cáo văn bản đúng hạn theo quy định chuyên môn.'}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {document.attachments && document.attachments.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase text-[10px]">Tệp đính kèm:</span>
            <div className="flex flex-wrap gap-2">
              {document.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>{att}</span>
                  <Download className="w-3.5 h-3.5 text-blue-600 cursor-pointer ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full OCR Text View */}
        {document.ocrText && (
          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 uppercase text-[10px]">
              Văn bản toàn văn đã bóc tách OCR:
            </span>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {document.ocrText}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenAdvisory(document);
            }}
            className="px-5 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Mở Phiếu tham mưu AI
          </button>
        </div>
      </div>
    </div>
  );
};
