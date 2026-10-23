import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Settings,
  Users,
  LayoutDashboard,
  Save,
  CheckCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  RefreshCw,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertTriangle,
  UserPlus,
  Trash2,
  Search,
  Mail,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Edit2,
  Plus,
  Clock,
  CheckSquare,
  Vote,
  Inbox,
  Trophy,
  MessageSquare,
  RotateCcw,
  X,
  FileText,
  HelpCircle
} from 'lucide-react';
import {
  WebsiteSetting,
  UserProfile,
  UserRole,
  Announcement,
  Assignment,
  ClassSchedule,
  DutySchedule,
  CalendarEvent,
  MemoryItem,
  ClassRule,
  ClassAchievement,
  Suggestion,
  Poll
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { processImageFile, maskEmail } from '../utils/imageUtils';
import { INITIAL_ASSIGNMENTS } from '../firebase/seed';

interface AdminDashboardPageProps {
  settings: WebsiteSetting;
  onUpdateSettings: (newSettings: WebsiteSetting) => Promise<void>;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { user, profile, isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'ringkasan' | 'identitas' | 'anggota' | 'pengumuman' | 'tugas' | 'jadwal' | 'kalender' | 'galeri' | 'aturan' | 'aspirasi' | 'panduan'
  >('ringkasan');

  // Privacy: Show/Hide email state
  const [showFullEmails, setShowFullEmails] = useState<boolean>(false);

  // Core collections data for full system control
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [whitelistedAdmins, setWhitelistedAdmins] = useState<{ email: string; role: string; addedAt?: string }[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [duties, setDuties] = useState<DutySchedule[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [rules, setRules] = useState<ClassRule[]>([]);
  const [achievements, setAchievements] = useState<ClassAchievement[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);

  // Search & Filter states
  const [memberSearch, setMemberSearch] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Settings form states
  const [siteName, setSiteName] = useState(settings.siteName || '8F WEB CLASS');
  const [tagline, setTagline] = useState(settings.tagline || 'ONE CLASS, ONE FAMILY, ONE FUTURE.');
  const [creator, setCreator] = useState(settings.creator || 'CREATED BY THOZ — WAKLENG');
  const [homeroomTeacher, setHomeroomTeacher] = useState(settings.homeroomTeacher || 'BUK BIBA');
  const [homeroomTeacherBio, setHomeroomTeacherBio] = useState(settings.homeroomTeacherBio || '');
  const [homeroomTeacherPhoto, setHomeroomTeacherPhoto] = useState(settings.homeroomTeacherPhoto || '');
  const [particleEffect, setParticleEffect] = useState(settings.particleEffect ?? true);
  const [allowRegistration, setAllowRegistration] = useState(settings.allowRegistration || 'open');
  const [inviteCode, setInviteCode] = useState(settings.inviteCode || '8FGALAXY');
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode ?? false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Image Upload Ref for Wali Kelas Photo
  const fileInputTeacherRef = useRef<HTMLInputElement | null>(null);
  const [uploadingTeacherPhoto, setUploadingTeacherPhoto] = useState(false);

  // Sub-items forms inside Admin Dashboard
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnImportant, setNewAnnImportant] = useState(false);
  const [newAnnImage, setNewAnnImage] = useState('');
  const annImageRef = useRef<HTMLInputElement | null>(null);

  // Latihan Soal & Tugas PR state
  const [newAsgType, setNewAsgType] = useState<'latihan' | 'tugas'>('latihan');
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgSubject, setNewAsgSubject] = useState('Matematika');
  const [newAsgDate, setNewAsgDate] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');

  // Edit Assignment Modal
  const [editingAsg, setEditingAsg] = useState<Assignment | null>(null);
  const [editAsgType, setEditAsgType] = useState<'latihan' | 'tugas'>('latihan');
  const [editAsgTitle, setEditAsgTitle] = useState('');
  const [editAsgSubject, setEditAsgSubject] = useState('');
  const [editAsgDate, setEditAsgDate] = useState('');
  const [editAsgDesc, setEditAsgDesc] = useState('');
  const [savingEditAsg, setSavingEditAsg] = useState(false);

  // Search & Filter state
  const [asgSearchQuery, setAsgSearchQuery] = useState('');
  const [asgTypeFilter, setAsgTypeFilter] = useState<'all' | 'latihan' | 'tugas'>('all');

  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState('Kegiatan Kelas');
  const [newMemoryDesc, setNewMemoryDesc] = useState('');
  const [newMemoryType, setNewMemoryType] = useState<'photo' | 'video'>('photo');
  const [newMemoryUrl, setNewMemoryUrl] = useState('');
  const memoryImageRef = useRef<HTMLInputElement | null>(null);

  // Real-time listeners
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push(d.data() as UserProfile));
      setMembers(list);
    });

    const unsubWhitelist = onSnapshot(collection(db, 'admin_whitelist'), (snap) => {
      const list: { email: string; role: string; addedAt?: string }[] = [];
      snap.forEach((d) => list.push({ email: d.id, ...(d.data() as any) }));
      setWhitelistedAdmins(list);
    });

    const unsubAnn = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snap) => {
      const list: Announcement[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setAnnouncements(list);
    });

    const unsubAsg = onSnapshot(collection(db, 'assignments'), (snap) => {
      const list: Assignment[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setAssignments(list);
    });

    const unsubSch = onSnapshot(collection(db, 'schedules'), (snap) => {
      const list: ClassSchedule[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setSchedules(list);
    });

    const unsubDut = onSnapshot(collection(db, 'dutySchedules'), (snap) => {
      const list: DutySchedule[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setDuties(list);
    });

    const unsubCal = onSnapshot(collection(db, 'calendarEvents'), (snap) => {
      const list: CalendarEvent[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setEvents(list);
    });

    const unsubMem = onSnapshot(query(collection(db, 'memories'), orderBy('createdAt', 'desc')), (snap) => {
      const list: MemoryItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setMemories(list);
    });

    const unsubSug = onSnapshot(query(collection(db, 'suggestions'), orderBy('createdAt', 'desc')), (snap) => {
      const list: Suggestion[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setSuggestions(list);
    });

    const unsubPol = onSnapshot(collection(db, 'polls'), (snap) => {
      const list: Poll[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setPolls(list);
    });

    return () => {
      unsubUsers();
      unsubWhitelist();
      unsubAnn();
      unsubAsg();
      unsubSch();
      unsubDut();
      unsubCal();
      unsubMem();
      unsubSug();
      unsubPol();
    };
  }, []);

  // Handler for uploading Wali Kelas Photo from Device Gallery
  const handleTeacherPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTeacherPhoto(true);
    try {
      const compressedDataUrl = await processImageFile(file, 800, 0.8);
      setHomeroomTeacherPhoto(compressedDataUrl);
    } catch (err: any) {
      alert(err?.message || 'Gagal memilih foto dari galeri.');
    } finally {
      setUploadingTeacherPhoto(false);
    }
  };

  // Handler for uploading announcement banner from gallery
  const handleAnnImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await processImageFile(file, 1200, 0.75);
      setNewAnnImage(compressed);
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses gambar galeri.');
    }
  };

  // Handler for uploading memory photo from gallery
  const handleMemoryImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await processImageFile(file, 1200, 0.75);
      setNewMemoryUrl(compressed);
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses gambar galeri.');
    }
  };

  // Save website settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated: WebsiteSetting = {
        siteName,
        tagline,
        creator,
        homeroomTeacher,
        homeroomTeacherBio,
        homeroomTeacherPhoto,
        themeName: 'Galaxy Premium',
        particleEffect,
        allowRegistration,
        inviteCode,
        maintenanceMode,
      };
      await onUpdateSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Gagal menyimpan pengaturan: ' + (error as Error).message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Add / Remove Admin
  const handleAddWhitelistedAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Hanya Super Admin (THOZ) yang dapat menambahkan admin baru.');
      return;
    }
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('Harap masukkan alamat email Google yang valid.');
      return;
    }

    setAddingAdmin(true);
    try {
      await setDoc(doc(db, 'admin_whitelist', cleanEmail), {
        email: cleanEmail,
        role: newAdminRole,
        addedBy: user?.email || 'super_admin',
        addedAt: new Date().toISOString(),
      });

      const existingUser = members.find((m) => m.email?.toLowerCase() === cleanEmail);
      if (existingUser) {
        await updateDoc(doc(db, 'users', existingUser.uid), { role: newAdminRole });
        await setDoc(doc(db, 'admins', existingUser.uid), {
          uid: existingUser.uid,
          email: existingUser.email,
          role: newAdminRole,
          grantedAt: new Date().toISOString(),
        });
      }

      setNewAdminEmail('');
      alert(`Berhasil mendaftarkan ${maskEmail(cleanEmail)} sebagai ${newAdminRole.toUpperCase()}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admin_whitelist/${cleanEmail}`);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveWhitelistedAdmin = async (adminEmail: string) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Admin yang berhak mencabut hak akses admin.');
      return;
    }
    if (adminEmail === 'thozstorez1@gmail.com') {
      alert('Email Super Admin utama tidak dapat dihapus.');
      return;
    }
    if (!confirm(`Cabut hak akses admin untuk ${maskEmail(adminEmail)}?`)) return;

    try {
      await deleteDoc(doc(db, 'admin_whitelist', adminEmail));
      const existingUser = members.find((m) => m.email?.toLowerCase() === adminEmail);
      if (existingUser) {
        await updateDoc(doc(db, 'users', existingUser.uid), { role: 'anggota' });
        await deleteDoc(doc(db, 'admins', existingUser.uid));
      }
      alert(`Hak akses admin telah dicabut.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admin_whitelist/${adminEmail}`);
    }
  };

  const handleRoleChange = async (memberUid: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Admin yang berhak mengubah hak akses.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', memberUid), { role: newRole });
      if (newRole === 'super_admin' || newRole === 'admin') {
        await setDoc(doc(db, 'admins', memberUid), {
          uid: memberUid,
          role: newRole,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(doc(db, 'admins', memberUid)).catch(() => {});
      }
      alert('Peran pengguna berhasil diperbarui!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${memberUid}`);
    }
  };

  // Quick actions: Announcement
  const handleQuickAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        title: newAnnTitle,
        content: newAnnContent,
        isImportant: newAnnImportant,
        imageUrl: newAnnImage || '',
        authorId: user?.uid || 'admin',
        authorName: profile?.displayName || 'Pengurus 8F',
        createdAt: new Date().toISOString(),
      });
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnImage('');
      alert('Pengumuman baru berhasil diterbitkan ke seluruh kelas!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    }
  };

  // Quick actions: Latihan Soal & Tugas PR
  const handleQuickAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgSubject.trim() || !newAsgDate) {
      alert('Harap lengkapi mata pelajaran, judul latihan/tugas, dan batas tanggal.');
      return;
    }
    try {
      await addDoc(collection(db, 'assignments'), {
        title: newAsgTitle.trim(),
        subject: newAsgSubject.trim(),
        dueDate: newAsgDate,
        description: newAsgDesc.trim() || (newAsgType === 'latihan' ? 'Kerjakan latihan soal ini dengan teliti.' : 'Kerjakan tugas dengan baik dan tepat waktu.'),
        type: newAsgType,
        assignedDate: new Date().toISOString().split('T')[0],
        authorId: user?.uid || 'admin',
        completedBy: [],
        createdAt: new Date().toISOString(),
      });
      setNewAsgTitle('');
      setNewAsgDesc('');
      setNewAsgDate('');
      alert(newAsgType === 'latihan' ? 'Latihan Soal berhasil ditambahkan ke dashboard!' : 'Tugas PR berhasil ditambahkan ke dashboard!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'assignments');
    }
  };

  const handleOpenEditAsg = (asg: Assignment) => {
    setEditingAsg(asg);
    const isLatihan = asg.type === 'latihan' || asg.title.toLowerCase().includes('latihan') || asg.title.toLowerCase().includes('soal');
    setEditAsgType(isLatihan ? 'latihan' : (asg.type || 'tugas'));
    setEditAsgTitle(asg.title);
    setEditAsgSubject(asg.subject);
    setEditAsgDate(asg.dueDate);
    setEditAsgDesc(asg.description || '');
  };

  const handleSaveEditAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsg) return;
    if (!editAsgTitle.trim() || !editAsgSubject.trim() || !editAsgDate) {
      alert('Harap lengkapi mata pelajaran, judul, dan tenggat waktu.');
      return;
    }
    setSavingEditAsg(true);
    try {
      await updateDoc(doc(db, 'assignments', editingAsg.id), {
        title: editAsgTitle.trim(),
        subject: editAsgSubject.trim(),
        dueDate: editAsgDate,
        description: editAsgDesc.trim(),
        type: editAsgType,
        updatedAt: new Date().toISOString(),
      });
      alert('Perubahan Latihan Soal / Tugas berhasil disimpan!');
      setEditingAsg(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignments/${editingAsg.id}`);
    } finally {
      setSavingEditAsg(false);
    }
  };

  const handleRestoreDefaultAssignments = async () => {
    if (!confirm('Pulihkan latihan soal & tugas standar kelas 8F (Matematika & Bahasa Indonesia) ke Firestore?')) return;
    try {
      for (const asg of INITIAL_ASSIGNMENTS) {
        await setDoc(doc(db, 'assignments', asg.id), {
          ...asg,
          type: asg.title.toLowerCase().includes('latihan') ? 'latihan' : 'tugas',
        });
      }
      alert('Latihan Soal & Tugas standar berhasil dipulihkan!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'assignments');
    }
  };

  // Quick actions: Memory upload
  const handleQuickAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryTitle || !newMemoryUrl) return;
    try {
      await addDoc(collection(db, 'memories'), {
        title: newMemoryTitle,
        category: newMemoryCategory,
        description: newMemoryDesc,
        mediaType: newMemoryType,
        url: newMemoryUrl,
        eventDate: 'Terbaru',
        uploaderName: profile?.displayName || 'Admin 8F',
        uploaderId: user?.uid || 'admin',
        likes: [],
        createdAt: new Date().toISOString(),
      });
      setNewMemoryTitle('');
      setNewMemoryUrl('');
      setNewMemoryDesc('');
      alert('Kenangan baru berhasil diunggah ke galeri!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'memories');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-2xl border border-rose-500/40 text-center space-y-4">
        <Lock className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="font-galaxy font-bold text-lg text-white">Akses Terbatas (Admin Only)</h2>
        <p className="text-xs text-slate-300">
          Halaman ini khusus untuk Pengurus Kelas dan Wali Kelas Buk Biba yang memiliki otorisasi
          Super Admin atau Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>FULL-SYSTEM COMMAND CENTER 8F</span>
          </div>
          <h1 className="font-galaxy font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            DASHBOARD ADMIN LENGKAP
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Pusat kendali seluruh fitur, data pelajaran, tugas, galeri, otorisasi, dan pengaturan kelas
          </p>
        </div>

        {/* Privacy Toggle: Show/Hide Email */}
        <button
          onClick={() => setShowFullEmails(!showFullEmails)}
          className="px-3.5 py-2 rounded-xl glass-card border border-purple-500/40 text-xs font-mono text-purple-200 flex items-center gap-2 hover:bg-purple-900/40 transition-colors self-start md:self-auto cursor-pointer"
          title="Sembunyikan / Tampilkan Alamat Email"
        >
          {showFullEmails ? (
            <>
              <EyeOff className="w-4 h-4 text-rose-400" />
              <span>Sembunyikan Email (Privasi Aktif)</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Buka Sensor Email</span>
            </>
          )}
        </button>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex overflow-x-auto pb-2 gap-1.5 scrollbar-none border-b border-purple-500/20">
        {[
          { id: 'ringkasan', label: 'Ringkasan & Metrik', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
          { id: 'identitas', label: 'Identitas & Tema (Foto Wali)', icon: <Settings className="w-3.5 h-3.5" /> },
          { id: 'anggota', label: 'Otorisasi & Anggota', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'pengumuman', label: 'Kelola Pengumuman', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'tugas', label: 'Kelola Latihan Soal & Tugas PR', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'jadwal', label: 'Kelola Jadwal & Piket', icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'kalender', label: 'Kelola Kalender', icon: <Calendar className="w-3.5 h-3.5" /> },
          { id: 'galeri', label: 'Kelola Galeri & Kenangan', icon: <ImageIcon className="w-3.5 h-3.5" /> },
          { id: 'aspirasi', label: 'Tanggapi Kotak Saran', icon: <Inbox className="w-3.5 h-3.5" /> },
          { id: 'panduan', label: 'Panduan & Rules', icon: <Terminal className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 border border-purple-400/40'
                : 'glass-card text-slate-300 hover:text-white hover:bg-white/5 border border-purple-500/20'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-purple-500/25">
              <span className="text-[11px] font-mono text-purple-300">Pengguna Terdaftar</span>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">{members.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Siswa kelas 8F</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-purple-500/25">
              <span className="text-[11px] font-mono text-cyan-300">Pengumuman Aktif</span>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">{announcements.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Pemberitahuan resmi</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-purple-500/25">
              <span className="text-[11px] font-mono text-pink-300">Tugas & PR</span>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">{assignments.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Mata pelajaran</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-purple-500/25">
              <span className="text-[11px] font-mono text-emerald-300">Kenangan di Galeri</span>
              <h3 className="font-galaxy font-extrabold text-2xl text-white mt-1">{memories.length}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Foto & video bersama</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-purple-500/30 space-y-4">
            <h3 className="font-galaxy font-bold text-base text-white">Status Hak Akses Anda</h3>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-white">
                  {profile?.displayName} ({isSuperAdmin ? 'SUPER ADMIN UTAMA' : 'ADMIN'})
                </p>
                <p className="text-purple-300 font-mono">
                  Email: {showFullEmails ? user?.email : maskEmail(user?.email || '')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono self-start sm:self-auto">
                Status Akun: Aktif & Penuh
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IDENTITAS & TEMA (DENGAN UPLOAD FOTO DARI GALERI HP) */}
      {activeTab === 'identitas' && (
        <form onSubmit={handleSaveSettings} className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
            <div>
              <h3 className="font-galaxy font-bold text-lg text-white">
                Identitas Website & Foto Wali Kelas (Upload Langsung dari Galeri)
              </h3>
              <p className="text-xs text-purple-300/70">
                Ubah nama website, wali kelas, teks sambutan, atau upload foto langsung dari galeri HP/laptop
              </p>
            </div>

            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-300 font-semibold animate-in fade-in">
                <Check className="w-4 h-4" /> Pengaturan Tersimpan!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Nama Website Kelas
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Tagline Utama
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Identitas Pembuat Website
              </label>
              <input
                type="text"
                required
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Identitas Wali Kelas
              </label>
              <input
                type="text"
                required
                value={homeroomTeacher}
                onChange={(e) => setHomeroomTeacher(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
            </div>

            {/* Upload Foto Wali Kelas dari Galeri HP */}
            <div className="md:col-span-2 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
              <label className="text-xs font-semibold text-cyan-300 block">
                Foto Profil Wali Kelas (BUK BIBA) — Pilih dari Galeri HP / File
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={
                    homeroomTeacherPhoto ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=BukBiba8F'
                  }
                  alt="Wali Kelas Buk Biba"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md shrink-0"
                />

                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      ref={fileInputTeacherRef}
                      onChange={handleTeacherPhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputTeacherRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingTeacherPhoto ? 'Memproses Foto...' : 'Pilih Foto dari Galeri HP'}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Atau tempelkan link URL foto jika ada..."
                    value={homeroomTeacherPhoto}
                    onChange={(e) => setHomeroomTeacherPhoto(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-purple-500/20 rounded-xl text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-purple-200 block mb-1">
                Deskripsi / Pesan Bimbingan Wali Kelas Buk Biba
              </label>
              <textarea
                rows={3}
                value={homeroomTeacherBio}
                onChange={(e) => setHomeroomTeacherBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <input
                type="checkbox"
                id="particle-toggle-admin"
                checked={particleEffect}
                onChange={(e) => setParticleEffect(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="particle-toggle-admin" className="text-xs text-purple-200 cursor-pointer">
                Aktifkan Efek Partikel & Bintang Bergerak Galaxy
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-500/20 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: OTORISASI & ANGGOTA (DENGAN EMAIL TERSEMBUNYI) */}
      {activeTab === 'anggota' && (
        <div className="space-y-6">
          {/* Box Tambah Admin Baru via Email */}
          {isSuperAdmin && (
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 space-y-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-galaxy font-bold text-base text-white">
                    Angkat Admin Baru via Email (Misal: Akun Google Buk Biba)
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Daftarkan alamat email Google agar saat login otomatis mendapatkan hak akses Admin / Super Admin.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddWhitelistedAdmin} className="flex flex-col sm:flex-row gap-3 pt-1">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Masukkan email Google (misal: bukbiba@gmail.com)"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="admin">Tingkat: Admin (Pengurus / Guru)</option>
                  <option value="super_admin">Tingkat: Super Admin (Penuh)</option>
                </select>

                <button
                  type="submit"
                  disabled={addingAdmin || !newAdminEmail.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  {addingAdmin ? 'Mendaftarkan...' : 'Jadikan Admin'}
                </button>
              </form>
            </div>
          )}

          {/* Daftar Admin Terdaftar (Email disembunyikan/disensor) */}
          {whitelistedAdmins.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-3">
              <h4 className="font-galaxy font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Daftar Email Admin yang Telah Diizinkan ({whitelistedAdmins.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {whitelistedAdmins.map((item) => (
                  <div
                    key={item.email}
                    className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/25 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-mono text-white truncate font-medium">
                        {showFullEmails ? item.email : maskEmail(item.email)}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono capitalize bg-purple-900/60 text-purple-300 border border-purple-500/30 mt-1">
                        {item.role.replace('_', ' ')}
                      </span>
                    </div>
                    {isSuperAdmin && item.email !== 'thozstorez1@gmail.com' && (
                      <button
                        onClick={() => handleRemoveWhitelistedAdmin(item.email)}
                        title="Cabut Akses Admin"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabel Anggota Siswa (Email disembunyikan/disensor demi privasi) */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div>
                <h3 className="font-galaxy font-bold text-base text-white">
                  Daftar Pengguna & Hak Akses Akun
                </h3>
                <p className="text-xs text-purple-300/70">
                  Email disembunyikan secara default untuk menjaga privasi seluruh siswa 8F.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari anggota..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-500/20 text-purple-300 font-mono">
                    <th className="py-3 px-3">Pengguna</th>
                    <th className="py-3 px-3">Email (Privasi)</th>
                    <th className="py-3 px-3">Peran Saat Ini</th>
                    <th className="py-3 px-3 text-right">Ubah Peran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {members
                    .filter((m) =>
                      (m.displayName || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
                      (m.email || '').toLowerCase().includes(memberSearch.toLowerCase())
                    )
                    .map((m) => (
                      <tr key={m.uid} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2">
                          <img
                            src={
                              m.photoURL ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${m.uid}`
                            }
                            alt=""
                            className="w-7 h-7 rounded-lg"
                          />
                          <span className="font-medium text-white">{m.displayName}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          {showFullEmails ? m.email : maskEmail(m.email)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                              m.role === 'super_admin'
                                ? 'bg-purple-950 text-purple-300 border border-purple-500'
                                : m.role === 'admin'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {m.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isSuperAdmin && m.email !== 'thozstorez1@gmail.com' ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.uid, e.target.value as UserRole)}
                              className="px-2 py-1 bg-slate-950 border border-purple-500/30 rounded-lg text-xs text-white"
                            >
                              <option value="anggota">Anggota Biasa</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          ) : (
                            <span className="text-slate-500 italic">Terkunci (Super Admin Utama)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA PENGUMUMAN DENGAN UPLOAD FOTO DARI GALERI */}
      {activeTab === 'pengumuman' && (
        <div className="space-y-6">
          <form onSubmit={handleQuickAddAnnouncement} className="glass-card rounded-2xl p-6 border border-purple-500/30 space-y-4">
            <h3 className="font-galaxy font-bold text-base text-white">Terbitkan Pengumuman Kelas Baru</h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder="Judul pengumuman..."
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
              <textarea
                rows={3}
                required
                placeholder="Isi detail pengumuman..."
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none"
              />

              {/* Upload Foto Pengumuman dari Galeri */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  ref={annImageRef}
                  onChange={handleAnnImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => annImageRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-center gap-2 hover:bg-purple-900/40 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  Pilih Gambar dari Galeri HP
                </button>
                {newAnnImage && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5" /> Gambar Galeri Terpilih
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ann-important-check"
                  checked={newAnnImportant}
                  onChange={(e) => setNewAnnImportant(e.target.checked)}
                  className="rounded text-rose-500"
                />
                <label htmlFor="ann-important-check" className="text-xs text-rose-300 font-semibold cursor-pointer">
                  Tandai Sangat Penting (Highlight Merah)
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Publikasikan Pengumuman
              </button>
            </div>
          </form>

          {/* List announcements */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-3">
            <h4 className="font-galaxy font-bold text-sm text-white">Daftar Pengumuman Aktif</h4>
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-xs text-white">{ann.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ann.content}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm('Hapus pengumuman ini?')) {
                        await deleteDoc(doc(db, 'announcements', ann.id));
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KELOLA LATIHAN SOAL & TUGAS PR */}
      {activeTab === 'tugas' && (
        <div className="space-y-6">
          {/* Header & Quick Restore */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mb-1">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>PUSAT KENDALI SOAL & TUGAS KELAS 8F</span>
              </div>
              <h3 className="font-galaxy font-bold text-lg text-white">
                Kelola Latihan Soal & Tugas PR
              </h3>
              <p className="text-xs text-purple-300/80">
                Atur latihan soal, kuis pemahaman, dan tugas PR. Seluruh data tersinkron langsung ke Dashboard Utama & Menu Tugas siswa.
              </p>
            </div>

            <button
              onClick={handleRestoreDefaultAssignments}
              type="button"
              className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-xs font-semibold text-purple-200 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors shadow-sm"
              title="Pulihkan Latihan Soal & Tugas Standar 8F"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pulihkan Soal Standar 8F</span>
            </button>
          </div>

          {/* Form Tambah Latihan Soal / Tugas Baru */}
          <form onSubmit={handleQuickAddAssignment} className="glass-card rounded-2xl p-6 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
              <h3 className="font-galaxy font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Tambah Latihan Soal atau Tugas Baru
              </h3>

              {/* Type Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-purple-500/30 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewAsgType('latihan')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    newAsgType === 'latihan'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Latihan Soal
                </button>
                <button
                  type="button"
                  onClick={() => setNewAsgType('tugas')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    newAsgType === 'tugas'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Tugas & PR
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-purple-300 block mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Matematika, IPA, B.Indo"
                  value={newAsgSubject}
                  onChange={(e) => setNewAsgSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-purple-300 block mb-1">
                  {newAsgType === 'latihan' ? 'Judul Latihan Soal' : 'Judul Tugas / PR'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newAsgType === 'latihan'
                      ? 'Misal: Latihan Soal Pythagoras Bab 4'
                      : 'Misal: Tugas Mandiri Resensi Buku'
                  }
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-purple-300 block mb-1">Tenggat Waktu (Due Date)</label>
                <input
                  type="date"
                  required
                  value={newAsgDate}
                  onChange={(e) => setNewAsgDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-purple-300 block mb-1">
                {newAsgType === 'latihan'
                  ? 'Detail Butir Soal & Panduan Pengerjaan'
                  : 'Instruksi Pengerjaan Tugas & Pengumpulan'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  newAsgType === 'latihan'
                    ? '1. Tuliskan rumus Pythagoras...\n2. Kerjakan di buku latihan kotak halaman 142...\n3. Kumpulkan saat jam pelajaran dimulai.'
                    : 'Tuliskan detail instruksi, format penulisan, dan kriteria penilaian tugas ini...'
                }
                value={newAsgDesc}
                onChange={(e) => setNewAsgDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-cyan-900/30 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {newAsgType === 'latihan' ? 'Terbitkan Latihan Soal' : 'Terbitkan Tugas & PR'}
                </span>
              </button>
            </div>
          </form>

          {/* List Latihan Soal & Tugas */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div>
                <h4 className="font-galaxy font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Daftar Latihan Soal & Tugas Aktif ({assignments.length})
                </h4>
                <p className="text-[11px] text-purple-300/70">
                  Anda dapat mengubah (edit) judul, isi pertanyaan/soal, atau menghapus item yang sudah usai.
                </p>
              </div>

              {/* Filter and Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari mapel / judul..."
                    value={asgSearchQuery}
                    onChange={(e) => setAsgSearchQuery(e.target.value)}
                    className="w-36 sm:w-48 pl-8 pr-3 py-1.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex rounded-xl bg-slate-950 border border-purple-500/30 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAsgTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      asgTypeFilter === 'all' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setAsgTypeFilter('latihan')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      asgTypeFilter === 'latihan' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Latihan Soal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAsgTypeFilter('tugas')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      asgTypeFilter === 'tugas' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tugas PR
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {assignments
                .filter((asg) => {
                  const matchQuery =
                    asg.title.toLowerCase().includes(asgSearchQuery.toLowerCase()) ||
                    asg.subject.toLowerCase().includes(asgSearchQuery.toLowerCase());
                  const isLatihan =
                    asg.type === 'latihan' ||
                    asg.title.toLowerCase().includes('latihan') ||
                    asg.title.toLowerCase().includes('soal');
                  if (asgTypeFilter === 'latihan') return matchQuery && isLatihan;
                  if (asgTypeFilter === 'tugas') return matchQuery && !isLatihan;
                  return matchQuery;
                })
                .map((asg) => {
                  const isLatihan =
                    asg.type === 'latihan' ||
                    asg.title.toLowerCase().includes('latihan') ||
                    asg.title.toLowerCase().includes('soal');
                  const completedCount = asg.completedBy?.length || 0;

                  return (
                    <div
                      key={asg.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/25 hover:border-purple-400/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                              isLatihan
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                                : 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                            }`}
                          >
                            {isLatihan ? (
                              <>
                                <HelpCircle className="w-3 h-3 text-cyan-400" />
                                Latihan Soal
                              </>
                            ) : (
                              <>
                                <BookOpen className="w-3 h-3 text-purple-400" />
                                Tugas & PR
                              </>
                            )}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-purple-500/20 text-[10px] text-purple-200 font-mono">
                            {asg.subject}
                          </span>

                          <span className="text-[11px] text-rose-300 font-mono">
                            Tenggat: {asg.dueDate}
                          </span>

                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                            {completedCount} Siswa Selesai
                          </span>
                        </div>

                        <h5 className="font-semibold text-sm text-white">{asg.title}</h5>

                        {asg.description && (
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-2">
                            {asg.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons: Edit & Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAsg(asg)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Edit Latihan Soal / Tugas Ini"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Ubah / Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Hapus "${asg.title}" dari database kelas?`)) {
                              await deleteDoc(doc(db, 'assignments', asg.id));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

              {assignments.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-slate-400">Belum ada latihan soal atau tugas yang tersimpan.</p>
                  <button
                    type="button"
                    onClick={handleRestoreDefaultAssignments}
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Muat Latihan Soal Standar 8F
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Edit Latihan Soal / Tugas */}
          {editingAsg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
              <div className="glass-card w-full max-w-xl rounded-2xl border border-cyan-500/40 p-6 space-y-4 bg-[#0a0624] shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="font-galaxy font-bold text-base text-white">
                        Ubah Latihan Soal / Tugas
                      </h3>
                      <p className="text-[11px] text-purple-300/70">
                        Perubahan akan langsung terupdate di dashboard utama kelas 8F
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingAsg(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditAssignment} className="space-y-4">
                  {/* Type Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-200">Jenis:</span>
                    <button
                      type="button"
                      onClick={() => setEditAsgType('latihan')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        editAsgType === 'latihan'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Latihan Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAsgType('tugas')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        editAsgType === 'tugas'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Tugas & PR
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-purple-300 block mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        required
                        value={editAsgSubject}
                        onChange={(e) => setEditAsgSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-purple-300 block mb-1">
                        Tenggat Waktu
                      </label>
                      <input
                        type="date"
                        required
                        value={editAsgDate}
                        onChange={(e) => setEditAsgDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Judul Latihan Soal / Tugas
                    </label>
                    <input
                      type="text"
                      required
                      value={editAsgTitle}
                      onChange={(e) => setEditAsgTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Deskripsi & Butir Soal Lengkap
                    </label>
                    <textarea
                      rows={5}
                      value={editAsgDesc}
                      onChange={(e) => setEditAsgDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
                    <button
                      type="button"
                      onClick={() => setEditingAsg(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingEditAsg}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingEditAsg ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: KELOLA JADWAL & PIKET */}
      {activeTab === 'jadwal' && (
        <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-6">
          <div>
            <h3 className="font-galaxy font-bold text-base text-white">Manajemen Jadwal Pelajaran</h3>
            <p className="text-xs text-purple-300/70">Daftar sesi mata pelajaran per hari</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schedules.map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 text-[10px] font-mono">
                    {s.day} • {s.time}
                  </span>
                  <p className="font-semibold text-white mt-1">{s.subject}</p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm('Hapus mapel ini?')) {
                      await deleteDoc(doc(db, 'schedules', s.id));
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: KELOLA KALENDER */}
      {activeTab === 'kalender' && (
        <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-4">
          <h3 className="font-galaxy font-bold text-base text-white">Daftar Agenda Kegiatan & Ujian</h3>
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-cyan-300 font-mono">{ev.category} • {ev.date}</span>
                  <p className="font-semibold text-white">{ev.title}</p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm('Hapus agenda ini?')) {
                      await deleteDoc(doc(db, 'calendarEvents', ev.id));
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: KELOLA GALERI DENGAN UPLOAD DARI HP */}
      {activeTab === 'galeri' && (
        <div className="space-y-6">
          <form onSubmit={handleQuickAddMemory} className="glass-card rounded-2xl p-6 border border-purple-500/30 space-y-4">
            <h3 className="font-galaxy font-bold text-base text-white">Upload Foto / Video ke Galeri Kelas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Judul foto kenangan..."
                value={newMemoryTitle}
                onChange={(e) => setNewMemoryTitle(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                placeholder="Kategori (misal: Kegiatan, Olahraga)"
                value={newMemoryCategory}
                onChange={(e) => setNewMemoryCategory(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white"
              />
            </div>

            {/* Direct Gallery Upload Trigger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="file"
                ref={memoryImageRef}
                onChange={handleMemoryImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => memoryImageRef.current?.click()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Upload className="w-4 h-4" />
                Pilih Foto dari Galeri HP
              </button>

              {newMemoryUrl && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5" /> Foto Galeri Siap Diunggah
                </span>
              )}
            </div>

            <textarea
              rows={2}
              placeholder="Cerita singkat momen ini..."
              value={newMemoryDesc}
              onChange={(e) => setNewMemoryDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-white resize-none"
            />

            <button
              type="submit"
              className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Simpan ke Galeri
            </button>
          </form>

          <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-4">
            <h4 className="font-galaxy font-bold text-sm text-white">Foto & Video di Galeri ({memories.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {memories.map((m) => (
                <div key={m.id} className="relative rounded-xl overflow-hidden group border border-purple-500/25">
                  <img src={m.url} alt="" className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={async () => {
                        if (confirm('Hapus foto ini dari galeri?')) {
                          await deleteDoc(doc(db, 'memories', m.id));
                        }
                      }}
                      className="p-2 rounded-full bg-rose-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: TANGGAPI KOTAK SARAN */}
      {activeTab === 'aspirasi' && (
        <div className="glass-card rounded-2xl p-6 border border-purple-500/25 space-y-4">
          <h3 className="font-galaxy font-bold text-base text-white">Tanggapi Kotak Saran Siswa 8F</h3>
          <div className="space-y-3">
            {suggestions.map((sug) => (
              <div key={sug.id} className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-purple-300 font-mono">
                  <span>{sug.category} • Pengirim: {sug.isAnonymous ? 'Anonim' : sug.senderName}</span>
                  <span className="capitalize">{sug.status}</span>
                </div>
                <p className="text-white">"{sug.content}"</p>
                {sug.reply && (
                  <p className="text-cyan-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/20">
                    Balasan: {sug.reply}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: PANDUAN LENGKAP */}
      {activeTab === 'panduan' && (
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-purple-500/25 space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="font-galaxy font-bold text-base text-white">Full-System Architecture Notes</h3>
          <p>
            Dashboard Admin ini memiliki kendali langsung ke seluruh koleksi database Cloud Firestore:
            Pengumuman, Jadwal, Tugas, Galeri, Kalender, Aspirasi, serta Otorisasi Role tanpa perlu perantara eksternal.
          </p>
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
            <strong>Catatan Keamanan & Privasi:</strong> Email siswa secara otomatis disensor dengan format <code>abc***@domain.com</code> demi menjaga privasi siswa. Anda dapat menekan tombol <strong>"Buka Sensor Email"</strong> di pojok kanan atas kapan saja saat perlu melakukan verifikasi identitas.
          </div>
        </div>
      )}
    </div>
  );
};
