import React from 'react';
import {
  Info,
  Code2,
  GraduationCap,
  Sparkles,
  Heart,
  Shield,
  Layers,
  Database,
  Smartphone,
  QrCode
} from 'lucide-react';
import { WebsiteSetting } from '../types';

interface AboutPageProps {
  settings: WebsiteSetting;
  onOpenShareModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onOpenShareModal }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>TENTANG 8F WEB CLASS • GALAXY PREMIUM</span>
        </div>

        <h1 className="font-galaxy font-extrabold text-3xl sm:text-4xl text-white text-glow">
          TENTANG WEBSITE KELAS 8F
        </h1>

        <p className="font-galaxy text-sm sm:text-base text-purple-300 font-bold tracking-widest uppercase">
          “{settings.tagline || 'ONE CLASS, ONE FAMILY, ONE FUTURE.'}”
        </p>
      </div>

      {/* Main Quote Statement */}
      <div className="glass-card rounded-3xl p-8 border border-purple-500/40 text-center relative overflow-hidden shadow-2xl bg-gradient-to-b from-purple-950/30 to-slate-950/90">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <p className="text-base sm:text-xl text-slate-100 font-medium leading-relaxed max-w-3xl mx-auto italic">
          “8F WEB CLASS adalah website digital untuk mendukung komunikasi, informasi, dokumentasi,
          dan kebersamaan kelas 8F. Website ini dikembangkan oleh{' '}
          <strong className="text-purple-300 not-italic font-bold">THOZ — WAKLENG</strong> dengan
          tema Galaxy Premium.”
        </p>
      </div>

      {/* Creator & Wali Kelas Side-by-Side Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Creator THOZ — WAKLENG */}
        <div className="glass-card rounded-2xl p-7 border-2 border-purple-500/40 relative overflow-hidden neon-glow-purple space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>WEBSITE CREATOR</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-700 to-cyan-500 p-0.5 shrink-0 shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-[#08051e] rounded-[14px] flex flex-col items-center justify-center font-galaxy font-extrabold text-white text-xs">
                <span>THOZ</span>
                <span className="text-[9px] text-cyan-300">WAKLENG</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">
                PENGEMBANG & DESAINER
              </span>
              <h3 className="font-galaxy font-black text-xl text-white mt-1 text-glow">
                CREATED BY THOZ — WAKLENG
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Diciptakan dengan dedikasi tinggi untuk memberikan ruang digital terbaik bagi teman-teman
            kelas 8F. Menghadirkan teknologi modern, sinkronisasi real-time antardevais, desain futuristik,
            dan keamanan data terjamin.
          </p>
        </div>

        {/* Wali Kelas BUK BIBA */}
        <div className="glass-card rounded-2xl p-7 border-2 border-cyan-500/40 relative overflow-hidden neon-glow-cyan space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>WALI KELAS 8F</span>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src={
                settings.homeroomTeacherPhoto ||
                'https://api.dicebear.com/7.x/bottts/svg?seed=BukBiba8F'
              }
              alt="Buk Biba"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/50 shrink-0 shadow-lg"
            />
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                GURU PEMBINA RESMI
              </span>
              <h3 className="font-galaxy font-black text-xl text-white mt-1 text-glow-cyan">
                BUK BIBA
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {settings.homeroomTeacherBio ||
              'Membimbing seluruh siswa dan siswi kelas 8F dengan penuh kasih sayang, membina kedisiplinan, dan memotivasi seluruh generasi 8F agar senantiasa berprestasi dan saling menjaga persaudaraan.'}
          </p>
        </div>
      </div>

      {/* Tech Specifications */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/25 space-y-4">
        <h3 className="font-galaxy font-bold text-lg text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          ARSITEKTUR & TEKNOLOGI WEBSITE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-1">
            <p className="font-semibold text-purple-300">Frontend</p>
            <p className="text-slate-300">React 19 & TypeScript, Tailwind CSS, Motion</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-1">
            <p className="font-semibold text-cyan-300">Backend & Cloud</p>
            <p className="text-slate-300">Cloud Firestore Enterprise, Google Cloud Run</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-1">
            <p className="font-semibold text-pink-300">Autentikasi</p>
            <p className="text-slate-300">Firebase Auth & Role-Based Access Control</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-1">
            <p className="font-semibold text-emerald-300">Responsivitas</p>
            <p className="text-slate-300">Mobile-First, Android, iOS, Tablet & Laptop</p>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="text-center p-6 rounded-2xl glass-card border border-cyan-500/30 space-y-3">
        <h3 className="font-galaxy font-bold text-base text-white">
          Ajak Teman Sekelas Bergabung
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Bagikan link atau tampilkan QR Code untuk di-scan teman-teman 8F langsung melalui kamera HP.
        </p>
        <button
          onClick={onOpenShareModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          Buka Barcode & Link QR
        </button>
      </div>
    </div>
  );
};
