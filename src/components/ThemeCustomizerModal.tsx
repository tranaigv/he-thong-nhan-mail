import React, { useState } from 'react';
import { Palette, X, Check, Sparkles, Sliders } from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrimaryColor: string;
  onColorChange: (colorHex: string) => void;
}

const PRESET_PALETTES = [
  { name: 'Xanh Hải Quân (Mặc định THPT Ngô Quyền)', hex: '#1e3a8a', desc: 'Uy nghiêm, chỉ đạo điều hành' },
  { name: 'Xanh Ngọc Lục Bảo (Emerald)', hex: '#059669', desc: 'Thân thiện, giáo dục bền vững' },
  { name: 'Tím Hoàng Gia (Royal Indigo)', hex: '#4f46e5', desc: 'Hiện đại, sáng tạo & công nghệ' },
  { name: 'Đỏ Thắm Truyền Thống', hex: '#991b1b', desc: 'Hào khí lịch sử Ngô Quyền' },
  { name: 'Hổ Phách Ấm Áp (Warm Amber)', hex: '#d97706', desc: 'Tập trung, năng động' },
  { name: 'Xanh Thép Slate Executive', hex: '#334155', desc: 'Trầm tĩnh, chuẩn mực văn phòng' },
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentPrimaryColor,
  onColorChange,
}) => {
  const [customHex, setCustomHex] = useState(currentPrimaryColor);

  if (!isOpen) return null;

  const handleApplyCustom = (color: string) => {
    setCustomHex(color);
    onColorChange(color);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Tùy Biến Bảng Màu & Giao Diện 3D Soft UI
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Palettes */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Bảng màu quy chuẩn:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESET_PALETTES.map((preset) => (
              <button
                key={preset.hex}
                onClick={() => handleApplyCustom(preset.hex)}
                className={`p-3 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                  currentPrimaryColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-xl shrink-0 shadow-xs flex items-center justify-center"
                  style={{ backgroundColor: preset.hex }}
                >
                  {currentPrimaryColor.toLowerCase() === preset.hex.toLowerCase() && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Hex input */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Mã màu tùy chỉnh (Custom Hex Code):
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleApplyCustom(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => handleApplyCustom(e.target.value)}
              placeholder="#1e3a8a"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
            />
          </div>
        </div>

        {/* 3D Soft UI Preview Component */}
        <div className="p-4 rounded-2xl border border-slate-200 space-y-2 bg-slate-50">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Xem trước tương tác:</div>
          <div className="flex items-center gap-3">
            <button
              style={{ backgroundColor: currentPrimaryColor }}
              className="px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Nút hành động chính
            </button>
            <div
              style={{ color: currentPrimaryColor }}
              className="text-xs font-bold"
            >
              Văn bản chỉ đạo nổi bật
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
