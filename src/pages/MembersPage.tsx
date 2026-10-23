import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  UserCheck,
  Mail,
  Calendar,
  Award
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, WebsiteSetting } from '../types';
import { useAuth } from '../context/AuthContext';

interface MembersPageProps {
  settings?: WebsiteSetting;
}

export const MembersPage: React.FC<MembersPageProps> = ({ settings }) => {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as UserProfile);
        });
        setMembers(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );
    return () => unsubscribe();
  }, []);

  const filtered = members.filter((m) => {
    const matchesSearch =
      (m.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.username || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-cyan-400" />
            ANGGOTA KELAS 8F
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Daftar seluruh siswa, pengurus kelas, dan wali kelas tercinta
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl glass-card border border-purple-500/30 text-xs font-mono text-purple-200 flex items-center gap-2 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Total Terdaftar: {members.length} Siswa</span>
        </div>
      </div>

      {/* Wali Kelas Special Profile Card */}
      <div className="glass-card rounded-2xl p-6 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-r from-purple-950/40 to-slate-950/70">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={
              settings?.homeroomTeacherPhoto ||
              'https://api.dicebear.com/7.x/bottts/svg?seed=BukBiba8F'
            }
            alt="Buk Biba"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-xl shrink-0"
          />
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                WALI KELAS 8F
              </span>
              <span className="text-xs text-purple-300 font-mono">Guru Pembina Resmi</span>
            </div>
            <h2 className="font-galaxy font-black text-2xl text-white">BUK BIBA</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Membimbing dan mendampingi putra-putri 8F dalam meraih prestasi akademik, kedisiplinan,
              serta akhlak mulia. Selalu terbuka untuk konsultasi dan bimbingan belajar siswa.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-4 rounded-2xl border border-purple-500/25 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama anggota atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all" className="bg-slate-900">
              Semua Peran
            </option>
            <option value="super_admin" className="bg-slate-900">
              Super Admin (THOZ)
            </option>
            <option value="admin" className="bg-slate-900">
              Admin & Pengurus
            </option>
            <option value="anggota" className="bg-slate-900">
              Anggota Siswa
            </option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((member) => {
          const isSuper = member.role === 'super_admin';
          const isAdminRole = member.role === 'admin';
          return (
            <div
              key={member.uid}
              className={`glass-card p-5 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                isSuper
                  ? 'border-purple-500/50 bg-gradient-to-b from-purple-950/30 to-slate-950/80'
                  : isAdminRole
                  ? 'border-cyan-500/40'
                  : 'border-purple-500/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <img
                    src={
                      member.photoURL ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${member.uid}`
                    }
                    alt={member.displayName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400/40 shadow-md"
                  />

                  {isSuper ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-900/80 border border-purple-400 text-purple-200 text-[10px] font-mono font-bold">
                      SUPER ADMIN
                    </span>
                  ) : isAdminRole ? (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-900/80 border border-cyan-400 text-cyan-200 text-[10px] font-mono font-bold">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-purple-500/30 text-purple-300 text-[10px] font-mono">
                      ANGGOTA 8F
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-galaxy font-bold text-base text-white truncate">
                    {member.displayName}
                  </h3>
                  <p className="text-xs text-purple-300/80 font-mono">@{member.username}</p>
                </div>

                {member.bio && (
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  Aktif
                </span>
                <span>
                  {member.createdAt
                    ? new Date(member.createdAt).toLocaleDateString('id-ID', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '2026'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
