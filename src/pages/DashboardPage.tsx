import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Bell,
  BookOpen,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Flame,
  QrCode
} from 'lucide-react';
import {
  PageView,
  Announcement,
  Assignment,
  ClassSchedule,
  DutySchedule,
  CalendarEvent,
  GlobalMessage,
  MemoryItem,
  WebsiteSetting
} from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  onOpenShareModal: () => void;
  announcements: Announcement[];
  assignments: Assignment[];
  schedules: ClassSchedule[];
  duties: DutySchedule[];
  events: CalendarEvent[];
  messages: GlobalMessage[];
  memories: MemoryItem[];
  settings: WebsiteSetting;
  membersCount: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenShareModal,
  announcements,
  assignments,
  schedules,
  duties,
  events,
  messages,
  memories,
  settings,
  membersCount,
}) => {
  const { profile, user } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [todayName, setTodayName] = useState<string>('Senin');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDateString(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );

      const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      setTodayName(daysMap[now.getDay()]);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today schedules
  const todaySchedules = schedules.filter((s) => s.day === todayName);
  // Today duty
  const todayDuty = duties.find((d) => d.day === todayName);
  // Pending assignments (next 3)
  const upcomingAssignments = assignments.slice(0, 3);
  // Latest announcement
  const latestAnnouncement = announcements[0];
  // Recent message
  const recentMessage = messages[messages.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Clock Bar */}
      <div className="relative glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PORTAL AKTIF • KELAS 8F GALAXY</span>
            </div>

            <h1 className="font-galaxy font-extrabold text-2xl sm:text-4xl text-white">
              Halo,{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                {profile?.displayName || 'Sahabat 8F'}!
              </span>{' '}
              👋
            </h1>

            <p className="mt-1 text-sm text-slate-300">
              Selamat datang di ruang kemudi kelas 8F. Tetap semangat, kompak, dan berprestasi!
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-200 font-mono">
                Wali Kelas: {settings.homeroomTeacher || 'BUK BIBA'}
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                {settings.creator || 'CREATED BY THOZ — WAKLENG'}
              </span>
            </div>
          </div>

          {/* Real-time Clock Card */}
          <div className="flex flex-col items-start md:items-end p-4 rounded-2xl bg-[#07041a]/90 border border-purple-500/30 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>WAKTU REAL-TIME</span>
            </div>
            <div className="font-galaxy font-black text-3xl sm:text-4xl text-white tracking-wider my-1 text-glow-cyan">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-xs text-slate-300 font-medium">{currentDateString}</div>
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('anggota')}
          className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-200/70 font-mono">Total Siswa 8F</p>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">
                {membersCount > 0 ? membersCount : 32}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            Lihat daftar anggota <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => onNavigate('tugas')}
          className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-cyan-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-200/70 font-mono">Tugas & PR Aktif</p>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">
                {assignments.length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            Cek tenggat tugas <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => onNavigate('pengumuman')}
          className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-pink-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-pink-200/70 font-mono">Pengumuman</p>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">
                {announcements.length}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-pink-600/20 text-pink-400 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            Informasi kelas <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={onOpenShareModal}
          className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-emerald-400/40 transition-all cursor-pointer group bg-gradient-to-br from-emerald-950/20 to-purple-950/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-200/70 font-mono">Akses Cepat</p>
              <h3 className="font-galaxy font-extrabold text-lg text-emerald-300 mt-1">
                Scan QR Web
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-emerald-300/80 flex items-center gap-1">
            Bagikan ke HP teman <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Main Grid: Jadwal Hari Ini & Piket Hari Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Jadwal Pelajaran Hari Ini & Tugas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jadwal Pelajaran Hari Ini */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/25">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-galaxy font-bold text-base text-white">
                    Jadwal Pelajaran Hari Ini ({todayName})
                  </h3>
                  <p className="text-xs text-purple-300/70">Mata pelajaran aktif hari ini</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('jadwal-pelajaran')}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl bg-[#0d0928]/80 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-purple-400/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-500/30 flex items-center justify-center font-galaxy text-xs font-bold text-purple-300">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{item.subject}</h4>
                        <p className="text-xs text-slate-400">
                          {item.room ? `Ruang: ${item.room}` : 'Ruang 8F'}
                          {item.notes ? ` • ${item.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-200 text-xs font-mono shrink-0 self-start sm:self-auto">
                      {item.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-xl bg-purple-950/20 border border-purple-500/15">
                  <Sparkles className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                  <p className="text-sm font-semibold text-purple-200">
                    Tidak ada jadwal pelajaran hari ini ({todayName})
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Waktunya istirahat atau belajar mandiri!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tugas Mendatang */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/25">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-galaxy font-bold text-base text-white">Latihan Soal & Tugas PR</h3>
                  <p className="text-xs text-purple-300/70">Pantau latihan soal dan tugas agar tidak terlambat</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('tugas')}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Buka Menu Tugas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((task) => {
                  const isDone = user ? task.completedBy?.includes(user.uid) : false;
                  const isLatihan = task.type === 'latihan' || task.title.toLowerCase().includes('latihan') || task.title.toLowerCase().includes('soal');
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-[#0d0928]/80 border border-purple-500/20 hover:border-purple-400/40 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            isLatihan
                              ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold'
                              : 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                          }`}>
                            {isLatihan ? 'Latihan Soal' : 'Tugas PR'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-purple-500/20 text-slate-300 text-[10px] font-mono">
                            {task.subject}
                          </span>
                          <span className="text-xs text-rose-300 font-mono">
                            Tenggat: {task.dueDate}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-white">{task.title}</h4>
                        <p className="text-xs text-slate-300 line-clamp-1">{task.description}</p>
                      </div>

                      <div className="shrink-0 pt-1">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Belum
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center rounded-xl bg-purple-950/20 border border-purple-500/15">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-emerald-200">
                    Tidak ada tugas yang tertunda!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Kerja bagus seluruh siswa 8F!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Piket Hari Ini, Wali Kelas, Quick Chat */}
        <div className="space-y-6">
          {/* Piket Hari Ini Card */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/25">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-emerald-500/20">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-galaxy font-bold text-base text-white">
                  Petugas Piket ({todayName})
                </h3>
                <p className="text-xs text-emerald-300/70">Jaga kebersihan kelas 8F</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {todayDuty ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {todayDuty.members.map((member, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-medium"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/15 text-xs text-slate-300">
                    <strong>Tugas Hari Ini:</strong> {todayDuty.tasks}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  Tidak ada jadwal piket hari ini.
                </p>
              )}

              <button
                onClick={() => onNavigate('jadwal-piket')}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cek Seluruh Hari Piket
              </button>
            </div>
          </div>

          {/* Wali Kelas Highlight Card */}
          <div className="glass-card rounded-2xl p-5 border border-purple-500/25 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>WALI KELAS 8F</span>
            </div>

            <div className="flex items-center space-x-3.5">
              <img
                src={
                  settings.homeroomTeacherPhoto ||
                  'https://api.dicebear.com/7.x/bottts/svg?seed=BukBiba8F'
                }
                alt="Wali Kelas Buk Biba"
                className="w-14 h-14 rounded-xl object-cover border-2 border-purple-400/40 shrink-0"
              />
              <div>
                <h4 className="font-galaxy font-extrabold text-lg text-white">
                  {settings.homeroomTeacher || 'BUK BIBA'}
                </h4>
                <p className="text-xs text-purple-300/80">Wali Kelas Tercinta 8F</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic">
              “Disiplin, saling menghargai, dan jangan pernah berhenti berusaha meraih impianmu.”
            </p>
          </div>

          {/* Quick Chat Bubble Banner */}
          <div className="glass-card rounded-2xl p-5 border border-purple-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-galaxy font-bold text-white">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>CHAT GLOBAL KELAS</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {recentMessage ? (
              <div className="p-3 rounded-xl bg-[#090520] border border-purple-500/20 text-xs">
                <p className="font-semibold text-purple-300">{recentMessage.senderName}:</p>
                <p className="text-slate-200 line-clamp-2 mt-0.5">"{recentMessage.text}"</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Belum ada obrolan hari ini. Jadilah yang pertama!</p>
            )}

            <button
              onClick={() => onNavigate('chat-global')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-900/40"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Masuk ke Chat Global
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
