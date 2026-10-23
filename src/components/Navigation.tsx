import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  User,
  Users,
  MessageSquare,
  MessagesSquare,
  Sparkles,
  Image as ImageIcon,
  Video,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  Vote,
  Inbox,
  ShieldCheck,
  Award,
  Info,
  Settings,
  ShieldAlert,
  LogOut,
  LogIn,
  Menu,
  X,
  MoreVertical,
  QrCode,
  Share2,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { PageView } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenShareModal: () => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  onOpenShareModal,
  unreadCount = 0,
}) => {
  const { user, profile, isAdmin, isSuperAdmin, loginWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainNavItems: { id: PageView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'beranda', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Bell className="w-4 h-4" /> },
    { id: 'chat-global', label: 'Chat Global', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'tugas', label: 'Tugas & PR', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'jadwal-pelajaran', label: 'Jadwal Pelajaran', icon: <Clock className="w-4 h-4" /> },
    { id: 'jadwal-piket', label: 'Jadwal Piket', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'kalender', label: 'Kalender Kelas', icon: <Calendar className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { id: PageView; label: string; icon: React.ReactNode }[] = [
    { id: 'profil', label: 'Profil Saya', icon: <User className="w-4 h-4" /> },
    { id: 'anggota', label: 'Anggota Kelas', icon: <Users className="w-4 h-4" /> },
    { id: 'chat-pribadi', label: 'Chat Pribadi', icon: <MessagesSquare className="w-4 h-4" /> },
    { id: 'kenangan', label: 'Kenangan Kelas', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'galeri-foto', label: 'Galeri Foto', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'galeri-video', label: 'Galeri Video', icon: <Video className="w-4 h-4" /> },
    { id: 'polling', label: 'Polling Kelas', icon: <Vote className="w-4 h-4" /> },
    { id: 'kotak-saran', label: 'Kotak Saran', icon: <Inbox className="w-4 h-4" /> },
    { id: 'peraturan', label: 'Peraturan Kelas', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'pencapaian', label: 'Pencapaian Kelas', icon: <Award className="w-4 h-4" /> },
    { id: 'tentang', label: 'Tentang Website', icon: <Info className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelectPage = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 bg-[#060318]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleSelectPage('beranda')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-400 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-md shadow-purple-600/30">
              <div className="w-full h-full bg-[#08051e] rounded-[10px] flex items-center justify-center">
                <span className="font-galaxy font-extrabold text-base bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  8F
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-galaxy font-black text-base tracking-wider text-white group-hover:text-purple-300 transition-colors">
                  8F WEB CLASS
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-500/40 text-purple-300 font-mono">
                  Galaxy
                </span>
              </div>
              <p className="text-[10px] text-purple-300/70 font-mono hidden md:block">
                CREATED BY THOZ — WAKLENG
              </p>
            </div>
          </div>

          {/* Quick Nav (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavItems.slice(0, 5).map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPage(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-900/50'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Share QR, Admin, User Profile, 3-dots */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Share QR Button */}
            <button
              onClick={onOpenShareModal}
              title="Berbagi Link & QR Code Website"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-purple-950/50 hover:scale-105 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">QR Web</span>
            </button>

            {/* Admin Badge/Link */}
            {isAdmin && (
              <button
                onClick={() => handleSelectPage('admin')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
                    : 'bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* User Auth Info */}
            {user && profile ? (
              <div
                onClick={() => handleSelectPage('profil')}
                className="flex items-center space-x-2 px-2 py-1 rounded-xl bg-slate-900/80 border border-purple-500/25 hover:border-purple-500/50 cursor-pointer transition-colors"
              >
                <img
                  src={
                    profile.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
                  }
                  alt={profile.displayName}
                  className="w-7 h-7 rounded-lg object-cover border border-purple-400/40"
                />
                <div className="hidden xl:block text-left text-xs">
                  <p className="font-medium text-slate-100 max-w-[90px] truncate leading-tight">
                    {profile.displayName}
                  </p>
                  <p className="text-[10px] text-purple-300 font-mono capitalize">
                    {profile.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}

            {/* Animated 3-Dots Menu Button */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  moreMenuOpen
                    ? 'bg-purple-600 text-white border-purple-400 rotate-90 shadow-md shadow-purple-600/40'
                    : 'bg-slate-900/80 text-purple-200 border-purple-500/30 hover:bg-purple-900/50'
                }`}
                aria-label="Menu Tambahan"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* 3-Dots Dropdown */}
              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-purple-500/40 shadow-2xl shadow-purple-950/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-purple-500/20 mb-1">
                    <p className="text-xs font-galaxy text-purple-300 font-bold">MENU KELAS 8F</p>
                    <p className="text-[10px] text-slate-400">One Class, One Family</p>
                  </div>

                  <div className="space-y-0.5 max-h-72 overflow-y-auto">
                    <button
                      onClick={() => handleSelectPage('dashboard')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-400" />
                      Dashboard Utama
                    </button>
                    <button
                      onClick={() => handleSelectPage('anggota')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Users className="w-4 h-4 text-cyan-400" />
                      Anggota Kelas
                    </button>
                    <button
                      onClick={() => handleSelectPage('kenangan')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Kenangan Kelas
                    </button>
                    <button
                      onClick={() => handleSelectPage('galeri-foto')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      Galeri Foto
                    </button>
                    <button
                      onClick={() => handleSelectPage('galeri-video')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Video className="w-4 h-4 text-rose-400" />
                      Galeri Video
                    </button>
                    <button
                      onClick={() => handleSelectPage('polling')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Vote className="w-4 h-4 text-blue-400" />
                      Polling Kelas
                    </button>
                    <button
                      onClick={() => handleSelectPage('kotak-saran')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Inbox className="w-4 h-4 text-indigo-400" />
                      Kotak Saran
                    </button>
                    <button
                      onClick={() => handleSelectPage('peraturan')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      Peraturan Kelas
                    </button>
                    <button
                      onClick={() => handleSelectPage('pencapaian')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Award className="w-4 h-4 text-yellow-400" />
                      Pencapaian Kelas
                    </button>
                    <button
                      onClick={() => handleSelectPage('tentang')}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-slate-200 hover:bg-purple-600/30 hover:text-white transition-colors"
                    >
                      <Info className="w-4 h-4 text-sky-400" />
                      Tentang Website
                    </button>
                    <button
                      onClick={onOpenShareModal}
                      className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-cyan-300 hover:bg-cyan-900/30 transition-colors font-medium"
                    >
                      <QrCode className="w-4 h-4 text-cyan-400" />
                      Bagikan QR Code
                    </button>
                  </div>

                  {user && (
                    <div className="pt-2 border-t border-purple-500/20 mt-1">
                      <button
                        onClick={logout}
                        className="w-full px-3 py-2 rounded-xl text-xs text-left flex items-center gap-2.5 text-rose-300 hover:bg-rose-950/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Keluar Akun
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900/80 text-purple-200 border border-purple-500/30 hover:bg-purple-900/40"
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative ml-auto w-4/5 max-w-sm h-full glass-card border-l border-purple-500/30 p-5 overflow-y-auto flex flex-col justify-between shadow-2xl bg-[#090620]">
            <div>
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center font-galaxy font-extrabold text-white text-xs">
                    8F
                  </div>
                  <div>
                    <h4 className="font-galaxy font-bold text-white text-sm">8F WEB CLASS</h4>
                    <p className="text-[10px] text-purple-300/70 font-mono">CREATED BY THOZ — WAKLENG</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wali Kelas banner badge */}
              <div className="my-3 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-200">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Wali Kelas: <strong className="text-white">BUK BIBA</strong></span>
              </div>

              {/* Share QR banner button in mobile drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShareModal();
                }}
                className="w-full my-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-cyan-400/40 flex items-center justify-between text-xs text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Buka QR Code & Bagikan Web</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Navigation list */}
              <div className="space-y-1 mt-3">
                <p className="text-[10px] font-galaxy uppercase text-purple-400/70 px-2 py-1">
                  Menu Utama
                </p>
                {mainNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPage(item.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentPage === item.id
                        ? 'bg-purple-600/40 text-white font-semibold border border-purple-500/40'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}

                <p className="text-[10px] font-galaxy uppercase text-purple-400/70 px-2 pt-3 pb-1">
                  Fitur Kelas Lainnya
                </p>
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPage(item.id)}
                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentPage === item.id
                        ? 'bg-purple-600/40 text-white font-semibold border border-purple-500/40'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}

                {isAdmin && (
                  <button
                    onClick={() => handleSelectPage('admin')}
                    className="w-full mt-2 px-3 py-2 rounded-xl text-xs flex items-center gap-3 text-rose-300 bg-rose-950/40 border border-rose-500/40 font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Dashboard Admin</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Footer with User Status & Tagline */}
            <div className="pt-4 border-t border-purple-500/20 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <img
                      src={
                        profile?.photoURL ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-lg"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-white">{profile?.displayName}</p>
                      <p className="text-[10px] text-purple-300 font-mono capitalize">
                        {profile?.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full py-2 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Akun
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk dengan Akun Google
                </button>
              )}
              <p className="text-center text-[10px] text-purple-400/60 font-mono mt-3">
                “ONE CLASS, ONE FAMILY, ONE FUTURE.”
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
