import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { UserProfile } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  leader: string;
  participants: string;
  type: 'HOP_BGH' | 'CHUYEN_MON' | 'SO_GDD' | 'HOAT_DONG';
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'EVT-1',
    title: 'Giao ban Ban Giám hiệu đầu tuần: Triển khai nhiệm vụ năm học mới',
    date: '2026-09-14',
    time: '07:30 - 09:00',
    location: 'Phòng họp Hội đồng (Tầng 2)',
    leader: 'TS. Đỗ Thị Lan (Hiệu trưởng)',
    participants: 'Ban Giám hiệu, Thư ký Hội đồng',
    type: 'HOP_BGH',
  },
  {
    id: 'EVT-2',
    title: 'Họp Tổ chuyên môn Toán - Tin: Thống nhất giáo án STEM & thi chọn HSG',
    date: '2026-09-15',
    time: '14:00 - 16:30',
    location: 'Phòng Lab Tin học số 1',
    leader: 'Thầy Nguyễn Văn Tuấn (Tổ trưởng)',
    participants: 'Toàn thể giáo viên Tổ Toán - Tin',
    type: 'CHUYEN_MON',
  },
  {
    id: 'EVT-3',
    title: 'Dự Hội nghị trực tuyến Sở GD&ĐT Hải Phòng về Chuyển đổi số giáo dục',
    date: '2026-09-16',
    time: '08:00 - 11:30',
    location: 'Phòng họp Trực tuyến',
    leader: 'ThS. Trần Văn Minh (PHT)',
    participants: 'Ban Giám hiệu, Quản trị viên CNTT',
    type: 'SO_GDD',
  },
  {
    id: 'EVT-4',
    title: 'Kiểm tra hồ sơ sổ sách giáo án và an toàn vệ sinh trường học',
    date: '2026-09-18',
    time: '14:00 - 17:00',
    location: 'Các phòng ban & phòng chức năng',
    leader: 'Cô Lê Thị Nga (PHT)',
    participants: 'Đoàn kiểm tra nội bộ',
    type: 'HOAT_DONG',
  },
];

interface CalendarViewProps {
  currentUser: UserProfile;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedType, setSelectedType] = useState('ALL');

  const filteredEvents = events.filter((e) => {
    if (selectedType !== 'ALL' && e.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 font-serif">
              Lịch Công Tác Trường THPT Ngô Quyền
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch hội họp, lịch công tác tuần của Ban Giám hiệu, các tổ chuyên môn và sự kiện toàn trường
          </p>
        </div>

        <button
          onClick={() => alert('Đang mở form tạo sự kiện lịch công tác mới!')}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Đăng ký lịch họp
        </button>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800">Tuần 03 (14/09/2026 - 20/09/2026)</span>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tất cả loại lịch</option>
          <option value="HOP_BGH">Họp Ban Giám hiệu</option>
          <option value="CHUYEN_MON">Sinh hoạt chuyên môn</option>
          <option value="SO_GDD">Lịch với Sở GD&ĐT</option>
          <option value="HOAT_DONG">Hoạt động toàn trường</option>
        </select>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  evt.type === 'HOP_BGH'
                    ? 'bg-blue-100 text-blue-800'
                    : evt.type === 'SO_GDD'
                    ? 'bg-purple-100 text-purple-800'
                    : evt.type === 'CHUYEN_MON'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {evt.type === 'HOP_BGH'
                  ? 'Giao ban BGH'
                  : evt.type === 'SO_GDD'
                  ? 'Công tác Sở GD&ĐT'
                  : evt.type === 'CHUYEN_MON'
                  ? 'Tổ chuyên môn'
                  : 'Sự kiện trường'}
              </span>

              <span className="text-xs font-mono font-bold text-slate-500">{evt.date}</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">{evt.title}</h3>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{evt.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{evt.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Chủ trì: {evt.leader}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
