import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Send,
  EyeOff,
  User,
  Shield,
  MessageCircle,
  Clock,
  CheckCircle,
  Sparkles,
  Trash2
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Suggestion } from '../types';
import { useAuth } from '../context/AuthContext';

export const SuggestionsPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Kebersihan');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Suggestion[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setSuggestions(list);
      },
      (error) => {
        // If unauthenticated or restricted by rules, ignore gracefully
        console.warn('Suggestions error or restriction:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'suggestions'), {
        senderId: isAnonymous ? 'anonymous' : user?.uid || 'anon',
        senderName: isAnonymous ? 'Siswa Rahasia 8F' : profile?.displayName || 'Siswa 8F',
        category,
        content: content.trim(),
        isAnonymous,
        status: 'pending',
        reply: '',
        createdAt: new Date().toISOString(),
      });
      setContent('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'suggestions');
    } finally {
      setSending(false);
    }
  };

  const handleAdminReply = async (id: string) => {
    const reply = replyText[id];
    if (!reply || !reply.trim()) return;

    try {
      await updateDoc(doc(db, 'suggestions', id), {
        reply: reply.trim(),
        status: 'reviewed',
      });
      setReplyText((prev) => ({ ...prev, [id]: '' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `suggestions/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus saran ini?')) return;
    try {
      await deleteDoc(doc(db, 'suggestions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `suggestions/${id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
          <Inbox className="w-7 h-7 text-indigo-400" />
          KOTAK SARAN & ASPIRASI 8F
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
          Kirimkan kritik membangun, ide kegiatan, atau masukan untuk pengurus kelas dan Wali Kelas
          Buk Biba
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/30 space-y-4 h-fit">
          <div className="pb-3 border-b border-purple-500/20">
            <h3 className="font-galaxy font-bold text-base text-white">Kirim Aspirasi Baru</h3>
            <p className="text-xs text-purple-300/70">
              Saranmu sangat berarti untuk kemajuan kelas 8F
            </p>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Saran berhasil dikirimkan ke pengurus kelas! Terima kasih.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Kategori Saran
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Kebersihan">Kebersihan & Kerapian Kelas</option>
                <option value="Belajar & Tugas">Kegiatan Belajar & Tugas</option>
                <option value="Kegiatan & Acara">Ide Kegiatan & Class Meeting</option>
                <option value="Fasilitas">Fasilitas & Perlengkapan Ruang 8F</option>
                <option value="Lainnya">Lain-lain / Saran Umum</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Isi Masukan / Saran
              </label>
              <textarea
                rows={5}
                required
                maxLength={2000}
                placeholder="Tuliskan saran, ide, atau unek-unek secara santun dan konstruktif..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Mode Anonim</p>
                  <p className="text-[11px] text-slate-400">Nama pengirim dirahasiakan</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Mengirimkan...' : 'Kirim Aspirasi'}
            </button>
          </form>
        </div>

        {/* Suggestions Feed Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-galaxy font-bold text-lg text-white">
            Daftar Saran & Tanggapan Pengurus
          </h3>

          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 border border-purple-500/25 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Oleh: {item.isAnonymous ? 'Siswa Rahasia 8F' : item.senderName}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                      item.status === 'reviewed'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.status === 'reviewed' ? 'Sudah Ditanggapi' : 'Menunggu Tanggapan'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  "{item.content}"
                </p>

                {/* Reply section if exists */}
                {item.reply && (
                  <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-xs space-y-1">
                    <p className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                      Tanggapan Pengurus / Wali Kelas Buk Biba:
                    </p>
                    <p className="text-slate-200">{item.reply}</p>
                  </div>
                )}

                {/* Admin Reply Box */}
                {isAdmin && !item.reply && (
                  <div className="pt-2 border-t border-purple-500/15 space-y-2">
                    <input
                      type="text"
                      placeholder="Tuliskan balasan/tanggapan resmi pengurus..."
                      value={replyText[item.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 rounded-lg bg-slate-900 text-rose-400 text-xs"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => handleAdminReply(item.id)}
                        className="px-4 py-1 rounded-lg bg-purple-600 text-white text-xs font-semibold"
                      >
                        Kirim Balasan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="glass-card p-12 text-center rounded-2xl border border-purple-500/20">
              <Inbox className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <h3 className="font-galaxy font-bold text-white text-base">Kotak saran masih kosong</h3>
              <p className="text-xs text-slate-400 mt-1">
                Jadilah yang pertama menyampaikan ide brilian untuk kelas 8F!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
