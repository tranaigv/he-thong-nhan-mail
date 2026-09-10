import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { DocumentItem, TaskItem, ReportItem } from '../types';

interface SearchAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  documents: DocumentItem[];
  tasks: TaskItem[];
  reports: ReportItem[];
  onSelectDoc: (doc: DocumentItem) => void;
  onSelectTask: (task: TaskItem) => void;
}

export const SearchAiModal: React.FC<SearchAiModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  documents,
  tasks,
  reports,
  onSelectDoc,
  onSelectTask,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [answer, setAnswer] = useState<string | null>(null);
  const [referencedItems, setReferencedItems] = useState<{ docs: DocumentItem[]; tasks: TaskItem[] }>({
    docs: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleExecuteSearch(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const SUGGESTED_QUERIES = [
    'Trong tháng 9 Sở giao trường những nhiệm vụ nào?',
    'Có báo cáo nào hết hạn trong tuần tới?',
    'Tổ Toán đang có bao nhiêu việc?',
    'Công văn nào quy định về giáo dục hướng nghiệp?',
    'Những nhiệm vụ nào đang bị quá hạn?',
  ];

  const handleExecuteSearch = async (queryString: string) => {
    if (!queryString.trim()) return;
    setLoading(true);
    setAnswer(null);

    // Build context string from documents and tasks
    const context = `
VĂN BẢN TRONG HỆ THỐNG:
${documents.map((d) => `- Số: ${d.documentNumber}, Tên: "${d.title}", Cơ quan: ${d.issuingAgency}, Hạn: ${d.deadline}, Trạng thái: ${d.status}, Tóm tắt: ${d.summary}`).join('\n')}

NHIỆM VỤ ĐANG TRIỂN KHAI:
${tasks.map((t) => `- Mã: ${t.code}, Tên: "${t.title}", Phụ trách: ${t.owner}, Bộ phận: ${t.department}, Hạn: ${t.deadline}, Trạng thái: ${t.status}, Tiến độ: ${t.progress}%`).join('\n')}
    `;

    try {
      const response = await fetch('/api/ai/search-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryString,
          context,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setAnswer(data.answer);

      // Match linked items
      const lower = queryString.toLowerCase();
      const matchedDocs = documents.filter(
        (d) =>
          d.title.toLowerCase().includes(lower) ||
          d.documentNumber.toLowerCase().includes(lower) ||
          data.answer.toLowerCase().includes(d.documentNumber.toLowerCase()),
      );
      const matchedTasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.code.toLowerCase().includes(lower) ||
          data.answer.toLowerCase().includes(t.code.toLowerCase()),
      );

      setReferencedItems({
        docs: matchedDocs.length > 0 ? matchedDocs : documents.slice(0, 2),
        tasks: matchedTasks.length > 0 ? matchedTasks : tasks.slice(0, 2),
      });
    } catch (err: any) {
      setAnswer('Xin lỗi, không thể kết nối tới Trợ lý AI. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Search Box */}
        <div className="p-5 bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-base font-bold font-serif">Trợ lý Hỏi đáp Dữ liệu Trường THPT Ngô Quyền</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(query)}
              placeholder="Nhập câu hỏi tự nhiên bằng tiếng Việt (Ví dụ: 'Sở giao nhiệm vụ gì trong tháng 9?')..."
              className="w-full pl-11 pr-24 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-semibold outline-hidden shadow-inner"
            />
            <button
              onClick={() => handleExecuteSearch(query)}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tra cứu'}
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-blue-200 font-medium mr-1">Gợi ý:</span>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(q);
                  handleExecuteSearch(q);
                }}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg text-[11px] transition-colors border border-white/10"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Content & AI Answer */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Gemini AI đang tổng hợp dữ liệu toàn trường...
              </p>
            </div>
          )}

          {!loading && answer && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                <div className="text-xs font-bold text-blue-900 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Câu trả lời từ Trợ lý AI:
                </div>
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {answer}
                </div>
              </div>

              {/* Linked items */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Dữ liệu liên quan phát hiện trong kho:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {referencedItems.docs.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        onSelectDoc(d);
                        onClose();
                      }}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-white transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">{d.documentNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{d.title}</p>
                    </div>
                  ))}

                  {referencedItems.tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSelectTask(t);
                        onClose();
                      }}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-white transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">{t.code}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{t.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !answer && (
            <div className="py-12 text-center text-xs text-slate-400">
              Nhập câu hỏi hoặc chọn một trong các gợi ý trên để bắt đầu tra cứu thông minh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
