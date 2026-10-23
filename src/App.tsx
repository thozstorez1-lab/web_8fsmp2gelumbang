/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from './firebase/config';
import {
  DEFAULT_SETTINGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SCHEDULES,
  INITIAL_DUTIES,
  INITIAL_RULES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_MEMORIES,
  INITIAL_ASSIGNMENTS,
  INITIAL_EVENTS,
  bootstrapInitialDataIfEmpty
} from './firebase/seed';
import {
  PageView,
  Announcement,
  Assignment,
  ClassSchedule,
  DutySchedule,
  CalendarEvent,
  GlobalMessage,
  MemoryItem,
  ClassRule,
  ClassAchievement,
  WebsiteSetting
} from './types';
import { AuthProvider } from './context/AuthContext';
import { GalaxyBackground } from './components/GalaxyBackground';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ShareQRModal } from './components/ShareQRModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatGlobalPage } from './pages/ChatGlobalPage';
import { PrivateChatPage } from './pages/PrivateChatPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { MembersPage } from './pages/MembersPage';
import { ProfilePage } from './pages/ProfilePage';
import { CalendarPage } from './pages/CalendarPage';
import { PollsPage } from './pages/PollsPage';
import { SuggestionsPage } from './pages/SuggestionsPage';
import { RulesAchievementsPage } from './pages/RulesAchievementsPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageView>('beranda');
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  // App data states
  const [settings, setSettings] = useState<WebsiteSetting>(DEFAULT_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [schedules, setSchedules] = useState<ClassSchedule[]>(INITIAL_SCHEDULES as any);
  const [duties, setDuties] = useState<DutySchedule[]>(INITIAL_DUTIES as any);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS as any);
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES as any);
  const [rules, setRules] = useState<ClassRule[]>(INITIAL_RULES);
  const [achievements, setAchievements] = useState<ClassAchievement[]>(INITIAL_ACHIEVEMENTS);
  const [membersCount, setMembersCount] = useState<number>(32);

  // 1. Connection test & seed initial data on boot
  useEffect(() => {
    testConnection().then((ok) => {
      if (ok) {
        console.log('Firestore connected successfully.');
        bootstrapInitialDataIfEmpty().catch(() => {});
      }
    });
  }, []);

  // 2. Real-time listeners for core collections
  useEffect(() => {
    // Website Settings
    const unsubSettings = onSnapshot(
      doc(db, 'websiteSettings', 'general'),
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as WebsiteSetting);
        } else {
          // Attempt to bootstrap
          setDoc(doc(db, 'websiteSettings', 'general'), DEFAULT_SETTINGS).catch(() => {});
        }
      },
      (err) => console.warn('Settings load warning:', err)
    );

    // Announcements
    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => {
        const list: Announcement[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setAnnouncements(list.length > 0 ? list : INITIAL_ANNOUNCEMENTS);
      },
      (err) => console.warn('Announcements warning:', err)
    );

    // Assignments
    const unsubAssignments = onSnapshot(
      query(collection(db, 'assignments'), orderBy('dueDate', 'asc')),
      (snap) => {
        if (!snap.empty) {
          const list: Assignment[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setAssignments(list);
        } else {
          // If Firestore collection is empty, seed initial assignments and show them
          for (const asg of INITIAL_ASSIGNMENTS) {
            setDoc(doc(db, 'assignments', asg.id), asg).catch(() => {});
          }
          setAssignments(INITIAL_ASSIGNMENTS);
        }
      },
      (err) => console.warn('Assignments warning:', err)
    );

    // Schedules
    const unsubSchedules = onSnapshot(
      collection(db, 'schedules'),
      (snap) => {
        const list: ClassSchedule[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setSchedules(list.length > 0 ? list : (INITIAL_SCHEDULES as any));
      },
      (err) => console.warn('Schedules warning:', err)
    );

    // Duties
    const unsubDuties = onSnapshot(
      collection(db, 'dutySchedules'),
      (snap) => {
        if (!snap.empty) {
          const list: DutySchedule[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setDuties(list);
        }
      },
      (err) => console.warn('Duties warning:', err)
    );

    // Calendar Events
    const unsubEvents = onSnapshot(
      collection(db, 'calendarEvents'),
      (snap) => {
        if (!snap.empty) {
          const list: CalendarEvent[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setEvents(list);
        }
      },
      (err) => console.warn('Events warning:', err)
    );

    // Global Messages
    const unsubMessages = onSnapshot(
      query(collection(db, 'globalMessages'), orderBy('createdAt', 'asc'), limit(50)),
      (snap) => {
        const list: GlobalMessage[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setMessages(list);
      },
      (err) => console.warn('Messages warning:', err)
    );

    // Memories
    const unsubMemories = onSnapshot(
      query(collection(db, 'memories'), orderBy('createdAt', 'desc'), limit(30)),
      (snap) => {
        if (!snap.empty) {
          const list: MemoryItem[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
          setMemories(list);
        }
      },
      (err) => console.warn('Memories warning:', err)
    );

    // Users count
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        if (!snap.empty) {
          setMembersCount(Math.max(snap.size, 32));
        }
      },
      (err) => console.warn('Users count warning:', err)
    );

    return () => {
      unsubSettings();
      unsubAnnouncements();
      unsubAssignments();
      unsubSchedules();
      unsubDuties();
      unsubEvents();
      unsubMessages();
      unsubMemories();
      unsubUsers();
    };
  }, []);

  const handleUpdateSettings = async (newSettings: WebsiteSetting) => {
    try {
      await setDoc(doc(db, 'websiteSettings', 'general'), newSettings);
      setSettings(newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'websiteSettings/general');
    }
  };

  const handleNavigate = (page: PageView) => {
    if (page === 'share-qr') {
      setShareModalOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Animated Galaxy Sky */}
      {settings.particleEffect && <GalaxyBackground />}

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation Navbar */}
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenShareModal={() => setShareModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1">
          {currentPage === 'beranda' && (
            <LandingPage
              onNavigate={handleNavigate}
              onOpenShareModal={() => setShareModalOpen(true)}
              announcements={announcements}
              settings={settings}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onOpenShareModal={() => setShareModalOpen(true)}
              announcements={announcements}
              assignments={assignments}
              schedules={schedules}
              duties={duties}
              events={events}
              messages={messages}
              memories={memories}
              settings={settings}
              membersCount={membersCount}
            />
          )}

          {currentPage === 'pengumuman' && (
            <AnnouncementsPage announcements={announcements} />
          )}

          {currentPage === 'chat-global' && <ChatGlobalPage />}

          {currentPage === 'chat-pribadi' && <PrivateChatPage />}

          {currentPage === 'tugas' && <AssignmentsPage assignments={assignments} />}

          {currentPage === 'jadwal-pelajaran' && (
            <SchedulesPage schedules={schedules} duties={duties} />
          )}

          {currentPage === 'jadwal-piket' && (
            <SchedulesPage schedules={schedules} duties={duties} />
          )}

          {currentPage === 'kalender' && <CalendarPage events={events} />}

          {currentPage === 'kenangan' && <MemoriesPage memories={memories} defaultFilter="all" />}

          {currentPage === 'galeri-foto' && (
            <MemoriesPage memories={memories} defaultFilter="photo" />
          )}

          {currentPage === 'galeri-video' && (
            <MemoriesPage memories={memories} defaultFilter="video" />
          )}

          {currentPage === 'anggota' && <MembersPage settings={settings} />}

          {currentPage === 'profil' && (
            <ProfilePage onOpenShareModal={() => setShareModalOpen(true)} />
          )}

          {currentPage === 'polling' && <PollsPage />}

          {currentPage === 'kotak-saran' && <SuggestionsPage />}

          {currentPage === 'peraturan' && (
            <RulesAchievementsPage rules={rules} achievements={achievements} defaultTab="rules" />
          )}

          {currentPage === 'pencapaian' && (
            <RulesAchievementsPage
              rules={rules}
              achievements={achievements}
              defaultTab="achievements"
            />
          )}

          {currentPage === 'tentang' && (
            <AboutPage
              settings={settings}
              onOpenShareModal={() => setShareModalOpen(true)}
            />
          )}

          {currentPage === 'notifikasi' && (
            <AnnouncementsPage announcements={announcements} />
          )}

          {currentPage === 'pengaturan' && (
            <ProfilePage onOpenShareModal={() => setShareModalOpen(true)} />
          )}

          {currentPage === 'admin' && (
            <AdminDashboardPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>

        {/* Global Galaxy Footer */}
        <Footer
          onNavigate={handleNavigate}
          onOpenShareModal={() => setShareModalOpen(true)}
        />
      </div>

      {/* Share Web & QR Code Modal */}
      <ShareQRModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
