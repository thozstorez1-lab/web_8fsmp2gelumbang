import React, { useState, useEffect } from 'react';
import {
  Vote,
  Plus,
  CheckCircle2,
  Lock,
  Trash2,
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Poll } from '../types';
import { useAuth } from '../context/AuthContext';

export const PollsPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Poll[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setPolls(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'polls');
      }
    );
    return () => unsubscribe();
  }, []);

  const handleVote = async (poll: Poll, optionId: string) => {
    if (!user) {
      alert('Silakan login untuk memberikan suara pada polling ini.');
      return;
    }

    if (poll.status === 'closed') {
      alert('Polling ini sudah ditutup.');
      return;
    }

    try {
      const pollRef = doc(db, 'polls', poll.id);
      const updatedOptions = poll.options.map((opt) => {
        // remove user's vote from any option first
        const filteredVotes = opt.votes.filter((uid) => uid !== user.uid);
        if (opt.id === optionId) {
          return { ...opt, votes: [...filteredVotes, user.uid] };
        }
        return { ...opt, votes: filteredVotes };
      });

      await updateDoc(pollRef, { options: updatedOptions });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `polls/${poll.id}`);
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (!confirm('Hapus polling ini?')) return;
    try {
      await deleteDoc(doc(db, 'polls', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `polls/${id}`);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !option1 || !option2) return;

    const options = [
      { id: 'opt-1', text: option1.trim(), votes: [] },
      { id: 'opt-2', text: option2.trim(), votes: [] },
    ];
    if (option3.trim()) {
      options.push({ id: 'opt-3', text: option3.trim(), votes: [] });
    }

    try {
      await addDoc(collection(db, 'polls'), {
        question: question.trim(),
        options,
        authorId: user?.uid || 'admin',
        authorName: profile?.displayName || 'Pengurus 8F',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      setModalOpen(false);
      setQuestion('');
      setOption1('');
      setOption2('');
      setOption3('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'polls');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <Vote className="w-7 h-7 text-blue-400" />
            POLLING & VOTING KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Musyawarah mufakat suara siswa 8F untuk keputusan bersama
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-900/40 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Buat Polling Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.length > 0 ? (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
            return (
              <div
                key={poll.id}
                className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300/80">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      Total Suara: {totalVotes}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        poll.status === 'active'
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {poll.status === 'active' ? 'Aktif Berjalan' : 'Selesai / Ditutup'}
                    </span>
                  </div>

                  <h3 className="font-galaxy font-bold text-base sm:text-lg text-white">
                    {poll.question}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-1">
                    {poll.options.map((opt) => {
                      const count = opt.votes?.length || 0;
                      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const userVotedThis = user ? opt.votes?.includes(user.uid) : false;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleVote(poll, opt.id)}
                          className={`relative p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            userVotedThis
                              ? 'border-purple-400 bg-purple-950/40'
                              : 'border-purple-500/20 bg-slate-950/60 hover:border-purple-500/40'
                          }`}
                        >
                          {/* Percentage progress bar */}
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-purple-600/25 pointer-events-none transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs">
                            <span className="font-medium text-white flex items-center gap-2">
                              {userVotedThis && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {opt.text}
                            </span>
                            <span className="font-mono text-purple-300 font-semibold shrink-0">
                              {percentage}% ({count})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-3 border-t border-purple-500/15 flex justify-end">
                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass-card p-12 text-center rounded-2xl border border-purple-500/20">
            <Vote className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="font-galaxy font-bold text-white text-base">Belum ada polling kelas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Admin akan membuat polling ketika ada voting kegiatan bersama.
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white">Buat Polling Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 block mb-1">Pertanyaan Polling</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mau pesan kaos kelas warna apa?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Pilihan 1</label>
                <input
                  type="text"
                  required
                  placeholder="Pilihan 1..."
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Pilihan 2</label>
                <input
                  type="text"
                  required
                  placeholder="Pilihan 2..."
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 block mb-1">Pilihan 3 (Opsional)</label>
                <input
                  type="text"
                  placeholder="Pilihan 3..."
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold"
                >
                  Mulai Polling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
