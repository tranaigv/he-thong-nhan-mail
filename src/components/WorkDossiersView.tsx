import React, { useState } from 'react';
import {
  FolderArchive,
  FileText,
  CheckCircle2,
  Mail,
  Paperclip,
  Clock,
  Plus,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WorkDossier, UserProfile } from '../types';

interface WorkDossiersViewProps {
  dossiers?: WorkDossier[];
  currentUser: UserProfile;
}

export const WorkDossiersView: React.FC<WorkDossiersViewProps> = ({ dossiers = [], currentUser }) => {
  const safeDossiers = dossiers || [];
  const [selectedDossier, setSelectedDossier] = useState<WorkDossier | null>(
    safeDossiers.length > 0 ? safeDossiers[0] : null,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">
              Kho Hồ Sơ Công Việc Tập Trung
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Module số hóa hồ sơ theo Điều XVII: Gom toàn bộ văn bản, nhiệm vụ, email, minh chứng giáo
            viên nộp, biên bản và báo cáo
          </p>
        </div>

        <button
          onClick={() => alert('Đang mở form khởi tạo Hồ sơ công việc mới!')}
          className="px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tạo Hồ sơ mới
        </button>
      </div>

      {/* Grid: Dossier list on left, Full Dossier Package on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dossiers List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase px-2">
            Danh mục Hồ sơ ({dossiers.length})
          </div>

          <div className="space-y-2">
            {safeDossiers.map((dos) => (
              <div
                key={dos.id}
                onClick={() => setSelectedDossier(dos)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedDossier?.id === dos.id
                    ? 'bg-blue-50 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {dos.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {dos.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{dos.title}</h3>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Năm học: {dos.schoolYear}</span>
                  <span>{dos.department}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Dossier Full Container Contents */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedDossier ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              Chưa có hồ sơ nào được chọn
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-100 text-amber-900">
                    {selectedDossier.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Năm học: {selectedDossier.schoolYear} • Ngày lập: {selectedDossier.createdDate}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 font-serif mt-1">
                  {selectedDossier.title}
                </h2>
              </div>

              {/* Sub-section 1: Công văn liên quan */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. Văn bản pháp lý & Công văn gốc ({selectedDossier.documents?.length || 0})
                </h3>
                <div className="space-y-2">
                  {(selectedDossier.documents || []).map((d) => (
                    <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                      <div className="font-medium text-slate-800">
                        <span className="font-mono text-blue-600 mr-2">{d.number}:</span>
                        {d.title}
                      </div>
                      <span className="text-[11px] text-slate-400">Đã gắn vào hồ sơ</span>
                    </div>
                  ))}
                </div>
              </div>

            {/* Sub-section 2: Nhiệm vụ chi tiết */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                2. Nhiệm vụ & Tiến độ triển khai ({selectedDossier.tasks?.length || 0})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(selectedDossier.tasks || []).map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-600">{t.code}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {t.status}
                      </span>
                    </div>
                    <div className="font-medium text-slate-800">{t.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section 3: Minh chứng giáo viên nộp */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-600" />
                3. Minh chứng & Sản phẩm cán bộ nộp ({selectedDossier.submittedFiles?.length || 0})
              </h3>
              <div className="space-y-1.5">
                {(selectedDossier.submittedFiles || []).map((f, idx) => (
                  <div key={idx} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{f.name}</span>
                      <span className="text-slate-400 ml-2">({f.size}) • Nộp bởi {f.uploadedBy} ngày {f.date}</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold">Đã lưu trữ số</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section 4: Email & Văn bản đi */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                4. Email chỉ đạo & Báo cáo đầu ra
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                {(selectedDossier.emails || []).map((e) => (
                  <div key={e.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-semibold">{e.subject}</span>
                    <span className="text-slate-400 ml-2">({e.sentAt})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
