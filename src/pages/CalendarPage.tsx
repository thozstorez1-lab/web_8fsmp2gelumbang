import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Tag,
  AlertCircle,
  X
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

interface CalendarPageProps {
  events: CalendarEvent[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ events }) => {
  const { isAdmin, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<CalendarEvent['category']>('Kegiatan');
  const [description, setDescription] = useState('');

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus agenda kegiatan ini?')) return;
    try {
      await deleteDoc(doc(db, 'calendarEvents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `calendarEvents/${id}`);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    try {
      await addDoc(collection(db, 'calendarEvents'), {
        title,
        date,
        category,
        description,
        authorId: user?.uid || 'admin',
      });
      setModalOpen(false);
      setTitle('');
      setDate('');
      setDescription('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'calendarEvents');
    }
  };

  const getCategoryColor = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'Ujian':
        return 'bg-rose-950/70 border-rose-500/40 text-rose-300';
      case 'Tugas':
        return 'bg-amber-950/70 border-amber-500/40 text-amber-300';
      case 'Kegiatan':
        return 'bg-purple-950/70 border-purple-500/40 text-purple-300';
      case 'Acara Sekolah':
        return 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300';
      case 'Hari Penting':
        return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-cyan-400" />
            KALENDER KEGIATAN KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Agenda penting, ujian semester, kegiatan belajar, dan acara sekolah
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Agenda Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((ev) => (
            <div
              key={ev.id}
              className="glass-card rounded-2xl p-5 border border-purple-500/25 flex flex-col justify-between hover:border-purple-400/40 transition-all space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getCategoryColor(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>

                  <span className="text-xs font-mono text-purple-200 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/30">
                    {ev.date}
                  </span>
                </div>

                <h3 className="font-galaxy font-bold text-base text-white">{ev.title}</h3>

                {ev.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                )}
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-purple-500/15 flex justify-end">
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full glass-card p-12 text-center rounded-2xl border border-purple-500/20">
            <CalendarIcon className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="font-galaxy font-bold text-white text-base">Belum ada agenda kelas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Agenda ujian dan kegiatan kelas 8F akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white">Tambah Agenda Kalender</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 block mb-1">Nama Agenda</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penilaian Akhir Semester (PAS)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Kategori Acara</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                >
                  <option value="Ujian">Ujian</option>
                  <option value="Tugas">Tenggat Tugas</option>
                  <option value="Kegiatan">Kegiatan Kelas</option>
                  <option value="Acara Sekolah">Acara Sekolah</option>
                  <option value="Hari Penting">Hari Penting</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi detail atau perlengkapan yang harus dibawa..."
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs font-semibold"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
