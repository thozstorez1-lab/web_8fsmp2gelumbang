import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Check,
  Sparkles,
  X
} from 'lucide-react';
import { Assignment } from '../types';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

interface AssignmentsPageProps {
  assignments: Assignment[];
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ assignments }) => {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states for Admin add/edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const subjects = ['Semua', ...Array.from(new Set(assignments.map((a) => a.subject)))];

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());

    const matchesSubject = subjectFilter === 'Semua' || a.subject === subjectFilter;

    const isDone = user ? a.completedBy?.includes(user.uid) : false;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && isDone) ||
      (statusFilter === 'pending' && !isDone);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const toggleComplete = async (assignment: Assignment) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menandai status tugasmu.');
      return;
    }

    try {
      const docRef = doc(db, 'assignments', assignment.id);
      const completedBy = [...(assignment.completedBy || [])];
      const isCompleted = completedBy.includes(user.uid);

      const updated = isCompleted
        ? completedBy.filter((uid) => uid !== user.uid)
        : [...completedBy, user.uid];

      await updateDoc(docRef, { completedBy: updated });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignment.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assignments/${id}`);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setDueDate('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (a: Assignment) => {
    setEditingId(a.id);
    setTitle(a.title);
    setSubject(a.subject);
    setDescription(a.description);
    setDueDate(a.dueDate);
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) {
      alert('Harap lengkapi judul, mata pelajaran, dan tenggat waktu.');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'assignments', editingId), {
          title,
          subject,
          description,
          dueDate,
        });
      } else {
        await addDoc(collection(db, 'assignments'), {
          title,
          subject,
          description,
          dueDate,
          assignedDate: new Date().toISOString().split('T')[0],
          authorId: user?.uid || 'admin',
          completedBy: [],
          createdAt: new Date().toISOString(),
        });
      }
      setModalOpen(false);
    } catch (error) {
      handleFirestoreError(
        error,
        editingId ? OperationType.UPDATE : OperationType.CREATE,
        'assignments'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-cyan-400" />
            LATIHAN SOAL & TUGAS PR KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Daftar latihan soal, materi pemahaman, tugas mandiri, dan catatan bimbingan guru
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Tugas Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-purple-500/25 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari tugas, mapel, materi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub} className="bg-slate-900">
                Mapel: {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex rounded-xl bg-slate-950/80 p-0.5 border border-purple-500/30">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Belum
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex-1 py-1 text-xs rounded-lg transition-colors ${
              statusFilter === 'completed'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((task) => {
            const isDone = user ? task.completedBy?.includes(user.uid) : false;
            return (
              <div
                key={task.id}
                className={`glass-card p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-purple-500/25 hover:border-purple-400/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const isLatihan = task.type === 'latihan' || task.title.toLowerCase().includes('latihan') || task.title.toLowerCase().includes('soal');
                        return (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              isLatihan
                                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50'
                                : 'bg-purple-950/90 text-purple-300 border border-purple-500/50'
                            }`}
                          >
                            {isLatihan ? 'Latihan Soal' : 'Tugas PR'}
                          </span>
                        );
                      })()}
                      <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium">
                        {task.subject}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-rose-300 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        Tenggat: {task.dueDate}
                      </span>
                    </div>

                    <h3 className="font-galaxy font-bold text-base sm:text-lg text-white">
                      {task.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Mark Done Toggle */}
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                          : 'bg-slate-900 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {isDone ? 'Sudah Selesai' : 'Tandai Selesai'}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-300 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-2 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-950/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card p-12 text-center rounded-2xl border border-purple-500/20">
            <CheckCircle2 className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="font-galaxy font-bold text-white text-base">Tidak ada tugas ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Semua tugas telah diselesaikan atau tidak ada tugas yang sesuai filter.
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
                {editingId ? 'Edit Tugas Kelas' : 'Tambah Tugas & PR Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 block mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika, Bahasa Indonesia"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Latihan Bab 3 Teorema Pythagoras"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Batas Tenggat Waktu (Due Date)</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Instruksi & Deskripsi Tugas</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan petunjuk pengerjaan tugas, nomor halaman buku, atau format pengumpulan..."
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold"
                >
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
