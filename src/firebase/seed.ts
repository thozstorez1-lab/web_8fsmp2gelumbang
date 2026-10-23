import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { WebsiteSetting } from '../types';

export const DEFAULT_SETTINGS: WebsiteSetting = {
  siteName: '8F WEB CLASS',
  tagline: 'ONE CLASS, ONE FAMILY, ONE FUTURE.',
  creator: 'CREATED BY THOZ — WAKLENG',
  homeroomTeacher: 'BUK BIBA',
  homeroomTeacherBio: 'Wali Kelas 8F Tercinta — Membimbing dengan hati, menginspirasi masa depan cemerlang generasi 8F.',
  homeroomTeacherPhoto: 'https://api.dicebear.com/7.x/bottts/svg?seed=BukBiba8F',
  themeName: 'Galaxy Premium',
  particleEffect: true,
  allowRegistration: 'open',
  inviteCode: '8FGALAXY',
  maintenanceMode: false,
};

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Selamat Datang di Website Resmi 8F Web Class! 🚀',
    content: 'Hai seluruh pejuang 8F! Website resmi kelas kita kini telah aktif berkat karya THOZ — WAKLENG. Website ini menjadi ruang bersama untuk tugas, jadwal, kenangan, pengumuman, dan komunikasi antar sesama anggota kelas di bawah bimbingan Buk Biba. Selamat mengeksplorasi!',
    authorId: 'system',
    authorName: 'BUK BIBA & THOZ',
    isImportant: true,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Jadwal Pengumpulan Tugas Portofolio & Proyek Kreatif',
    content: 'Diberitahukan kepada seluruh siswa 8F agar mengecek menu Tugas dan PR untuk pengumpulan tugas mingguan tepat waktu. Hubungi admin atau ketua kelas jika membutuhkan bantuan.',
    authorId: 'system',
    authorName: 'Pengurus Kelas 8F',
    isImportant: false,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_SCHEDULES = [
  { id: 'sch-1', day: 'Senin', time: '07:00 - 07:45', subject: 'Upacara Bendera', room: 'Lapangan Utama', notes: 'Pakaian Lengkap Dasi & Topi' },
  { id: 'sch-2', day: 'Senin', time: '07:45 - 09:15', subject: 'Matematika', room: 'Ruang 8F', notes: 'Buku Paket Bab 4' },
  { id: 'sch-3', day: 'Senin', time: '09:30 - 11:00', subject: 'Bahasa Indonesia', room: 'Ruang 8F', notes: 'Teks Persuasi' },
  { id: 'sch-4', day: 'Senin', time: '11:15 - 12:45', subject: 'IPA Fisika', room: 'Lab IPA', notes: 'Praktikum Optik' },
  { id: 'sch-5', day: 'Selasa', time: '07:30 - 09:00', subject: 'Bahasa Inggris', room: 'Ruang 8F', notes: 'Speaking Practice' },
  { id: 'sch-6', day: 'Selasa', time: '09:15 - 10:45', subject: 'IPS Sejarah', room: 'Ruang 8F', notes: 'Bab Pergerakan Nasional' },
  { id: 'sch-7', day: 'Selasa', time: '11:00 - 12:30', subject: 'Seni Budaya', room: 'Ruang Seni', notes: 'Bawa Alat Gambar' },
  { id: 'sch-8', day: 'Rabu', time: '07:30 - 09:00', subject: 'Informatika / Komputer', room: 'Lab Komputer 1', notes: 'Praktikum Web & Coding' },
  { id: 'sch-9', day: 'Rabu', time: '09:15 - 10:45', subject: 'PJOK Olahraga', room: 'Lapangan Olahraga', notes: 'Baju Olahraga Resmi' },
  { id: 'sch-10', day: 'Rabu', time: '11:00 - 12:30', subject: 'Pendidikan Pancasila (PPKn)', room: 'Ruang 8F', notes: 'Diskusi Kelompok' },
  { id: 'sch-11', day: 'Kamis', time: '07:30 - 09:00', subject: 'Pendidikan Agama (PAI)', room: 'Ruang 8F / Musholla', notes: 'Bawa Al-Quran / Kitab' },
  { id: 'sch-12', day: 'Kamis', time: '09:15 - 10:45', subject: 'Bahasa Daerah', room: 'Ruang 8F', notes: 'Kamus Bahasa Daerah' },
  { id: 'sch-13', day: 'Kamis', time: '11:00 - 12:30', subject: 'Matematika Latihan', room: 'Ruang 8F', notes: 'Buku Kotak Latihan' },
  { id: 'sch-14', day: 'Jumat', time: '07:00 - 08:30', subject: 'Jumat Bersih & Rohani', room: 'Lingkungan Sekolah', notes: 'Bawa Alat Kebersihan' },
  { id: 'sch-15', day: 'Jumat', time: '08:45 - 10:15', subject: 'Bimbingan Konseling (BK)', room: 'Ruang 8F', notes: 'Konsultasi Belajar' },
];

export const INITIAL_DUTIES = [
  { id: 'dut-1', day: 'Senin', members: ['Rayhan Al-Ghifari', 'Naufal Pratama', 'Zahra Amelia', 'Aisyah Putri', 'Dimas Prasetyo'], tasks: 'Sapu lantai kelas, rapikan meja guru, siapkan spidol & penghapus.' },
  { id: 'dut-2', day: 'Selasa', members: ['Fajar Hidayat', 'Rian Saputra', 'Cindy Claudia', 'Nabila Shafa', 'Kevin Maulana'], tasks: 'Hapus papan tulis, buang sampah ke bak luar, rapikan tirai jendela.' },
  { id: 'dut-3', day: 'Rabu', members: ['Alif Ramadhan', 'Bima Sakti', 'Tiara Andini', 'Maya Kusuma', 'Rafi Ahmad'], tasks: 'Mengepel lantai lorong depan kelas, pastikan proyektor siap digunakan.' },
  { id: 'dut-4', day: 'Kamis', members: ['Dika Fernando', 'Ilham Akbar', 'Putri Ayu', 'Salma Zahirah', 'Farhan Kurnia'], tasks: 'Lap kaca jendela, rapikan susunan bangku, siram tanaman sudut kelas.' },
  { id: 'dut-5', day: 'Jumat', members: ['Seluruh Anggota Kelas 8F', 'Koordinator Kebersihan'], tasks: 'Jumat Bersih Massal bersama Wali Kelas Buk Biba.' },
];

export const INITIAL_RULES = [
  { id: 'rul-1', title: 'Kedisiplinan & Kehadiran', category: 'Tata Tertib', description: 'Hadir di kelas sebelum pukul 07.00 WIB. Keterlambatan atau izin harus melapor ke Wali Kelas Buk Biba atau piket.', order: 1 },
  { id: 'rul-2', title: 'Menjaga Persaudaraan & Anti-Bullying', category: 'Etika & Sikap', description: 'Kelas 8F adalah satu keluarga (One Class, One Family). Tidak diperkenankan melakukan perundungan, mengejek, atau mendiskriminasi sesama teman.', order: 2 },
  { id: 'rul-3', title: 'Kebersihan & Kerapian Ruang 8F', category: 'Lingkungan', description: 'Setiap siswa bertanggung jawab menjaga kebersihan di bawah mejanya masing-masing dan mendukung petugas piket harian.', order: 3 },
  { id: 'rul-4', title: 'Penggunaan Gadget & Ponsel', category: 'Teknologi', description: 'Ponsel hanya digunakan saat guru menginstruksikan kegiatan belajar digital, riset pelajaran, atau akses portal 8F Web Class.', order: 4 },
  { id: 'rul-5', title: 'Kejujuran Akademik & Kerjasama Sehat', category: 'Akademik', description: 'Mengerjakan tugas dengan sungguh-sungguh, tidak mencontek ujian, dan saling membantu dalam belajar kelompok.', order: 5 },
];

export const INITIAL_ACHIEVEMENTS = [
  { id: 'ach-1', title: 'Juara 1 Lomba Kebersihan & Kerapian Kelas', category: 'Prestasi Sekolah', date: 'Semester Ini', description: 'Kelas 8F meraih predikat kelas paling bersih, tertib, dan bernuansa estetik di tingkat sekolah.', icon: 'Trophy' },
  { id: 'ach-2', title: 'Juara 2 Turnamen Futsal Antar-Kelas', category: 'Olahraga', date: 'Bulan Lalu', description: 'Tim futsal 8F berjuang heroik hingga partai final dengan sportivitas tinggi.', icon: 'Medal' },
  { id: 'ach-3', title: 'Proyek Sains Terbaik — Ekosistem Mini', category: 'Akademik', date: 'Tahun Ajaran Ini', description: 'Kelompok sains 8F memenangkan penghargaan presentasi terinovatif dari guru IPA.', icon: 'Award' },
];

export const INITIAL_MEMORIES = [
  {
    id: 'mem-1',
    title: 'Momen Kebersamaan Kelas 8F Awal Semester',
    category: 'Kegiatan Kelas',
    description: 'Foto bersama satu kelas bersama Wali Kelas Buk Biba di depan teras kelas 8F yang penuh kehangatan dan semangat baru.',
    mediaType: 'photo' as const,
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
    eventDate: 'Awal Semester',
    uploaderName: 'THOZ — WAKLENG',
    uploaderId: 'system',
    likes: ['user1', 'user2'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    title: 'Keseruan Praktikum Sains di Laboratorium',
    category: 'Akademik',
    description: 'Dokumentasi saat seluruh tim 8F melakukan percobaan optik dan mikroskop bersama kelompok masing-masing.',
    mediaType: 'photo' as const,
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    eventDate: 'Bulan Lalu',
    uploaderName: 'Admin 8F',
    uploaderId: 'system',
    likes: ['user1'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    title: 'Video Highlight Class Meeting 8F',
    category: 'Olahraga & Seni',
    description: 'Kompilasi momen seru suporter 8F yang heboh dan semangat tim olahraga kelas di lapangan.',
    mediaType: 'video' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    eventDate: 'Pekan Olahraga',
    uploaderName: 'THOZ — WAKLENG',
    uploaderId: 'system',
    likes: ['user1', 'user3'],
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-1',
    title: 'Latihan Soal Matematika: Teorema Pythagoras & Lingkaran',
    subject: 'Matematika',
    description: 'Kerjakan latihan halaman 142 nomor 1 sampai 10 di buku latihan kotak. Tuliskan rumus dan cara penyelesaian dengan rapi.',
    dueDate: '2026-10-28',
    assignedDate: '2026-10-23',
    authorId: 'system',
    completedBy: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'asg-2',
    title: 'Membuat Naskah Teks Pidato Persuasif Tema Lingkungan',
    subject: 'Bahasa Indonesia',
    description: 'Buat naskah pidato berdurasi 3-5 menit bertemakan kepedulian terhadap kelestarian lingkungan hidup dan kebersihan sekolah.',
    dueDate: '2026-10-30',
    assignedDate: '2026-10-23',
    authorId: 'system',
    completedBy: [],
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_EVENTS = [
  { id: 'ev-1', title: 'Penilaian Tengah Semester (PTS)', date: '2026-11-03', category: 'Ujian' as const, description: 'PTS ganjil serentak seluruh mata pelajaran.' },
  { id: 'ev-2', title: 'Pentas Seni & Bazar Kewirausahaan Sekolah', date: '2026-11-15', category: 'Acara Sekolah' as const, description: 'Stand bazar kelas 8F menjual aneka kreasi kuliner sehat.' },
  { id: 'ev-3', title: 'Study Tour & Observasi Lapangan Planetarium', date: '2026-11-26', category: 'Kegiatan' as const, description: 'Kunjungan edukasi astronomi & fisika bintang bersama rombongan 8F.' },
];

export async function bootstrapWebsiteSettings(): Promise<WebsiteSetting> {
  const settingRef = doc(db, 'websiteSettings', 'general');
  try {
    const snap = await getDoc(settingRef);
    if (!snap.exists()) {
      await setDoc(settingRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return snap.data() as WebsiteSetting;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function bootstrapInitialDataIfEmpty(): Promise<void> {
  try {
    // 1. Seed websiteSettings
    const settingRef = doc(db, 'websiteSettings', 'general');
    const settingSnap = await getDoc(settingRef);
    if (!settingSnap.exists()) {
      await setDoc(settingRef, DEFAULT_SETTINGS);
    }

    // 2. Seed initial assignments (Latihan Soal & Tugas)
    for (const asg of INITIAL_ASSIGNMENTS) {
      const asgRef = doc(db, 'assignments', asg.id);
      const asgSnap = await getDoc(asgRef);
      if (!asgSnap.exists()) {
        await setDoc(asgRef, asg);
      }
    }

    // 3. Seed initial announcements
    for (const ann of INITIAL_ANNOUNCEMENTS) {
      const annRef = doc(db, 'announcements', ann.id);
      const annSnap = await getDoc(annRef);
      if (!annSnap.exists()) {
        await setDoc(annRef, ann);
      }
    }

    // 4. Seed initial schedules
    for (const sch of INITIAL_SCHEDULES) {
      const schRef = doc(db, 'schedules', sch.id);
      const schSnap = await getDoc(schRef);
      if (!schSnap.exists()) {
        await setDoc(schRef, sch);
      }
    }

    // 5. Seed initial duties
    for (const dut of INITIAL_DUTIES) {
      const dutRef = doc(db, 'dutySchedules', dut.id);
      const dutSnap = await getDoc(dutRef);
      if (!dutSnap.exists()) {
        await setDoc(dutRef, dut);
      }
    }
  } catch (e) {
    console.warn('Seeding notice (might require authentication):', e);
  }
}
