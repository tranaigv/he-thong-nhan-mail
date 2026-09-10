import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Shield,
  Phone,
  Mail,
  Edit2,
  Lock,
  Unlock,
  Download,
  Upload,
  Building,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface UserManagementViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onAddUser: (user: UserProfile) => void;
  onSwitchUser: (user: UserProfile) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onUpdateUser,
  onAddUser,
  onSwitchUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('GIAO_VIEN');
  const [roleTitle, setRoleTitle] = useState('Giáo viên');
  const [dept, setDept] = useState('Tổ Toán - Tin học');

  const filteredUsers = users.filter((u) => {
    if (searchTerm && !u.name.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedDept !== 'ALL' && u.department !== selectedDept) return false;
    return true;
  });

  const handleToggleLock = (user: UserProfile) => {
    const updated: UserProfile = {
      ...user,
      status: user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE',
    };
    onUpdateUser(updated);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      const updated: UserProfile = {
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        roleTitle,
        department: dept,
      };
      onUpdateUser(updated);
      setEditingUser(null);
    } else {
      const newUser: UserProfile = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '0900.000.000',
        role,
        roleTitle,
        department: dept,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        fieldsOfWork: ['Giảng dạy', 'Công tác chuyên môn'],
        status: 'ACTIVE',
      };
      onAddUser(newUser);
      setShowAddModal(false);
    }

    setName('');
    setEmail('');
    setPhone('');
  };

  const handleExportExcel = () => {
    const rows = [
      ['Mã NV', 'Họ và tên', 'Email', 'Chức vụ', 'Tổ / Bộ phận', 'Trạng thái'],
      ...users.map((u) => [u.id, u.name, u.email, u.roleTitle, u.department, u.status]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Danh_sach_can_bo_THPT_Ngo_Quyen.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">
              Quản Trị Người Dùng & Phân Quyền (RBAC)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            10 vai trò điều hành: Ban Giám hiệu, Văn thư, Kế toán, Tổ trưởng chuyên môn, Giáo viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel
          </button>
          <button
            onClick={() => {
              setEditingUser(null);
              setName('');
              setEmail('');
              setPhone('');
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm tài khoản
          </button>
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
            placeholder="Tìm theo họ tên, email cán bộ giáo viên..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-hidden focus:border-blue-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-hidden"
        >
          <option value="ALL">Tất cả Tổ/Bộ phận</option>
          <option value="Ban Giám hiệu">Ban Giám hiệu</option>
          <option value="Văn phòng">Văn phòng</option>
          <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
          <option value="Tổ Toán - Tin học">Tổ Toán - Tin học</option>
          <option value="Tổ Ngữ văn">Tổ Ngữ văn</option>
          <option value="Tổ KHTN (Lý - Hóa - Sinh)">Tổ KHTN</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5 relative"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{user.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-blue-600 truncate">{user.roleTitle}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.department}</div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onSwitchUser(user)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng vai {user.roleTitle}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setName(user.name);
                    setEmail(user.email);
                    setPhone(user.phone);
                    setRole(user.role);
                    setRoleTitle(user.roleTitle);
                    setDept(user.department);
                    setShowAddModal(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Sửa thông tin"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleLock(user)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    user.status === 'ACTIVE'
                      ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                      : 'text-red-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                >
                  {user.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUser}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingUser ? 'Chỉnh sửa tài khoản cán bộ' : 'Thêm tài khoản cán bộ mới'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: ThS. Hoàng Văn Nam"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namhv@thpt-ngoquyen.edu.vn"
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912.xxx.xxx"
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò hệ thống:</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setRole(r);
                    if (r === 'HIEU_TRUONG') setRoleTitle('Hiệu trưởng');
                    else if (r === 'PHO_HIEU_TRUONG') setRoleTitle('Phó Hiệu trưởng');
                    else if (r === 'VAN_THU') setRoleTitle('Văn thư');
                    else if (r === 'KE_TOAN') setRoleTitle('Kế toán');
                    else if (r === 'TO_TRUONG') setRoleTitle('Tổ trưởng chuyên môn');
                    else if (r === 'GV_CHU_NHIEM') setRoleTitle('Giáo viên chủ nhiệm');
                    else setRoleTitle('Giáo viên');
                  }}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="HIEU_TRUONG">Hiệu trưởng</option>
                  <option value="PHO_HIEU_TRUONG">Phó Hiệu trưởng</option>
                  <option value="VAN_THU">Văn thư</option>
                  <option value="KE_TOAN">Kế toán</option>
                  <option value="TO_TRUONG">Tổ trưởng</option>
                  <option value="GV_CHU_NHIEM">GV Chủ nhiệm</option>
                  <option value="GIAO_VIEN">Giáo viên</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổ / Phòng ban:</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                  <option value="Văn phòng">Văn phòng</option>
                  <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
                  <option value="Tổ Toán - Tin học">Tổ Toán - Tin học</option>
                  <option value="Tổ Ngữ văn">Tổ Ngữ văn</option>
                  <option value="Tổ KHTN (Lý - Hóa - Sinh)">Tổ KHTN</option>
                  <option value="Tổ KHXH (Sử - Địa - GDCD)">Tổ KHXH</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
              >
                Lưu tài khoản
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
