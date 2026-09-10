import React, { useState } from 'react';
import { X, GitCompare, ArrowRight, ShieldCheck, Check, Clock } from 'lucide-react';
import { AdvisorySheet } from '../types';

interface VersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  advisorySheet: AdvisorySheet | null;
}

export const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  isOpen,
  onClose,
  advisorySheet,
}) => {
  if (!isOpen || !advisorySheet) return null;

  const versions = advisorySheet.versions || [
    {
      version: 'V1',
      author: 'Gemini 3.8 Flash (AI)',
      timestamp: advisorySheet.createdAt,
      changesSummary: 'Trích xuất công văn gốc và phân công tự động',
      opinion: advisorySheet.executiveOpinion,
      tasksCount: advisorySheet.tasks.length,
    },
    {
      version: 'V2',
      author: 'TS. Đỗ Thị Lan (Hiệu trưởng)',
      timestamp: new Date().toISOString(),
      changesSummary: 'Điều chỉnh rút ngắn thời hạn nộp sản phẩm trước 2 ngày',
      opinion: advisorySheet.executiveOpinion + ' (Đã bổ sung chỉ đạo đôn đốc trực tiếp tại giao ban thứ Hai).',
      tasksCount: advisorySheet.tasks.length,
    },
  ];

  const [vLeft, setVLeft] = useState(versions[0]?.version || 'V1');
  const [vRight, setVRight] = useState(versions[versions.length - 1]?.version || 'V2');

  const leftItem = versions.find((v) => v.version === vLeft) || versions[0];
  const rightItem = versions.find((v) => v.version === vRight) || versions[versions.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              So Sánh Phiên Bản Phiếu Tham Mưu (Human-in-the-loop Diff View)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selectors */}
        <div className="flex items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Bản gốc (Trước):</span>
            <select
              value={vLeft}
              onChange={(e) => setVLeft(e.target.value)}
              className="p-1.5 bg-white border border-slate-200 rounded-xl"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  {v.version} - {v.author}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Bản duyệt (Sau):</span>
            <select
              value={vRight}
              onChange={(e) => setVRight(e.target.value)}
              className="p-1.5 bg-white border border-slate-200 rounded-xl"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  {v.version} - {v.author}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Original / V1 */}
          <div className="p-4 bg-red-50/40 rounded-2xl border border-red-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800">
                Phiên bản {leftItem?.version} ({leftItem?.author})
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(leftItem?.timestamp || '').toLocaleTimeString('vi-VN')}
              </span>
            </div>

            <div className="text-xs text-slate-500 italic">
              Thay đổi: {leftItem?.changesSummary}
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-700 uppercase">Ý kiến chỉ đạo:</div>
              <div className="p-3 bg-white rounded-xl border border-red-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {leftItem?.opinion}
              </div>
            </div>

            <div className="text-xs text-slate-600 font-semibold">
              Số nhiệm vụ phân bổ: {leftItem?.tasksCount || 0} việc
            </div>
          </div>

          {/* Right: Adjusted / V2 */}
          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                Phiên bản {rightItem?.version} ({rightItem?.author})
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(rightItem?.timestamp || '').toLocaleTimeString('vi-VN')}
              </span>
            </div>

            <div className="text-xs text-emerald-700 font-medium">
              Thay đổi: {rightItem?.changesSummary}
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-700 uppercase">Ý kiến chỉ đạo đã sửa:</div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                {rightItem?.opinion}
              </div>
            </div>

            <div className="text-xs text-slate-600 font-semibold">
              Số nhiệm vụ phân bổ: {rightItem?.tasksCount || 0} việc
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Đóng so sánh
          </button>
        </div>
      </div>
    </div>
  );
};
