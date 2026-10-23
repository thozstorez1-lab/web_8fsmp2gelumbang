import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  LogOut,
  Camera,
  CheckCircle,
  Sparkles,
  QrCode,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { processImageFile } from '../utils/imageUtils';

interface ProfilePageProps {
  onOpenShareModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenShareModal }) => {
  const { user, profile, updateUserProfile, logout, loginWithGoogle } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const profileFileRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const dataUrl = await processImageFile(file, 600, 0.8);
      setPhotoURL(dataUrl);
    } catch (err: any) {
      alert(err?.message || 'Gagal memilih foto dari galeri.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center glass-card rounded-3xl border border-purple-500/30 p-8 space-y-5 my-10">
        <User className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="font-galaxy font-bold text-xl text-white">Profil Pengguna 8F</h2>
        <p className="text-xs text-slate-300">
          Silakan masuk terlebih dahulu menggunakan akun Google untuk mengakses dan mengedit profil
          pribadimu.
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-lg"
        >
          Masuk dengan Akun Google
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        photoURL: photoURL.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      alert('Gagal memperbarui profil: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <User className="w-7 h-7 text-purple-400" />
            PROFIL SAYA
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Kelola data diri, foto profil, dan status akun kelas 8F
          </p>
        </div>

        <button
          onClick={onOpenShareModal}
          className="px-3.5 py-2 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-900/80 transition-colors"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>Bagikan Web</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="glass-card rounded-2xl p-6 border border-purple-500/25 text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto">
            <img
              src={
                photoURL ||
                profile.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
              }
              alt={profile.displayName}
              className="w-full h-full rounded-3xl object-cover border-2 border-purple-400/50 shadow-xl"
            />
          </div>

          <div>
            <h3 className="font-galaxy font-bold text-lg text-white">{profile.displayName}</h3>
            <p className="text-xs text-purple-300 font-mono">@{profile.username}</p>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-mono capitalize">
            {profile.role.replace('_', ' ')}
          </div>

          <div className="pt-3 border-t border-purple-500/20 text-xs text-slate-400 space-y-1 text-left font-mono">
            <p className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{user.email}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Status: {profile.status}</span>
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Akun
          </button>
        </div>

        {/* Profile Edit Form */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/25 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h3 className="font-galaxy font-bold text-base text-white">Edit Informasi Pribadi</h3>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-300 font-semibold animate-in fade-in">
                <CheckCircle className="w-4 h-4" /> Profil Berhasil Disimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Nama Tampilan (Display Name)
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-xs">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-200 block">
                Foto Profil Pengguna (Pilih dari Galeri HP / URL)
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  ref={profileFileRef}
                  onChange={handleAvatarFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => profileFileRef.current?.click()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingAvatar ? 'Memproses Foto...' : 'Pilih Foto dari Galeri HP'}
                </button>
                {photoURL && photoURL.startsWith('data:image') && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Foto Galeri Terpilih
                  </span>
                )}
              </div>

              <input
                type="text"
                value={photoURL}
                placeholder="Atau tempelkan link URL foto pribadi online..."
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Bio / Moto Hidup di Kelas 8F
              </label>
              <textarea
                rows={3}
                value={bio}
                maxLength={300}
                placeholder="Tuliskan kata mutiara, hobi, atau cita-citamu..."
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 resize-none"
              />
              <p className="text-[10px] text-right text-slate-400">{bio.length}/300</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
