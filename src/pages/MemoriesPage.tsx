import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Heart,
  Plus,
  Trash2,
  Calendar,
  Search,
  Filter,
  Play,
  X,
  Upload,
  Check
} from 'lucide-react';
import { MemoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { processImageFile } from '../utils/imageUtils';

interface MemoriesPageProps {
  memories: MemoryItem[];
  defaultFilter?: 'all' | 'photo' | 'video';
}

export const MemoriesPage: React.FC<MemoriesPageProps> = ({
  memories,
  defaultFilter = 'all',
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>(defaultFilter);
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<MemoryItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kegiatan Kelas');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [url, setUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [processingFile, setProcessingFile] = useState(false);

  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingFile(true);
    try {
      const compressedDataUrl = await processImageFile(file, 1200, 0.75);
      setUrl(compressedDataUrl);
      setMediaType('photo');
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses gambar galeri.');
    } finally {
      setProcessingFile(false);
    }
  };

  const categories = ['Semua', ...Array.from(new Set(memories.map((m) => m.category)))];

  const filtered = memories.filter((m) => {
    const matchesType = filterType === 'all' || m.mediaType === filterType;
    const matchesCategory = categoryFilter === 'Semua' || m.category === categoryFilter;
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleLike = async (item: MemoryItem) => {
    if (!user) {
      alert('Silakan login untuk memberikan like apresiasi.');
      return;
    }
    try {
      const docRef = doc(db, 'memories', item.id);
      const likes = [...(item.likes || [])];
      const hasLiked = likes.includes(user.uid);
      const updated = hasLiked
        ? likes.filter((uid) => uid !== user.uid)
        : [...likes, user.uid];

      await updateDoc(docRef, { likes: updated });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `memories/${item.id}`);
    }
  };

  const handleDelete = async (item: MemoryItem) => {
    if (!user) return;
    if (item.uploaderId !== user.uid && !isAdmin) {
      alert('Anda tidak memiliki izin menghapus kenangan ini.');
      return;
    }
    if (!confirm('Yakin ingin menghapus foto/video ini?')) return;

    try {
      await deleteDoc(doc(db, 'memories', item.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memories/${item.id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    try {
      await addDoc(collection(db, 'memories'), {
        title,
        category,
        description,
        mediaType,
        url,
        eventDate: eventDate || 'Tahun Ini',
        uploaderName: profile?.displayName || 'Siswa 8F',
        uploaderId: user?.uid || 'anon',
        likes: [],
        createdAt: new Date().toISOString(),
      });
      setModalOpen(false);
      setTitle('');
      setUrl('');
      setDescription('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'memories');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-400" />
            KENANGAN & GALERI KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Album foto, momen kebersamaan, video kegiatan, dan kisah indah kita
          </p>
        </div>

        {user && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Unggah Momen Baru
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-purple-500/25 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari judul kenangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                Kategori: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Media type buttons */}
        <div className="flex rounded-xl bg-slate-950/80 p-0.5 border border-purple-500/30">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
              filterType === 'photo' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Foto
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
              filterType === 'video' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Video
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const hasLiked = user ? item.likes?.includes(user.uid) : false;
            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl border border-purple-500/25 overflow-hidden group hover:border-purple-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media container */}
                  <div
                    onClick={() => setActivePreview(item)}
                    className="relative w-full h-52 bg-slate-950 cursor-pointer overflow-hidden"
                  >
                    {item.mediaType === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-purple-600/80 border border-purple-300 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}

                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono">
                      {item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-purple-300/80 font-mono">
                      <span>{item.eventDate}</span>
                      <span>Oleh: {item.uploaderName}</span>
                    </div>

                    <h3 className="font-galaxy font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="p-4 pt-0 border-t border-purple-500/15 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(item)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                      hasLiked
                        ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 font-semibold'
                        : 'bg-slate-900 border-purple-500/20 text-slate-300 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{item.likes?.length || 0}</span>
                  </button>

                  {(user?.uid === item.uploaderId || isAdmin) && (
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass-card p-12 text-center rounded-2xl border border-purple-500/20">
            <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="font-galaxy font-bold text-white text-base">Belum ada foto atau video</h3>
            <p className="text-xs text-slate-400 mt-1">
              Jadilah orang pertama yang mengunggah kenangan kelas 8F!
            </p>
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full glass-card rounded-2xl overflow-hidden border border-purple-500/40">
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center bg-black">
              {activePreview.mediaType === 'video' ? (
                <video src={activePreview.url} controls autoPlay className="max-h-[70vh] w-auto" />
              ) : (
                <img
                  src={activePreview.url}
                  alt={activePreview.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              )}
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-purple-300 font-mono">
                <span>{activePreview.category}</span>
                <span>• {activePreview.eventDate}</span>
                <span>• Pengunggah: {activePreview.uploaderName}</span>
              </div>
              <h3 className="font-galaxy font-bold text-lg text-white">{activePreview.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{activePreview.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white">Unggah Kenangan Kelas</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 block mb-1">Tipe Media</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType('photo')}
                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border ${
                      mediaType === 'photo'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-slate-900 border-purple-500/20 text-slate-300'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" /> Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border ${
                      mediaType === 'video'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-slate-900 border-purple-500/20 text-slate-300'
                    }`}
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Judul Momen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Class Meeting & Pentas Seni 8F"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Kategori Acara</label>
                <input
                  type="text"
                  placeholder="Contoh: Praktikum, Lomba, Study Tour, Santai"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-purple-200 block mb-1">
                  Upload Media ({mediaType === 'photo' ? 'Foto dari Galeri HP / URL' : 'Link Video MP4 / Web'})
                </label>

                {mediaType === 'photo' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {processingFile ? 'Memproses Foto...' : 'Pilih Foto dari Galeri HP'}
                    </button>
                    {url && url.startsWith('data:image') && (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Foto Galeri Terpilih
                      </span>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  required
                  placeholder={
                    mediaType === 'photo'
                      ? 'Atau tempelkan link URL foto gambar...'
                      : 'https://.../video.mp4 atau link video langsung'
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Tanggal Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: 15 Oktober 2026 atau Pekan Olahraga"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Deskripsi & Cerita Momen</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan cerita singkat tentang foto/video kenangan ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none"
                />
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
                  Simpan Kenangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
