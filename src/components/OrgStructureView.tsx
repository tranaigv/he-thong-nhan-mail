import React from 'react';
import { Building, Users, Shield, Award, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

interface OrgStructureViewProps {
  users: UserProfile[];
}

export const OrgStructureView: React.FC<OrgStructureViewProps> = ({ users }) => {
  const bghUsers = users.filter((u) => u.department === 'Ban Giám hiệu');
  const officeUsers = users.filter((u) => u.department.includes('Văn phòng') || u.department.includes('Kế toán'));
  const mathUsers = users.filter((u) => u.department === 'Tổ Toán - Tin học');
  const literatureUsers = users.filter((u) => u.department === 'Tổ Ngữ văn');
  const scienceUsers = users.filter((u) => u.department.includes('KHTN'));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-black text-slate-900 font-serif">
            Cơ Cấu Tổ Chức Trường THPT Ngô Quyền
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Sơ đồ phân cấp điều hành: Ban Giám hiệu → Văn phòng & Kế toán → 7 Tổ chuyên môn
        </p>
      </div>

      {/* Hierarchical Visual Flow */}
      <div className="space-y-6">
        {/* Tier 1: Ban Giám hiệu */}
        <div className="p-6 bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-3xl shadow-md space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Shield className="w-4 h-4" />
            Cấp 1: Ban Giám Hiệu Nhà Trường
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bghUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 flex items-center gap-3"
              >
                <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="text-sm font-bold">{u.name}</h4>
                  <div className="text-xs text-amber-300 font-medium">{u.roleTitle}</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">{u.fieldsOfWork.slice(0, 2).join(' • ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Văn phòng & Kế toán */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Cấp 2: Văn Phòng & Tài Chính - Kế Toán
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {officeUsers.map((u) => (
              <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                  <div className="text-xs text-blue-600 font-medium">{u.roleTitle}</div>
                  <div className="text-[11px] text-slate-400">{u.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Các tổ chuyên môn */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Cấp 3: Các Tổ Chuyên Môn Giảng Dạy (7 Tổ)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-2">
              <div className="font-bold text-xs text-blue-900">Tổ Toán - Tin học</div>
              <div className="text-xs text-slate-600">Tổ trưởng: Thầy Nguyễn Văn Tuấn</div>
              <div className="text-[11px] text-slate-400">18 giáo viên phụ trách 3 khối</div>
            </div>

            <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-2">
              <div className="font-bold text-xs text-purple-900">Tổ Ngữ Văn</div>
              <div className="text-xs text-slate-600">Tổ trưởng: Cô Vũ Thị Hoài</div>
              <div className="text-[11px] text-slate-400">16 giáo viên phụ trách 3 khối</div>
            </div>

            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <div className="font-bold text-xs text-emerald-900">Tổ Khoa Học Tự Nhiên</div>
              <div className="text-xs text-slate-600">Tổ trưởng: Thầy Đặng Quốc Bảo</div>
              <div className="text-[11px] text-slate-400">Vật lý, Hóa học, Sinh học, STEM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
