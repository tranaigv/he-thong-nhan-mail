import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Bot,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  FileText,
  Eye,
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogViewProps {
  logs: AuditLogItem[];
  onOpenDiff?: (log: AuditLogItem) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, onOpenDiff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState<'ALL' | 'HUMAN' | 'AI'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (searchTerm && !log.details.toLowerCase().includes(searchTerm.toLowerCase()) && !log.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (actorFilter === 'HUMAN' && log.actorType !== 'HUMAN') return false;
    if (actorFilter === 'AI' && log.actorType !== 'AI') return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">
              Nhật Ký & Truy Vết Kiểm Toán (Audit Trail)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân định rõ ràng: Hành động của AI vs Hành động của Con người (Human-in-the-loop)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Người: {logs.filter((l) => l.actorType === 'HUMAN').length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI: {logs.filter((l) => l.actorType === 'AI').length}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo nội dung hành động, tên cán bộ hoặc AI..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActorFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              actorFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActorFilter('HUMAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
              actorFilter === 'HUMAN' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <User className="w-3 h-3" />
            Chỉ con người
          </button>
          <button
            onClick={() => setActorFilter('AI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
              actorFilter === 'AI' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Bot className="w-3 h-3" />
            Chỉ AI
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  log.actorType === 'AI'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {log.actorType === 'AI' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      log.actorType === 'AI'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {log.actorType === 'AI' ? 'GEMINI ENGINE' : 'CÁN BỘ / LÃNH ĐẠO'}
                  </span>
                  <span className="font-bold text-slate-900">{log.userName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700">{log.action}</span>
                </div>

                <p className="text-slate-600 leading-relaxed">{log.details}</p>

                {log.documentNumber && (
                  <div className="text-[11px] text-blue-600 font-mono font-medium">
                    Hồ sơ liên quan: {log.documentNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</div>
              </div>

              {log.diffData && onOpenDiff && (
                <button
                  onClick={() => onOpenDiff(log)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem Diff
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
