export type UserRole = 'super_admin' | 'admin' | 'anggota';
export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  role: UserRole;
  status: AccountStatus;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  isImportant?: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface GlobalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: string;
  reactions?: Record<string, string[]>; // emoji -> [uid1, uid2]
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface PrivateMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  authorId: string;
  completedBy: string[]; // uids
  createdAt: string;
  type?: 'latihan' | 'tugas';
}

export interface ClassSchedule {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  subject: string;
  time: string;
  room?: string;
  teacher?: string;
  notes?: string;
}

export interface DutySchedule {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  members: string[];
  tasks: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: 'Ujian' | 'Tugas' | 'Kegiatan' | 'Acara Sekolah' | 'Hari Penting';
  description?: string;
  authorId?: string;
}

export interface ClassRule {
  id: string;
  title: string;
  category: string;
  description: string;
  order: number;
}

export interface ClassAchievement {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  icon?: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  mediaType: 'photo' | 'video';
  url: string;
  eventDate: string;
  uploaderName: string;
  uploaderId: string;
  likes: string[];
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // uids
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  authorId: string;
  authorName: string;
  status: 'active' | 'closed';
  isAnonymous?: boolean;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  senderId?: string;
  senderName?: string;
  category: string;
  content: string;
  isAnonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  reply?: string;
  createdAt: string;
}

export interface WebsiteSetting {
  siteName: string;
  tagline: string;
  creator: string;
  homeroomTeacher: string;
  homeroomTeacherBio: string;
  homeroomTeacherPhoto: string;
  themeName: string;
  particleEffect: boolean;
  allowRegistration: 'open' | 'pending' | 'code';
  inviteCode: string;
  maintenanceMode: boolean;
}

export type PageView =
  | 'beranda'
  | 'dashboard'
  | 'profil'
  | 'anggota'
  | 'chat-global'
  | 'chat-pribadi'
  | 'kenangan'
  | 'galeri-foto'
  | 'galeri-video'
  | 'pengumuman'
  | 'tugas'
  | 'jadwal-pelajaran'
  | 'jadwal-piket'
  | 'kalender'
  | 'polling'
  | 'kotak-saran'
  | 'peraturan'
  | 'pencapaian'
  | 'tentang'
  | 'notifikasi'
  | 'pengaturan'
  | 'admin'
  | 'share-qr';
