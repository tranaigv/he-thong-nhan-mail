import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  CheckSquare,
  UserCheck,
  Clock,
  FileBarChart,
  Calendar,
  Mail,
  FolderArchive,
  BookOpen,
  FileSpreadsheet,
  Users,
  Building2,
  PieChart,
  History,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../types';

export interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: UserRole;
  pendingApprovalsCount?: number;
  unreadInboxCount?: number;
  myTasksCount?: number;
  newDocsCount?: number;
  pendingTasksCount?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole = 'HIEU_TRUONG',
  pendingApprovalsCount = 0,
  unreadInboxCount = 0,
  myTasksCount = 0,
  newDocsCount = 0,
  pendingTasksCount = 0,
  collapsed,
  onToggleCollapse,
}) => {
  const menuSections = [
    {
      label: 'Điều hành chính',
      items: [
        { id: 'dashboard', label: '1. Tổng quan', icon: LayoutDashboard },
        {
          id: 'ai-inbox',
          label: '2. AI Inbox',
          icon: Inbox,
          badge: unreadInboxCount > 0 ? unreadInboxCount : undefined,
          badgeColor: 'bg-blue-600',
        },
        { id: 'incoming-docs', label: '3. Văn bản đến', icon: ArrowDownLeft },
        { id: 'outgoing-docs', label: '4. Văn bản đi', icon: ArrowUpRight },
      ],
    },
    {
      label: 'Quản lý nhiệm vụ',
      items: [
        { id: 'tasks', label: '5. Giao việc', icon: CheckSquare },
        {
          id: 'my-tasks',
          label: '6. Công việc của tôi',
          icon: UserCheck,
          badge: myTasksCount > 0 ? myTasksCount : undefined,
          badgeColor: 'bg-emerald-600',
        },
        {
          id: 'approvals',
          label: '7. Chờ phê duyệt',
          icon: Clock,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-amber-600',
        },
        { id: 'reports', label: '8. Báo cáo', icon: FileBarChart },
        { id: 'calendar', label: '9. Lịch công việc', icon: Calendar },
        { id: 'email-center', label: '10. Email', icon: Mail },
      ],
    },
    {
      label: 'Dữ liệu & Kho số',
      items: [
        { id: 'dossiers', label: '11. Kho tài liệu & Hồ sơ', icon: FolderArchive },
        { id: 'legal-docs', label: '12. Kho pháp lý', icon: BookOpen },
        { id: 'templates', label: '13. Mẫu biểu', icon: FileSpreadsheet },
      ],
    },
    {
      label: 'Tổ chức & Giám sát',
      items: [
        { id: 'users', label: '14. Người dùng', icon: Users },
        { id: 'organization', label: '15. Tổ/Bộ phận', icon: Building2 },
        { id: 'statistics', label: '16. Thống kê', icon: PieChart },
        { id: 'audit-log', label: '17. Nhật ký hệ thống', icon: History },
      ],
    },
    {
      label: 'Cấu hình',
      items: [
        { id: 'ai-settings', label: '18. AI Settings', icon: Sparkles, highlight: true },
        { id: 'settings', label: '19. Cài đặt', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-20' : 'w-68 md:w-72'
      }`}
    >
      {/* Collapse button header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu điều hành
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mx-auto cursor-pointer"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : item.highlight
                      ? 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-indigo-600'
                        : 'text-slate-500 group-hover:text-blue-600'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${
                        item.badgeColor || 'bg-blue-600'
                      } ${collapsed ? 'absolute top-1 right-1' : ''}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* School Footer info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="text-[11px] text-slate-500 font-medium">
            THPT Ngô Quyền • Hải Phòng
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Phiên bản 3.8.2 • AI Engine Active
          </div>
        </div>
      )}
    </aside>
  );
};
