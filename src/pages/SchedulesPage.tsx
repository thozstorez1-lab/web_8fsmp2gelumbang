import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckSquare,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  GraduationCap,
  X
} from 'lucide-react';
import { ClassSchedule, DutySchedule } from '../types';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, deleteDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

interface SchedulesPageProps {
  schedules: ClassSchedule[];
  duties: DutySchedule[];
}

export const SchedulesPage: React.FC<SchedulesPageProps> = ({ schedules, duties }) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'pelajaran' | 'piket'>('pelajaran');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Modal for adding schedule
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [modalDay, setModalDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');

  // Modal for editing duty
  const [dutyModalOpen, setDutyModalOpen] = useState(false);
  const [dutyDay, setDutyDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [dutyMembersText, setDutyMembersText] = useState('');
  const [dutyTasks, setDutyTasks] = useState('');
  const [editingDutyId, setEditingDutyId] = useState<string | null>(null);

  const filteredSchedules = schedules.filter((s) => s.day === selectedDay);
  const selectedDuty = duties.find((d) => d.day === selectedDay);

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Hapus mata pelajaran ini dari jadwal?')) return;
    try {
      await deleteDoc(doc(db, 'schedules', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `schedules/${id}`);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !time) return;

    try {
      await addDoc(collection(db, 'schedules'), {
        day: modalDay,
        subject,
        time,
        room: room || 'Ruang 8F',
        notes: notes || '',
      });
      setScheduleModalOpen(false);
      setSubject('');
      setTime('');
      setRoom('');
      setNotes('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'schedules');
    }
  };

  const handleOpenDutyModal = (duty?: DutySchedule) => {
    if (duty) {
      setEditingDutyId(duty.id);
      setDutyDay(duty.day);
      setDutyMembersText(duty.members.join(', '));
      setDutyTasks(duty.tasks);
    } else {
      setEditingDutyId(null);
      setDutyDay(selectedDay as any);
      setDutyMembersText('');
      setDutyTasks('');
    }
    setDutyModalOpen(true);
  };

  const handleSaveDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    const members = dutyMembersText
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    try {
      if (editingDutyId) {
        await updateDoc(doc(db, 'dutySchedules', editingDutyId), {
          day: dutyDay,
          members,
          tasks: dutyTasks,
        });
      } else {
        await addDoc(collection(db, 'dutySchedules'), {
          day: dutyDay,
          members,
          tasks: dutyTasks,
        });
      }
      setDutyModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'dutySchedules');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-cyan-400" />
            JADWAL KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Jadwal mingguan pelajaran dan giliran piket kebersihan
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl glass-card p-1 border border-purple-500/30 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pelajaran')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pelajaran'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Jadwal Pelajaran
          </button>
          <button
            onClick={() => setActiveTab('piket')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'piket'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Jadwal Piket
          </button>
        </div>
      </div>

      {/* Day Selector Bar */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-galaxy font-bold transition-all shrink-0 cursor-pointer ${
              selectedDay === d
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/50 shadow-lg shadow-purple-900/40 scale-105'
                : 'glass-card border border-purple-500/20 text-slate-300 hover:bg-white/5'
            }`}
          >
            Hari {d}
          </button>
        ))}
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === 'pelajaran' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-galaxy font-bold text-lg text-white flex items-center gap-2">
              <span>Mata Pelajaran Hari {selectedDay}</span>
              <span className="text-xs font-mono text-purple-300">
                ({filteredSchedules.length} Sesi)
              </span>
            </h3>

            {isAdmin && (
              <button
                onClick={() => {
                  setModalDay(selectedDay as any);
                  setScheduleModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Mapel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="glass-card p-5 rounded-2xl border border-purple-500/25 flex items-start justify-between gap-4 hover:border-purple-400/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center font-galaxy text-xs font-bold text-cyan-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-purple-200 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                        {item.time}
                      </span>
                    </div>

                    <h4 className="font-galaxy font-bold text-base text-white">{item.subject}</h4>

                    <p className="text-xs text-slate-300">
                      📍 {item.room || 'Ruang 8F'}
                      {item.notes ? ` • ${item.notes}` : ''}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="p-2 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-400 hover:bg-rose-950/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full glass-card p-10 text-center rounded-2xl border border-purple-500/20">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">
                  Belum ada jadwal pelajaran untuk hari {selectedDay}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hari bebas kegiatan belajar atau belum diinput oleh admin.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Piket Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-galaxy font-bold text-lg text-white flex items-center gap-2">
              <span>Jadwal Piket Kebersihan: Hari {selectedDay}</span>
            </h3>

            {isAdmin && (
              <button
                onClick={() => handleOpenDutyModal(selectedDuty)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {selectedDuty ? 'Ubah Petugas Piket' : 'Atur Petugas Piket'}
              </button>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 border border-emerald-500/25 space-y-6">
            <div>
              <h4 className="text-xs font-mono uppercase text-emerald-300 mb-3 tracking-wider">
                ANGGOTA PETUGAS PIKET HARI {selectedDay.toUpperCase()}:
              </h4>
              {selectedDuty && selectedDuty.members.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {selectedDuty.members.map((member, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#0a0720]/80 border border-emerald-500/30 text-center hover:scale-105 transition-transform"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center font-bold text-xs text-emerald-300 mx-auto mb-1.5">
                        {i + 1}
                      </div>
                      <p className="text-xs font-medium text-slate-200">{member}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3">
                  Belum ada regu piket yang ditentukan untuk hari ini.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-emerald-500/20">
              <h4 className="text-xs font-mono uppercase text-purple-300 mb-2">
                DAFTAR TUGAS KEBERSIHAN:
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 bg-[#090520] p-4 rounded-xl border border-purple-500/20 leading-relaxed">
                {selectedDuty?.tasks ||
                  'Menyapu seluruh lantai kelas, merapikan meja guru dan papan tulis, serta membuang tempat sampah sebelum bel pulang.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white">
                Tambah Mata Pelajaran ({modalDay})
              </h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 block mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Waktu Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 07:30 - 09:00"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Ruangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Ruang 8F / Lab Komputer"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Bawa buku paket Bab 4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/20 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Duty Modal */}
      {dutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white">
                Atur Petugas Piket ({dutyDay})
              </h3>
              <button
                onClick={() => setDutyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDuty} className="space-y-3">
              <div>
                <label className="text-xs text-emerald-200 block mb-1">
                  Nama Anggota Petugas (pisahkan dengan koma)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Rayhan, Naufal, Zahra, Aisyah, Dimas"
                  value={dutyMembersText}
                  onChange={(e) => setDutyMembersText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-emerald-200 block mb-1">
                  Deskripsi Tugas Kebersihan
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Sapu lantai kelas, rapikan meja guru, hapus papan tulis."
                  value={dutyTasks}
                  onChange={(e) => setDutyTasks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDutyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/20 text-xs text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold"
                >
                  Simpan Petugas Piket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
