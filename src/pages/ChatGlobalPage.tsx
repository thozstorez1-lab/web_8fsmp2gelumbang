import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import {
  Send,
  Trash2,
  Reply,
  Smile,
  ShieldAlert,
  Sparkles,
  LogIn,
  X,
  MessageSquare
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { GlobalMessage } from '../types';
import { useAuth } from '../context/AuthContext';

export const ChatGlobalPage: React.FC = () => {
  const { user, profile, isAdmin, loginWithGoogle } = useAuth();
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [text, setText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<GlobalMessage | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'globalMessages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: GlobalMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setMessages(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'globalMessages');
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !text.trim() || sending) return;

    if (text.length > 1000) {
      alert('Pesan maksimal 1000 karakter.');
      return;
    }

    setSending(true);
    try {
      const payload: any = {
        senderId: user.uid,
        senderName: profile.displayName || 'Anggota 8F',
        senderPhoto:
          profile.photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        reactions: {},
      };

      if (replyingTo) {
        payload.replyTo = {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          text: replyingTo.text,
        };
      }

      await addDoc(collection(db, 'globalMessages'), payload);
      setText('');
      setReplyingTo(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'globalMessages');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string, senderId: string) => {
    if (!user) return;
    if (senderId !== user.uid && !isAdmin) {
      alert('Anda tidak memiliki izin menghapus pesan ini.');
      return;
    }

    if (!confirm('Yakin ingin menghapus pesan ini?')) return;

    try {
      await deleteDoc(doc(db, 'globalMessages', msgId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `globalMessages/${msgId}`);
    }
  };

  const handleReactEmoji = async (msg: GlobalMessage, emoji: string) => {
    if (!user) return;
    try {
      const msgRef = doc(db, 'globalMessages', msg.id);
      const reactions = { ...(msg.reactions || {}) };
      const currentUids: string[] = reactions[emoji] || [];

      if (currentUids.includes(user.uid)) {
        reactions[emoji] = currentUids.filter((id) => id !== user.uid);
      } else {
        reactions[emoji] = [...currentUids, user.uid];
      }

      await updateDoc(msgRef, { reactions });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `globalMessages/${msg.id}`);
    }
  };

  const availableEmojis = ['❤️', '🔥', '👍', '😂', '🚀', '🎉'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header Bar */}
      <div className="glass-card rounded-2xl p-4 border border-purple-500/25 mb-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-galaxy font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              RUANG CHAT GLOBAL 8F
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-purple-300/70">
              Diskusi santai, informasi tugas, dan kebersamaan seluruh siswa 8F
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-purple-300 hidden sm:block">
          {messages.length} Pesan Terkirim
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/20 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Sparkles className="w-10 h-10 text-purple-400 mb-3 animate-bounce" />
            <p className="font-galaxy text-sm text-purple-200 font-semibold">
              Belum ada pesan di Ruang Chat 8F
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Kirim salam sapa pertama ke teman-teman sekelasmu sekarang!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user?.uid === msg.senderId;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <img
                  src={
                    msg.senderPhoto ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`
                  }
                  alt={msg.senderName}
                  className="w-9 h-9 rounded-xl object-cover border border-purple-400/40 shrink-0 self-end"
                />

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Name & Time */}
                  <div
                    className={`flex items-center gap-2 text-[11px] text-slate-400 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span className="font-semibold text-purple-300">{msg.senderName}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Replied Message Preview */}
                  {msg.replyTo && (
                    <div className="p-2 rounded-lg bg-black/40 border-l-2 border-cyan-400 text-[11px] text-slate-300 mb-1">
                      <span className="font-semibold text-cyan-300">
                        Membalas {msg.replyTo.senderName}:
                      </span>{' '}
                      <span className="line-clamp-1 italic">{msg.replyTo.text}</span>
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-br-none shadow-md shadow-purple-900/40'
                        : 'bg-[#120d2d]/90 border border-purple-500/25 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                    {/* Reactions Pill Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
                        {Object.entries(msg.reactions).map(([emoji, uids]) => {
                          if (!uids || uids.length === 0) return null;
                          const hasReacted = user ? uids.includes(user.uid) : false;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReactEmoji(msg, emoji)}
                              className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border transition-all cursor-pointer ${
                                hasReacted
                                  ? 'bg-purple-500/40 border-purple-400 text-white font-bold'
                                  : 'bg-black/30 border-white/10 text-slate-300 hover:bg-black/50'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{uids.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar (Hover on desktop, visible) */}
                  <div
                    className={`flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Emoji Reaction Buttons */}
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 border border-purple-500/20">
                      {availableEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReactEmoji(msg, emoji)}
                          className="hover:scale-125 transition-transform text-xs cursor-pointer p-0.5"
                          title={`Beri reaksi ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Reply Button */}
                    <button
                      onClick={() => setReplyingTo(msg)}
                      title="Balas pesan"
                      className="p-1 rounded-full bg-black/60 border border-purple-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button (Owner or Admin) */}
                    {(isMe || isAdmin) && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id, msg.senderId)}
                        title="Hapus pesan"
                        className="p-1 rounded-full bg-black/60 border border-purple-500/20 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-3 shrink-0">
        {user ? (
          <form onSubmit={handleSendMessage} className="space-y-2">
            {/* Replying banner */}
            {replyingTo && (
              <div className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Reply className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Membalas <strong className="text-white">{replyingTo.senderName}</strong>:{' '}
                    <span className="line-clamp-1 italic text-slate-300">{replyingTo.text}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tulis pesan ke seluruh kelas 8F... (Shift+Enter untuk baris baru)"
                maxLength={1000}
                className="flex-1 px-4 py-3 rounded-2xl bg-[#090520]/90 border border-purple-500/30 focus:border-purple-400 focus:outline-none text-sm text-white placeholder-slate-400 transition-colors shadow-inner"
              />

              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/50 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl glass-card border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-sm text-white">
                Masuk untuk bergabung dalam Ruang Chat 8F
              </p>
              <p className="text-xs text-purple-300/70">
                Gunakan akun Google untuk mengirim pesan dan emoji
              </p>
            </div>
            <button
              onClick={loginWithGoogle}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <LogIn className="w-4 h-4" />
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
