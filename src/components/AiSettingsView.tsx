import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  Cpu,
  Mail,
  ListTodo,
} from 'lucide-react';
import { AiSettings, UserProfile } from '../types';

interface AiSettingsViewProps {
  settings: AiSettings;
  currentUser: UserProfile;
  onSaveSettings: (settings: AiSettings) => void;
}

export const AiSettingsView: React.FC<AiSettingsViewProps> = ({
  settings,
  currentUser,
  onSaveSettings,
}) => {
  const [model, setModel] = useState(settings.model);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [systemInstructions, setSystemInstructions] = useState(settings.systemInstructions);
  const [automationLevel, setAutomationLevel] = useState(settings.automationLevel);
  const [taskRules, setTaskRules] = useState(settings.taskAssignmentRules);
  const [emailRules, setEmailRules] = useState(settings.emailRules);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const updated: AiSettings = {
      model,
      temperature,
      systemInstructions,
      automationLevel: automationLevel as any,
      taskAssignmentRules: taskRules,
      emailRules,
    };
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">
              Cấu Hình & Tham Số AI Engine
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị mô hình Gemini AI, mức độ tự động hóa và nguyên tắc tham mưu văn bản
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          Lưu Cấu Hình AI
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Đã lưu thành công tham số cấu hình Trợ lý AI NQ Office!
        </div>
      )}

      {/* Model & Temperature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <Cpu className="w-4 h-4 text-blue-600" />
            Mô hình Gemini AI
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phiên bản mô hình:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Tối ưu tốc độ & trích xuất nhanh)</option>
              <option value="gemini-3.1-pro">gemini-3.1-pro (Chuyên sâu lý luận & báo cáo dài)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Độ sáng tạo (Temperature):</span>
              <span className="text-blue-600 font-mono font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.0 (Chính xác tuyệt đối - Khuyên dùng)</span>
              <span>1.0 (Sáng tạo cao)</span>
            </div>
          </div>
        </div>

        {/* 4 Automation Levels Mandate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Mức Độ Tự Động Hóa (4 Mức - Section XXI)
          </div>

          <div className="space-y-2">
            {[
              { level: 1, label: 'Mức 1: Chỉ tư vấn', desc: 'Chỉ gợi ý phân tích, không tự sinh dữ liệu vào hệ thống' },
              { level: 2, label: 'Mức 2: Tạo dự thảo', desc: 'Tự động tạo Phiếu tham mưu và dự thảo email lưu nháp' },
              {
                level: 3,
                label: 'Mức 3: Tạo và chờ duyệt (Khuyên dùng)',
                desc: 'Tạo sẵn nhiệm vụ, phân công, email; bắt buộc Lãnh đạo bấm Duyệt mới phát hành',
              },
              { level: 4, label: 'Mức 4: Tự động cho phép', desc: 'Tự động giao việc đối với công văn hỏa tốc' },
            ].map((item) => (
              <label
                key={item.level}
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  automationLevel === item.level
                    ? 'bg-blue-50 border-blue-400 text-blue-900'
                    : 'bg-slate-50 border-slate-100 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="autoLevel"
                  checked={automationLevel === item.level}
                  onChange={() => setAutomationLevel(item.level as any)}
                  className="mt-0.5 accent-blue-600"
                />
                <div className="text-xs">
                  <div className="font-bold">{item.label}</div>
                  <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* System Prompt & Rules */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Chỉ dẫn hệ thống chung (System Instructions):
          </label>
          <textarea
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            rows={4}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-blue-600" />
              Quy tắc phân công nhiệm vụ tự động:
            </label>
            <textarea
              value={taskRules}
              onChange={(e) => setTaskRules(e.target.value)}
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Quy tắc soạn và gửi email điều hành:
            </label>
            <textarea
              value={emailRules}
              onChange={(e) => setEmailRules(e.target.value)}
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
