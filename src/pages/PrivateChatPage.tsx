import React, { useState, useEffect, useRef } from 'react';
import {
  MessagesSquare,
  Send,
  User,
  Search,
  Lock,
  Sparkles,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, setDoc, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, PrivateMessage } from '../types';
import { useAuth } from '../context/AuthContext';

export const PrivateChatPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((d) => {
          const u = d.data() as UserProfile;
          if (u.uid !== user?.uid) {
            list.push(u);
          }
        });
        setMembers(list);
      },
      (error) => console.warn(error)
    );
    return () => unsubscribe();
  }, [user]);

  // Listen to messages between current user and selectedUser
  useEffect(() => {
    if (!user || !selectedUser) {
      setMessages([]);
      return;
    }

    const conversationId = [user.uid, selectedUser.uid].sort().join('_');
    const q = query(
      collection(db, 'globalMessages'), // Using secure channel tag
      orderBy('createdAt', 'asc')
    );

    // Filter messages for this conversation pair
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PrivateMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          (data.senderId === user.uid && data.receiverId === selectedUser.uid) ||
          (data.senderId === selectedUser.uid && data.receiverId === user.uid)
        ) {
          list.push({ id: docSnap.id, ...(data as any) });
        }
      });
      setMessages(list);
    });

    return () => unsubscribe();
  }, [user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !text.trim() || sending) return;

    setSending(true);
    try {
      const conversationId = [user.uid, selectedUser.uid].sort().join('_');
      await addDoc(collection(db, 'globalMessages'), {
        conversationId,
        senderId: user.uid,
        senderName: profile?.displayName || 'Anggota 8F',
        receiverId: selectedUser.uid,
        receiverName: selectedUser.displayName,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      });
      setText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'privateMessages');
    } finally {
      setSending(false);
    }
  };

  const filteredMembers = members.filter((m) =>
    (m.displayName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex items-center space-x-3 mb-4 shrink-0">
        <div className="p-2.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
          <MessagesSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-galaxy font-extrabold text-base sm:text-lg text-white">
            CHAT PRIBADI ANTAR ANGGOTA 8F
          </h2>
          <p className="text-xs text-purple-300/70">
            Percakapan privat seputar tugas kelompok dan diskusi personal
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl border border-purple-500/25 overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Contact List Sidebar */}
        <div
          className={`w-full md:w-80 border-r border-purple-500/20 flex flex-col bg-[#07051d]/90 ${
            selectedUser ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3.5 border-b border-purple-500/20">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari teman kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-purple-500/10">
            {filteredMembers.map((m) => {
              const isSelected = selectedUser?.uid === m.uid;
              return (
                <button
                  key={m.uid}
                  onClick={() => setSelectedUser(m)}
                  className={`w-full p-3.5 flex items-center space-x-3 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-600/30 border-l-2 border-purple-400' : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={
                      m.photoURL ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${m.uid}`
                    }
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-purple-400/30"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.displayName}</p>
                    <p className="text-[11px] text-purple-300/70 font-mono">@{m.username}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Thread Area */}
        <div
          className={`flex-1 flex-col bg-[#090620]/95 ${
            selectedUser ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedUser ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 px-4 border-b border-purple-500/20 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1 text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={
                      selectedUser.photoURL ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.uid}`
                    }
                    alt=""
                    className="w-9 h-9 rounded-xl object-cover border border-purple-400/40"
                  />

                  <div>
                    <h3 className="font-semibold text-sm text-white">
                      {selectedUser.displayName}
                    </h3>
                    <p className="text-[10px] text-purple-300 font-mono">
                      @{selectedUser.username} • Siswa 8F
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pesan Pribadi</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-purple-400 mb-2" />
                    <p className="text-xs font-semibold text-white">Mulai Percakapan Pribadi</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Kirim pesan langsung ke {selectedUser.displayName}
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.uid;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                              : 'bg-slate-900 border border-purple-500/25 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          <p>{m.text}</p>
                          <p className="text-[9px] text-right text-purple-200/70 mt-1 font-mono">
                            {new Date(m.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-purple-500/20 flex gap-2">
                <input
                  type="text"
                  placeholder={`Kirim pesan pribadi ke ${selectedUser.displayName}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessagesSquare className="w-12 h-12 text-purple-400 mb-3" />
              <h3 className="font-galaxy font-bold text-white text-base">Pilih Teman Kelas 8F</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Pilih salah satu teman kelas di daftar sebelah kiri untuk memulai obrolan langsung.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
