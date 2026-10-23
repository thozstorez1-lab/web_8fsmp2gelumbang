import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  AlertTriangle,
  Calendar,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  Upload,
  Check
} from 'lucide-react';
import { Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { processImageFile } from '../utils/imageUtils';

interface AnnouncementsPageProps {
  announcements: Announcement[];
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ announcements }) => {
  const { user, profile, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const annFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [processingImage, setProcessingImage] = useState(false);

  const handleAnnFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    try {
      const compressed = await processImageFile(file, 1200, 0.75);
      setImageUrl(compressed);
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses gambar galeri.');
    } finally {
      setProcessingImage(false);
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsImportant(false);
    setImageUrl('');
    setModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setIsImportant(a.isImportant || false);
    setImageUrl(a.imageUrl || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), {
          title,
          content,
          isImportant,
          imageUrl,
        });
      } else {
        await addDoc(collection(db, 'announcements'), {
          title,
          content,
          isImportant,
          imageUrl: imageUrl || '',
          authorId: user?.uid || 'admin',
          authorName: profile?.displayName || 'Pengurus Kelas 8F',
          createdAt: new Date().toISOString(),
        });
      }
      setModalOpen(false);
    } catch (error) {
      handleFirestoreError(
        error,
        editingId ? OperationType.UPDATE : OperationType.CREATE,
        'announcements'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-pink-400" />
            PENGUMUMAN RESMI KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Pemberitahuan penting dari Wali Kelas Buk Biba dan pengurus kelas
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Buat Pengumuman Baru
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="glass-card p-4 rounded-2xl border border-purple-500/25 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className={`glass-card rounded-2xl p-6 border transition-all overflow-hidden ${
                ann.isImportant
                  ? 'border-rose-500/50 bg-gradient-to-r from-rose-950/20 via-purple-950/20 to-slate-950/40'
                  : 'border-purple-500/25'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {ann.imageUrl && (
                  <div className="w-full md:w-56 h-44 rounded-xl overflow-hidden shrink-0 border border-purple-500/30">
                    <img
                      src={ann.imageUrl}
                      alt={ann.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.isImportant && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-900/70 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        PENTING
                      </span>
                    )}

                    <span className="text-xs text-purple-300/80 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">• Oleh: {ann.authorName}</span>
                  </div>

                  <h3 className="font-galaxy font-bold text-lg sm:text-xl text-white">
                    {ann.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  {isAdmin && (
                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1 hover:bg-rose-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center rounded-2xl border border-purple-500/20">
            <Bell className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="font-galaxy font-bold text-white text-base">
              Tidak ada pengumuman ditemukan
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Semua info terbaru akan ditampilkan di halaman ini.
            </p>
          </div>
        )}
      </div>

      {/* Admin Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white">
                {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 block mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Ujian Tengah Semester & Libur Bersama"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Isi Pengumuman</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan detail pengumuman secara lengkap dan jelas..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-purple-200 block mb-1">
                  Gambar Banner Pengumuman (Pilih dari Galeri HP / URL)
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="file"
                    ref={annFileInputRef}
                    onChange={handleAnnFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => annFileInputRef.current?.click()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {processingImage ? 'Memproses...' : 'Pilih Foto dari Galeri HP'}
                  </button>
                  {imageUrl && imageUrl.startsWith('data:image') && (
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Foto Galeri Terpilih
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Atau tempelkan link URL gambar online..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="important-checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded border-purple-500 bg-slate-900 text-purple-600 focus:ring-0"
                />
                <label htmlFor="important-checkbox" className="text-xs text-rose-300 font-semibold cursor-pointer">
                  Tandai sebagai Pengumuman Sangat Penting (Highlight Merah)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/20 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold"
                >
                  {editingId ? 'Simpan Pengumuman' : 'Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
