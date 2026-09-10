import React, { useState } from 'react';
import {
  Kanban,
  List,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Upload,
  MessageSquare,
  FileText,
  ChevronRight,
  MoreVertical,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { TaskItem, TaskStatus, TaskPriority, UserProfile } from '../types';

interface TaskManagementViewProps {
  tasks?: TaskItem[];
  users?: UserProfile[];
  currentUser: UserProfile;
  onUpdateTask: (task: TaskItem) => void;
  onAddTask?: (task: TaskItem) => void;
  onCreateTask?: (task: TaskItem) => void;
  onOpenReportChecker?: () => void;
  initialFilter?: string;
  isMyTasksOnly?: boolean;
}

const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'MỚI', label: 'MỚI', color: 'text-slate-700', bg: 'bg-slate-100' },
  { id: 'CHỜ DUYỆT', label: 'CHỜ DUYỆT', color: 'text-amber-800', bg: 'bg-amber-50' },
  { id: 'ĐÃ GIAO', label: 'ĐÃ GIAO', color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'ĐANG LÀM', label: 'ĐANG LÀM', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  { id: 'CHỜ KIỂM TRA', label: 'CHỜ KIỂM TRA', color: 'text-purple-700', bg: 'bg-purple-50' },
  { id: 'CẦN BỔ SUNG', label: 'CẦN BỔ SUNG', color: 'text-orange-700', bg: 'bg-orange-50' },
  { id: 'HOÀN THÀNH', label: 'HOÀN THÀNH', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'QUÁ HẠN', label: 'QUÁ HẠN', color: 'text-red-700', bg: 'bg-red-50' },
];

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks = [],
  users = [],
  currentUser,
  onUpdateTask,
  onAddTask,
  onCreateTask,
  onOpenReportChecker,
  initialFilter,
  isMyTasksOnly = false,
}) => {
  const addTaskFn = onAddTask || onCreateTask || (() => {});
  const safeTasks = tasks || [];
  const safeUsers = users || [];

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table' | 'calendar' | 'timeline'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter || 'ALL');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Quick state for creating a task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState(currentUser?.name || 'Cán bộ giáo viên');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-09-25');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Cao');
  const [newTaskOutput, setNewTaskOutput] = useState('');

  // Filter tasks
  const filteredTasks = safeTasks.filter((t) => {
    if (!t) return false;
    if (isMyTasksOnly && currentUser?.name && !t.owner.includes(currentUser.name)) return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase()) && !t.code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedDept !== 'ALL' && t.department !== selectedDept) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'UPCOMING') {
        const diffDays = Math.ceil((new Date(t.deadline).getTime() - new Date('2026-09-09').getTime()) / (1000 * 3600 * 24));
        return diffDays >= 0 && diffDays <= 7 && t.status !== 'HOÀN THÀNH';
      }
      if (selectedStatus === 'OVERDUE') return t.status === 'QUÁ HẠN';
      if (t.status !== selectedStatus) return false;
    }
    return true;
  });

  const handleStatusChange = (task: TaskItem, newStatus: TaskStatus) => {
    const updated: TaskItem = {
      ...task,
      status: newStatus,
      progress: newStatus === 'HOÀN THÀNH' ? 100 : task.progress,
      history: [...task.history, `Chuyển trạng thái sang "${newStatus}" bởi ${currentUser.name}`],
    };
    onUpdateTask(updated);
    if (selectedTask?.id === task.id) setSelectedTask(updated);
  };

  const handleAddComment = () => {
    if (!selectedTask || !newComment.trim()) return;
    const updated: TaskItem = {
      ...selectedTask,
      comments: [
        ...selectedTask.comments,
        {
          id: `CMT-${Date.now()}`,
          author: currentUser.name,
          role: currentUser.roleTitle,
          timestamp: new Date().toLocaleString('vi-VN'),
          content: newComment.trim(),
        },
      ],
    };
    onUpdateTask(updated);
    setSelectedTask(updated);
    setNewComment('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `TSK-${Date.now().toString().slice(-5)}`,
      code: `NV-${Math.floor(100 + Math.random() * 900)}`,
      title: newTaskTitle.trim(),
      description: 'Nhiệm vụ khởi tạo trực tiếp từ Giao diện điều hành',
      owner: newTaskOwner,
      ownerId: users.find((u) => u.name.includes(newTaskOwner))?.id || 'USR-01',
      department: users.find((u) => u.name.includes(newTaskOwner))?.department || 'Tổ chuyên môn',
      collaborators: [],
      approver: 'TS. Đỗ Thị Lan (Hiệu trưởng)',
      assignDate: new Date().toISOString().split('T')[0],
      deadline: newTaskDeadline,
      outputRequired: newTaskOutput || 'Báo cáo kế hoạch triển khai',
      evidenceFiles: [],
      priority: newTaskPriority,
      progress: 0,
      status: 'ĐÃ GIAO',
      comments: [],
      history: [`Giao việc trực tiếp bởi ${currentUser.name} lúc ${new Date().toLocaleString('vi-VN')}`],
    };

    addTaskFn(newTask);
    setShowCreateModal(false);
    setNewTaskTitle('');
    setNewTaskOutput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Bar & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-serif">
            {isMyTasksOnly ? 'Công việc của tôi' : 'Quản lý & Điều hành Nhiệm vụ'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ, kiểm soát hạn xử lý (Deadline) và đánh giá sản phẩm nộp
          </p>
        </div>

        {/* View Mode Buttons (5 Views: List, Table, Kanban, Calendar, Timeline) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban (8 cột)
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Bảng chi tiết
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Lịch
          </button>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Giao nhiệm vụ mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã NV, tên nhiệm vụ, người phụ trách..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-hidden"
          >
            <option value="ALL">Tất cả Tổ/Bộ phận</option>
            <option value="Ban Giám hiệu">Ban Giám hiệu</option>
            <option value="Tổ Toán - Tin học">Tổ Toán - Tin học</option>
            <option value="Tổ Ngữ văn">Tổ Ngữ văn</option>
            <option value="Tổ KHTN (Lý - Hóa - Sinh)">Tổ KHTN</option>
            <option value="Văn phòng">Văn phòng</option>
            <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-hidden"
          >
            <option value="ALL">Độ ưu tiên: Tất cả</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Bình thường">Bình thường</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 outline-hidden"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="UPCOMING">Sắp đến hạn (&lt;= 7 ngày)</option>
            <option value="OVERDUE">Quá hạn</option>
            {KANBAN_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD (8 COLUMNS MANDATE) */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-[1400px]">
            {KANBAN_COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="w-72 shrink-0 bg-slate-100/70 rounded-3xl p-3 border border-slate-200 flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2 py-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                        {col.label}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-white text-[11px] font-bold text-slate-600 flex items-center justify-center shadow-2xs">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Task Cards */}
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {task.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.priority === 'Khẩn cấp'
                                ? 'bg-red-100 text-red-700 animate-pulse'
                                : task.priority === 'Cao'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="truncate max-w-[130px] font-medium">{task.owner}</span>
                            <span className="font-bold text-blue-600">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.deadline}
                          </span>
                          {task.evidenceFiles.length > 0 && (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Đã nộp
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 italic">
                        Trống
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                    {task.code}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{task.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    {task.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Phụ trách: {task.owner}</span>
                  <span>•</span>
                  <span>Đơn vị: {task.department}</span>
                  <span>•</span>
                  <span>Hạn: {task.deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="w-24 text-right">
                  <div className="text-xs font-bold text-slate-700">{task.progress}%</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-blue-600 h-full" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Mã NV</th>
                <th className="p-3.5">Tên nhiệm vụ</th>
                <th className="p-3.5">Người phụ trách</th>
                <th className="p-3.5">Tổ / Bộ phận</th>
                <th className="p-3.5">Hạn xử lý</th>
                <th className="p-3.5">Ưu tiên</th>
                <th className="p-3.5">Tiến độ</th>
                <th className="p-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="p-3.5 font-mono font-bold text-slate-700">{t.code}</td>
                  <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">{t.title}</td>
                  <td className="p-3.5 text-slate-700">{t.owner}</td>
                  <td className="p-3.5 text-slate-500">{t.department}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{t.deadline}</td>
                  <td className="p-3.5 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] ${
                        t.priority === 'Khẩn cấp'
                          ? 'bg-red-100 text-red-700'
                          : t.priority === 'Cao'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{t.progress}%</span>
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-800">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 4: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Lịch Nhiệm vụ Tháng 09/2026</h3>
            <span className="text-xs text-slate-400">Năm học 2026-2027</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
            <div>Chủ Nhật</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-09-${day < 10 ? '0' + day : day}`;
              const dayTasks = filteredTasks.filter((t) => t.deadline === dateStr);
              return (
                <div
                  key={day}
                  className="min-h-24 p-2 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 transition-all text-left"
                >
                  <div className="text-xs font-bold text-slate-700 mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayTasks.map((dt) => (
                      <div
                        key={dt.id}
                        onClick={() => setSelectedTask(dt)}
                        className="px-1.5 py-1 bg-blue-100 hover:bg-blue-600 hover:text-white rounded-md text-[10px] font-bold text-blue-800 truncate cursor-pointer transition-colors"
                        title={dt.title}
                      >
                        {dt.code}: {dt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK DETAIL & PROGRESS SUBMISSION MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-linear-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-white/20 text-white">
                    {selectedTask.code}
                  </span>
                  <h3 className="text-base font-bold truncate max-w-lg">{selectedTask.title}</h3>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Đơn vị: {selectedTask.department} • Phụ trách: {selectedTask.owner}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 text-white/70 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Status and Progress Update */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Cập nhật trạng thái:
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(selectedTask, e.target.value as TaskStatus)}
                    className="w-full mt-1.5 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Tiến độ thực hiện:</span>
                    <span className="text-blue-600">{selectedTask.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={selectedTask.progress}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const updated: TaskItem = {
                        ...selectedTask,
                        progress: val,
                        status: val === 100 ? 'HOÀN THÀNH' : selectedTask.status,
                      };
                      onUpdateTask(updated);
                      setSelectedTask(updated);
                    }}
                    className="w-full mt-3 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Task Details Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Hạn hoàn thành</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedTask.deadline}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Người phê duyệt</div>
                  <div className="font-bold text-slate-800 mt-1">{selectedTask.approver}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Mức ưu tiên</div>
                  <div className="font-bold text-amber-700 mt-1">{selectedTask.priority}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Căn cứ văn bản</div>
                  <div className="font-bold text-blue-700 mt-1">{selectedTask.sourceDocNumber || 'Trực tiếp'}</div>
                </div>
              </div>

              {/* Evidence submission */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-600" />
                    Sản phẩm đầu ra & File minh chứng:
                  </span>
                  <button
                    onClick={() => {
                      const fname = prompt('Nhập tên tệp sản phẩm/minh chứng muốn đính kèm:');
                      if (fname) {
                        const updated: TaskItem = {
                          ...selectedTask,
                          evidenceFiles: [...selectedTask.evidenceFiles, fname],
                          status: 'CHỜ KIỂM TRA',
                          progress: Math.max(selectedTask.progress, 90),
                          history: [...selectedTask.history, `Đính kèm tệp minh chứng: ${fname}`],
                        };
                        onUpdateTask(updated);
                        setSelectedTask(updated);
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải lên minh chứng
                  </button>
                </div>

                <div className="text-xs text-slate-700">
                  <span className="font-bold">Yêu cầu sản phẩm:</span> {selectedTask.outputRequired}
                </div>

                <div className="space-y-1.5">
                  {selectedTask.evidenceFiles.map((file, i) => (
                    <div
                      key={i}
                      className="p-2 bg-white rounded-xl border border-blue-200 text-xs font-medium flex items-center justify-between text-slate-800"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {file}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Đã thẩm định</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion & Comments */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Trao đổi & Ý kiến chỉ đạo ({selectedTask.comments.length})
                </h4>

                <div className="max-h-40 overflow-y-auto space-y-2.5 divide-y divide-slate-100">
                  {selectedTask.comments.map((cmt) => (
                    <div key={cmt.id} className="pt-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-slate-700">{cmt.author} ({cmt.role})</span>
                        <span>{cmt.timestamp}</span>
                      </div>
                      <p className="text-slate-700 mt-1">{cmt.content}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Gửi ý kiến chỉ đạo, báo cáo vướng mắc..."
                    className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Giao nhiệm vụ đột xuất / trực tiếp</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên nhiệm vụ:</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ví dụ: Lập phương án tổ chức thi thử tốt nghiệp THPT đợt 1"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Người phụ trách:</label>
                <select
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                >
                  {users.map((u) => (
                    <option key={u.id} value={`${u.name} (${u.roleTitle})`}>
                      {u.name} ({u.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hạn hoàn thành:</label>
                <input
                  type="date"
                  required
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sản phẩm đầu ra yêu cầu:</label>
              <input
                type="text"
                value={newTaskOutput}
                onChange={(e) => setNewTaskOutput(e.target.value)}
                placeholder="Ví dụ: Kế hoạch phân công coi thi và ma trận đề"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Giao việc ngay
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
