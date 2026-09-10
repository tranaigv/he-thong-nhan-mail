import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  HelpCircle,
  ChevronDown,
  Shield,
  User,
  Key,
  LogOut,
  UploadCloud,
  FileText,
  Mail,
  CheckCircle2,
  Sparkles,
  School,
  ExternalLink,
  Palette,
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';

export interface TopBarProps {
  currentUser: UserProfile;
  allUsers?: UserProfile[];
  users?: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  notifications?: NotificationItem[];
  unreadCount?: number;
  onMarkNotificationRead?: (id: string) => void;
  onOpenIntake: () => void;
  onOpenTaskCreate?: () => void;
  onOpenEmailCompose?: () => void;
  onOpenReportCreate?: () => void;
  onOpenSearchAi: (initialQuery?: string) => void;
  onOpenThemeCustomizer?: () => void;
  onOpenProfile?: () => void;
  onOpenHelp?: () => void;
  onNavigate?: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  allUsers,
  users,
  onSwitchUser,
  notifications = [],
  unreadCount: propUnreadCount,
  onMarkNotificationRead = (_id: string) => {},
  onOpenIntake,
  onOpenTaskCreate = () => {},
  onOpenEmailCompose = () => {},
  onOpenReportCreate = () => {},
  onOpenSearchAi,
  onOpenThemeCustomizer,
  onOpenProfile = () => {},
  onOpenHelp = () => {},
  onNavigate = (_tab: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>('Tất cả');

  const userList = allUsers || users || [];
  const safeNotifs = notifications || [];
  const unreadCount =
    typeof propUnreadCount === 'number'
      ? propUnreadCount
      : safeNotifs.filter((n) => !n.read).length;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onOpenSearchAi(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const filteredNotifs =
    selectedNotifFilter === 'Tất cả'
      ? safeNotifs
      : safeNotifs.filter((n) => n.type === selectedNotifFilter);

  return (
    <header className="h-22 md:h-24 px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between shadow-xs transition-all">
      {/* Brand & School Emblem */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-linear-to-br from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200 border-2 border-amber-300/40">
            <School className="w-7 h-7 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 font-serif">
                NQ OFFICE <span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                THPT Ngô Quyền
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Văn phòng số & Điều hành thông minh
            </p>
          </div>
        </div>
      </div>

      {/* Central Large Search Bar (Section XXVI) */}
      <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="topbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm công văn, nhiệm vụ, báo cáo hoặc hỏi AI..."
            className="w-full pl-11 pr-28 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-hidden shadow-inner-xs"
          />
          <button
            onClick={() => onOpenSearchAi(searchQuery.trim() || undefined)}
            className="absolute inset-y-1.5 right-1.5 px-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Hỏi AI
          </button>
        </div>
      </div>

      {/* Right Controls: Quick Add, Notifications, Role Switcher, Help, Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Search on Mobile */}
        <button
          onClick={() => onOpenSearchAi()}
          className="lg:hidden p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Tìm kiếm & Hỏi AI"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            id="quick-add-btn"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Thao tác nhanh</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showQuickAdd && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenIntake();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">Tiếp nhận văn bản mới</div>
                  <div className="text-xs text-slate-400">Dán text, upload file, AI trích xuất</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenTaskCreate();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-medium">Giao nhiệm vụ mới</div>
                  <div className="text-xs text-slate-400">Phân công tổ hoặc cá nhân</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenEmailCompose();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-medium">Dự thảo email AI</div>
                  <div className="text-xs text-slate-400">Gửi thông báo công vụ</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenReportCreate();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-medium">Lập báo cáo định kỳ</div>
                  <div className="text-xs text-slate-400">Tuần, tháng, học kỳ, AI checker</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications (Section XXIV) */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Trung tâm thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Thông báo hệ thống ({notifications.length})
                </div>
                <button
                  onClick={() => notifications.forEach((n) => onMarkNotificationRead(n.id))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Đọc tất cả
                </button>
              </div>

              {/* Filter pills */}
              <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs border-b border-slate-100">
                {['Tất cả', 'Văn bản mới', 'Nhiệm vụ mới', 'Sắp đến hạn', 'Quá hạn', 'Yêu cầu duyệt'].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedNotifFilter(f)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedNotifFilter === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không có thông báo nào
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.targetType === 'doc') onNavigate('incoming-docs');
                        else if (n.targetType === 'task') onNavigate('tasks');
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                          !n.read ? 'bg-blue-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                        <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {n.content}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.createdAt}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Selector (Crucial for testing all 10 roles in ToR) */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Đổi vai trò người dùng trải nghiệm"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline max-w-[120px] truncate">{currentUser.roleTitle}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chuyển vai trò thử nghiệm (RBAC)
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {userList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentUser.id === user.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user.roleTitle} • {user.department}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Customizer Palette */}
        {onOpenThemeCustomizer && (
          <button
            onClick={onOpenThemeCustomizer}
            className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Tùy biến giao diện & Màu sắc"
          >
            <Palette className="w-5 h-5 text-indigo-600" />
          </button>
        )}

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Trợ giúp & Tài liệu hướng dẫn"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Round Avatar (Section XXVII: 48–56 px) */}
        <div className="relative">
          <button
            id="user-avatar-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full p-0.5 border-2 border-blue-500/40 hover:border-blue-600 shadow-sm transition-all overflow-hidden cursor-pointer active:scale-95"
            title={`${currentUser.name} (${currentUser.roleTitle})`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800 text-sm truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-blue-600 font-medium truncate">
                    {currentUser.roleTitle}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentUser.department}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  Xem hồ sơ & Thông tin cá nhân
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('ai-settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Cài đặt Trợ lý AI
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Key className="w-4 h-4 text-slate-500" />
                  Giao diện & Cài đặt hệ thống
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    alert(`Đã đăng xuất tài khoản ${currentUser.name}. Hệ thống sẽ quay về chế độ khách.`);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
