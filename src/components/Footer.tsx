import React from 'react';
import { Sparkles, Heart, Shield, QrCode, Globe } from 'lucide-react';
import { PageView } from '../types';

interface FooterProps {
  onNavigate: (page: PageView) => void;
  onOpenShareModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenShareModal }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-purple-500/25 bg-[#040212]/95 backdrop-blur-xl text-slate-300">
      {/* Top subtle neon light line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.7)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Identity & Tagline */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-400 p-[1.5px]">
                <div className="w-full h-full bg-[#07051d] rounded-[10px] flex items-center justify-center font-galaxy font-extrabold text-sm text-purple-300">
                  8F
                </div>
              </div>
              <div>
                <h3 className="font-galaxy font-extrabold text-lg text-white tracking-wider">
                  8F WEB CLASS
                </h3>
                <p className="text-xs text-purple-300/80 font-mono">GALAXY PREMIUM EDITION</p>
              </div>
            </div>

            <p className="text-sm text-purple-200/90 italic font-medium">
              “ONE CLASS, ONE FAMILY, ONE FUTURE.”
            </p>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Pusat informasi, komunikasi, dokumentasi, dan kebersamaan digital seluruh anggota kelas 8F.
              Membangun ruang belajar modern yang kreatif, tertib, dan kompak menuju masa depan gemilang.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono">
                WALI KELAS: BUK BIBA
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
                CREATED BY THOZ — WAKLENG
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-galaxy text-sm font-bold text-white uppercase tracking-wider text-purple-300">
              Navigasi Cepat
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('beranda')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Dashboard Kelas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pengumuman')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Pengumuman Resmi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jadwal-pelajaran')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Jadwal Pelajaran
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jadwal-piket')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Jadwal Piket
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tugas')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Tugas & PR
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Share */}
          <div className="space-y-3 text-xs">
            <h4 className="font-galaxy text-sm font-bold text-white uppercase tracking-wider text-cyan-300">
              Akses & Berbagi
            </h4>
            <p className="text-slate-400">
              Scan barcode QR Code untuk membuka website di ponsel tanpa repot mengetik link:
            </p>
            <button
              onClick={onOpenShareModal}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 rounded-xl text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              Tampilkan QR Code Web
            </button>

            <div className="pt-2 text-[11px] text-slate-500">
              Kompatibel di Android, iPhone, Tablet & Laptop
            </div>
          </div>
        </div>

        {/* Bottom Official Stamp */}
        <div className="pt-8 mt-8 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-mono text-center sm:text-left">
            <span>© {currentYear} <strong>8F WEB CLASS</strong>. All rights reserved.</span>
            <span className="hidden sm:inline text-purple-500">•</span>
            <span className="text-purple-300 font-semibold">Created by THOZ — WAKLENG</span>
            <span className="hidden sm:inline text-purple-500">•</span>
            <span className="text-cyan-300">Wali Kelas: BUK BIBA</span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-purple-400/80">ONE CLASS, ONE FAMILY, ONE FUTURE.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
