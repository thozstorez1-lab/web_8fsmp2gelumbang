import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Download, Share2, Smartphone, Globe, ExternalLink, Sparkles, X } from 'lucide-react';

interface ShareQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareQRModal: React.FC<ShareQRModalProps> = ({ isOpen, onClose }) => {
  const defaultShareUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-3hde57w6rklovrlddqharz-1046740859540.asia-southeast1.run.app';

  const [activeUrl, setActiveUrl] = useState<string>(defaultShareUrl);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !activeUrl) return;

    QRCode.toDataURL(
      activeUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0a051d',
          light: '#f5f3ff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, activeUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `8F-WEB-CLASS-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '8F WEB CLASS — Galaxy Premium',
          text: 'Masuk dan bergabung ke website resmi 8F WEB CLASS! One Class, One Family, One Future.',
          url: activeUrl,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  const shareText = encodeURIComponent(
    `🚀 Halo sahabat 8F! Kunjungi website kelas kita *8F WEB CLASS* di:\n${activeUrl}\n\n"ONE CLASS, ONE FAMILY, ONE FUTURE."\nCreated by THOZ — WAKLENG`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 border border-purple-500/40 shadow-2xl shadow-purple-900/30 overflow-hidden">
        {/* Glow ambient background inside modal */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
              <QrCode className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-galaxy font-bold tracking-wide text-white flex items-center gap-1.5">
                BERBAGI WEBSITE 8F
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-purple-300/70">Scan QR Code & Bagikan Link Akses Siswa & Guru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-purple-950/40 to-slate-900/70 border border-purple-500/20">
            <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-purple-400/50 hover:scale-105 transition-transform duration-300">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="8F Web Class QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-500 text-xs">
                  Membuat QR Code...
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-center text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Buka kamera HP Android / iPhone lalu arahkan ke QR di atas
            </p>
          </div>

          {/* URL Input & Copy Button */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-purple-200/80 flex items-center justify-between">
              <span>Link URL Website Kelas:</span>
              <span className="text-[11px] text-purple-400">Siap dibagikan</span>
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={activeUrl}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-purple-100 font-mono focus:outline-none focus:border-purple-400 select-all"
                />
                <Globe className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/40 cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>

          {/* Action Buttons: Download QR & Native Share */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadQR}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-purple-950/70 border border-purple-500/30 rounded-xl text-xs font-medium text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              Unduh Gambar QR
            </button>

            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Bagikan Langsung
            </button>
          </div>

          {/* Social Quick Share */}
          <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between text-xs text-slate-400">
            <span>Kirim via:</span>
            <div className="flex items-center space-x-2">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(activeUrl)}&text=${encodeURIComponent('8F WEB CLASS — Galaxy Premium')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/30 rounded-lg text-sky-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>

        {/* Footer info tag */}
        <div className="mt-4 pt-3 border-t border-purple-500/10 text-center text-[10px] text-purple-300/60 font-mono">
          8F WEB CLASS • CREATED BY THOZ — WAKLENG
        </div>
      </div>
    </div>
  );
};
