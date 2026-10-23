import React from 'react';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Code2,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { PageView, Announcement, WebsiteSetting } from '../types';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (page: PageView) => void;
  onOpenShareModal: () => void;
  announcements: Announcement[];
  settings: WebsiteSetting;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenShareModal,
  announcements,
  settings,
}) => {
  const { user, loginWithGoogle } = useAuth();
  const latestAnnouncement = announcements[0];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Galaxy decorative glowing blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[600px] h-[340px] md:h-[600px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-cyan-400/20 rounded-full blur-[90px] md:blur-[130px] pointer-events-none -z-10 animate-pulse-glow" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono mb-6 shadow-lg shadow-purple-950/50">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>OFFICIAL CLASS PORTAL • GALAXY PREMIUM</span>
          </div>

          {/* Animated 8F Emblem */}
          <div className="mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[2px] shadow-2xl shadow-purple-600/40 hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#080520] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
              <span className="font-galaxy font-black text-4xl sm:text-5xl bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent tracking-tighter">
                8F
              </span>
              <span className="text-[10px] tracking-widest text-cyan-300 font-mono mt-0.5">
                CLASS
              </span>
            </div>
          </div>

          {/* Welcome Heading */}
          <h1 className="font-galaxy font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-wide leading-tight text-glow">
            WELCOME TO <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
              8F WEB CLASS
            </span>
          </h1>

          {/* Main Tagline */}
          <p className="mt-4 font-galaxy text-lg sm:text-2xl text-purple-200 font-bold tracking-widest uppercase">
            “{settings.tagline || 'ONE CLASS, ONE FAMILY, ONE FUTURE.'}”
          </p>

          {/* Description */}
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Ruang digital terpadu untuk informasi tugas, jadwal pelajaran, dokumentasi kenangan, dan
            komunikasi real-time seluruh siswa dan siswi kelas 8F.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => {
                if (!user) {
                  loginWithGoogle();
                } else {
                  onNavigate('dashboard');
                }
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-galaxy font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-purple-900/50 hover:shadow-purple-700/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>MASUK KE WEBSITE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenShareModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0e0a2b]/90 hover:bg-[#150f3d] border border-cyan-400/40 text-cyan-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>SCAN QR & BAGIKAN WEB</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-2xl text-center border border-purple-500/20">
              <Users className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <p className="font-galaxy text-xl font-bold text-white">32+</p>
              <p className="text-xs text-purple-200/70">Anggota Kelas 8F</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-purple-500/20">
              <Calendar className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
              <p className="font-galaxy text-xl font-bold text-white">6 Hari</p>
              <p className="text-xs text-cyan-200/70">Jadwal & Piket</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-purple-500/20">
              <MessageSquare className="w-5 h-5 mx-auto text-pink-400 mb-1" />
              <p className="font-galaxy text-xl font-bold text-white">Real-Time</p>
              <p className="text-xs text-pink-200/70">Chat & Diskusi</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-purple-500/20">
              <BookOpen className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <p className="font-galaxy text-xl font-bold text-white">Aktif</p>
              <p className="text-xs text-emerald-200/70">Tugas & PR</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cards: Wali Kelas & Creator */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Kartu Wali Kelas 8F (BUK BIBA) */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/30 relative overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-2 text-xs font-mono text-purple-300 uppercase mb-4 tracking-wider">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>PEMBINA & WALI KELAS RESMI</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-purple-400/50 shadow-xl shrink-0">
                <img
                  src={
                    settings.homeroomTeacherPhoto ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=BukBiba8F'
                  }
                  alt="Wali Kelas Buk Biba"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono mb-1">
                  WALI KELAS 8F
                </div>
                <h3 className="font-galaxy font-extrabold text-2xl text-white text-glow-cyan">
                  {settings.homeroomTeacher || 'BUK BIBA'}
                </h3>
                <p className="text-xs text-purple-300/80 font-medium">
                  Ibu Wali Kelas yang Bijaksana & Penuh Kasih Sayang
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {settings.homeroomTeacherBio ||
                    'Membimbing seluruh siswa 8F dengan hati, disiplin, dan dedikasi demi terciptanya generasi yang berprestasi dan berakhlak mulia.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Kartu Website Creator (THOZ — WAKLENG) */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 uppercase mb-4 tracking-wider">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>WEBSITE CREATOR & DEVELOPER</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#12082b] to-[#040f2b] border-2 border-cyan-400/40 p-3 shadow-xl shrink-0 flex flex-col items-center justify-center text-center">
                <Code2 className="w-8 h-8 text-cyan-400 mb-1" />
                <span className="font-galaxy font-bold text-xs text-white">THOZ</span>
                <span className="text-[10px] text-purple-300 font-mono">WAKLENG</span>
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-[11px] font-mono mb-1">
                  DEVELOPED WITH PASSION
                </div>
                <h3 className="font-galaxy font-extrabold text-2xl text-white text-glow">
                  {settings.creator || 'CREATED BY THOZ — WAKLENG'}
                </h3>
                <p className="text-xs text-cyan-300/80 font-medium">
                  Arsitek & Pengembang Web Kelas 8F
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  Mendedikasikan platform modern bertema Galaxy Premium untuk menyatukan komunikasi,
                  tugas, dan memori tak terlupakan seluruh keluarga besar kelas 8F.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcement Banner */}
      {latestAnnouncement && (
        <section className="py-6 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-semibold uppercase">
                  PENGUMUMAN TERBARU
                </span>
                <span className="text-xs text-purple-300/70 font-mono">
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h4 className="font-galaxy font-bold text-base sm:text-lg text-white">
                {latestAnnouncement.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl">
                {latestAnnouncement.content}
              </p>
            </div>

            <button
              onClick={() => onNavigate('pengumuman')}
              className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Baca Selengkapnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Feature Highlights Grid */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white">
            FITUR UNGGULAN GALAXY 8F
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1 font-mono">
            SEMUA KEBUTUHAN KELAS DALAM SATU GENGGAMAN
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('chat-global')}
            className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="p-3 w-fit rounded-xl bg-purple-600/20 text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-galaxy font-bold text-sm text-white mb-1">Chat Real-Time Kelas</h3>
            <p className="text-xs text-slate-300">
              Mengobrol bersama seluruh siswa 8F dengan balasan pesan, reaksi emoji, dan sinkronisasi
              langsung di ponsel & laptop.
            </p>
          </div>

          <div
            onClick={() => onNavigate('tugas')}
            className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="p-3 w-fit rounded-xl bg-cyan-600/20 text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-galaxy font-bold text-sm text-white mb-1">Manajemen Tugas & PR</h3>
            <p className="text-xs text-slate-300">
              Pantau batas tenggat waktu, mata pelajaran, dan tandai tugas yang sudah kamu selesaikan
              secara mandiri.
            </p>
          </div>

          <div
            onClick={() => onNavigate('jadwal-pelajaran')}
            className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="p-3 w-fit rounded-xl bg-pink-600/20 text-pink-400 mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-galaxy font-bold text-sm text-white mb-1">Jadwal & Piket Mingguan</h3>
            <p className="text-xs text-slate-300">
              Jadwal pelajaran interaktif dan jadwal regu piket kebersihan kelas dengan penanda otomatis
              hari ini.
            </p>
          </div>

          <div
            onClick={() => onNavigate('kenangan')}
            className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="p-3 w-fit rounded-xl bg-amber-600/20 text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-galaxy font-bold text-sm text-white mb-1">Kenangan & Galeri</h3>
            <p className="text-xs text-slate-300">
              Simpan album foto dan video momen kebersamaan, pentas seni, perlombaan, dan perpisahan
              kelas yang berharga.
            </p>
          </div>

          <div
            onClick={() => onNavigate('peraturan')}
            className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="p-3 w-fit rounded-xl bg-emerald-600/20 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-galaxy font-bold text-sm text-white mb-1">Tata Tertib & Nilai</h3>
            <p className="text-xs text-slate-300">
              Pedoman norma kelas untuk menjaga kedamaian, persaudaraan tanpa perundungan, dan
              keharmonisan kelas 8F.
            </p>
          </div>

          <div
            onClick={onOpenShareModal}
            className="glass-card p-5 rounded-2xl border border-purple-500/20 hover:border-cyan-400/40 hover:-translate-y-1 transition-all cursor-pointer group bg-gradient-to-br from-purple-950/40 to-slate-900/60"
          >
            <div className="p-3 w-fit rounded-xl bg-cyan-600/20 text-cyan-300 mb-3 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-galaxy font-bold text-sm text-white mb-1">QR Code & Berbagi Web</h3>
            <p className="text-xs text-slate-300">
              Buka barcode langsung untuk discan teman sekelas atau bagikan link ke grup WhatsApp kelas
              dengan 1 sentuhan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
