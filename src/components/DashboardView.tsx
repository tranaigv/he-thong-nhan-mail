import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Building,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  FileSearch,
  BellRing,
  Award,
} from 'lucide-react';
import { DocumentItem, TaskItem, ReportItem, UserProfile } from '../types';

interface DashboardViewProps {
  documents?: DocumentItem[];
  tasks?: TaskItem[];
  reports?: ReportItem[];
  users?: UserProfile[];
  currentUser?: UserProfile;
  onNavigate?: (tab: string, filter?: string) => void;
  onOpenIntake?: () => void;
  onOpenTaskCreate?: () => void;
  onOpenSearchAi?: (query?: string) => void;
  onOpenAdvisory?: (doc: DocumentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents = [],
  tasks = [],
  reports = [],
  users = [],
  currentUser,
  onNavigate = (_tab: string, _filter?: string) => {},
  onOpenIntake = () => {},
  onOpenTaskCreate = () => {},
  onOpenSearchAi = (_query?: string) => {},
  onOpenAdvisory = (_doc: DocumentItem) => {},
}) => {
  const safeDocs = documents || [];
  const safeTasks = tasks || [];
  const safeReports = reports || [];

  // Metrics calculation
  const newDocsToday = safeDocs.filter((d) => d && d.issueDate >= '2026-09-01').length;
  const unhandledDocs = safeDocs.filter(
    (d) => d && (d.status === 'Mới tiếp nhận' || d.status === 'Đã xử lý AI'),
  ).length;
  const pendingBghApprovalDocs = safeDocs.filter((d) => d && d.status === 'Chờ BGH duyệt').length;

  const newTasks = safeTasks.filter((t) => t && t.status === 'MỚI').length;
  const inProgressTasks = safeTasks.filter((t) => t && t.status === 'ĐANG LÀM').length;
  const upcomingTasks = safeTasks.filter((t) => {
    if (!t || t.status === 'HOÀN THÀNH') return false;
    const diffDays = Math.ceil(
      (new Date(t.deadline).getTime() - new Date('2026-09-09').getTime()) / (1000 * 3600 * 24),
    );
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const overdueTasks = safeTasks.filter((t) => t && t.status === 'QUÁ HẠN').length;
  const completedTasks = safeTasks.filter((t) => t && t.status === 'HOÀN THÀNH').length;
  const completionRate =
    safeTasks.length > 0 ? Math.round((completedTasks / safeTasks.length) * 100) : 0;
  const pendingReportsCount = safeReports.filter((r) => r && r.status === 'Chờ duyệt').length;

  // Group tasks by Department
  const departmentWorkload: Record<string, { total: number; done: number; inProgress: number }> = {};
  safeTasks.forEach((t) => {
    if (!t) return;
    const dept = t.department || 'Bộ phận khác';
    if (!departmentWorkload[dept]) {
      departmentWorkload[dept] = { total: 0, done: 0, inProgress: 0 };
    }
    departmentWorkload[dept].total += 1;
    if (t.status === 'HOÀN THÀNH') departmentWorkload[dept].done += 1;
    if (t.status === 'ĐANG LÀM') departmentWorkload[dept].inProgress += 1;
  });

  // Top individual workload
  const individualWorkload: Record<string, { name: string; count: number; overdue: number }> = {};
  safeTasks.forEach((t) => {
    if (!t) return;
    const key = t.owner;
    if (!individualWorkload[key]) {
      individualWorkload[key] = { name: t.owner, count: 0, overdue: 0 };
    }
    individualWorkload[key].count += 1;
    if (t.status === 'QUÁ HẠN') individualWorkload[key].overdue += 1;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Welcome Banner with 3D Soft UI */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl shadow-blue-900/15 border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-md border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Trợ lý tham mưu số đang hoạt động • Năm học 2026–2027
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-serif">
              Kính chào {currentUser?.name || 'Thầy/Cô'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Hệ thống NQ Office AI đã đồng bộ toàn bộ công văn Sở GD&ĐT Hải Phòng, tự động trích
              xuất nhiệm vụ và đang hỗ trợ Ban Giám hiệu theo dõi tiến độ công việc toàn trường.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenIntake}
              className="px-4 py-3 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tiếp nhận văn bản
            </button>
            <button
              onClick={() => onOpenSearchAi('Tình hình nhiệm vụ và công văn mới')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Hỏi AI Nhà trường
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Module Dashboard Metric Grid (Section V: Drill-down clickable stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
        {/* Metric 1: Văn bản mới hôm nay */}
        <div
          onClick={() => onNavigate('incoming-docs', 'NEW')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
              Văn bản mới
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{newDocsToday}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
            Bấm để xem danh sách <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 2: Văn bản chưa xử lý */}
        <div
          onClick={() => onNavigate('ai-inbox')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors">
              Chưa xử lý
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{unhandledDocs}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            AI Inbox chờ tham mưu <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 3: Chờ BGH duyệt */}
        <div
          onClick={() => onNavigate('approvals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-purple-600 transition-colors">
              Chờ BGH duyệt
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{pendingBghApprovalDocs}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
            Phiếu tham mưu chờ ký <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 4: Sắp đến hạn */}
        <div
          onClick={() => onNavigate('tasks', 'UPCOMING')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-orange-600 transition-colors">
              Sắp đến hạn
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{upcomingTasks}</div>
          <div className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
            Trong vòng 7 ngày <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 5: Quá hạn */}
        <div
          onClick={() => onNavigate('tasks', 'OVERDUE')}
          className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs hover:shadow-md hover:border-red-400 transition-all cursor-pointer group bg-red-50/20"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-red-600">Quá hạn</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{overdueTasks}</div>
          <div className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
            Cần đôn đốc ngay <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 6: Nhiệm vụ mới */}
        <div
          onClick={() => onNavigate('tasks', 'MỚI')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-cyan-600 transition-colors">
              Nhiệm vụ mới
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{newTasks}</div>
          <div className="text-[11px] text-cyan-600 font-medium mt-1 flex items-center gap-1">
            Xem việc chưa giao <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 7: Đang làm */}
        <div
          onClick={() => onNavigate('tasks', 'ĐANG LÀM')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
              Đang thực hiện
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{inProgressTasks}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            Theo dõi tiến độ <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 8: Chờ báo cáo */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
              Chờ báo cáo
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{pendingReportsCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
            Báo cáo định kỳ <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 9: Đã hoàn thành */}
        <div
          onClick={() => onNavigate('tasks', 'HOÀN THÀNH')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
              Đã hoàn thành
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{completedTasks}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            Sản phẩm đã nộp <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Metric 10: Tỷ lệ hoàn thành */}
        <div
          onClick={() => onNavigate('statistics')}
          className="bg-linear-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-xs font-semibold">Tỷ lệ hoàn thành</span>
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-black">{completionRate}%</div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Workload by Org, Upcoming Deadlines, Important Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Workload by Department & Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workload by Department (Công việc theo tổ) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Công việc theo Tổ / Bộ phận
                </h2>
              </div>
              <button
                onClick={() => onNavigate('organization')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Xem chi tiết cơ cấu <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {Object.entries(departmentWorkload).map(([deptName, stats]) => {
                const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                return (
                  <div key={deptName} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        {deptName}
                      </span>
                      <span className="text-slate-500">
                        {stats.done}/{stats.total} hoàn thành ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Incoming Documents awaiting BGH Review */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Văn bản mới cần xử lý & duyệt tham mưu
                </h2>
              </div>
              <button
                onClick={() => onNavigate('incoming-docs')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Tất cả văn bản <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        Số: {doc.documentNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          doc.urgency === 'Hỏa tốc'
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : doc.urgency === 'Khẩn'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {doc.urgency}
                      </span>
                      <span className="text-xs text-slate-400">
                        {doc.issuingAgency} • {doc.issueDate}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {doc.title}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{doc.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenAdvisory(doc)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Phiếu tham mưu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Deadline Schedule & Individual Workload */}
        <div className="space-y-6">
          {/* Deadline Calendar snippet (Lịch deadline) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Hạn xử lý sắp tới (Deadlines)
                </h2>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Xem lịch
              </button>
            </div>

            <div className="space-y-3">
              {tasks
                .filter((t) => t.status !== 'HOÀN THÀNH')
                .slice(0, 4)
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onNavigate('tasks')}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-500">{task.code}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Hạn: {task.deadline}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Chủ trì: {task.owner}</span>
                      <span className="font-semibold text-blue-600">{task.progress}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Workload by Person (Công việc theo cá nhân) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Cán bộ phụ trách trọng tâm
                </h2>
              </div>
              <button
                onClick={() => onNavigate('users')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Danh sách
              </button>
            </div>

            <div className="space-y-2.5">
              {Object.values(individualWorkload)
                .slice(0, 5)
                .map((ind, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {ind.name.split(' ').slice(-1)[0][0]}
                      </div>
                      <div className="text-xs font-medium text-slate-800">{ind.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {ind.count} việc
                      </span>
                      {ind.overdue > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md">
                          {ind.overdue} trễ
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
