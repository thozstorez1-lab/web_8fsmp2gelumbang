import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SUPER_ADMIN_EMAILS = ['thozstorez1@gmail.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const isSuper = SUPER_ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase() || '');

      // Check pre-authorized admin whitelist by email
      let whitelistedRole: UserRole | null = null;
      if (firebaseUser.email) {
        try {
          const wlSnap = await getDoc(doc(db, 'admin_whitelist', firebaseUser.email.toLowerCase()));
          if (wlSnap.exists()) {
            whitelistedRole = (wlSnap.data().role as UserRole) || 'admin';
          }
        } catch {
          // ignore if collection not yet created
        }
      }

      let userProfile: UserProfile;

      if (!userSnap.exists()) {
        const role: UserRole = isSuper ? 'super_admin' : whitelistedRole || 'anggota';
        userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anggota 8F',
          username: (firebaseUser.email?.split('@')[0] || 'siswa_8f').toLowerCase(),
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
          role: role,
          status: 'active',
          bio: isSuper
            ? 'Founder & Developer 8F Web Class (THOZ — WAKLENG)'
            : role === 'admin'
            ? 'Pengurus / Pembina Kelas 8F'
            : 'Siswa bersemangat kelas 8F',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, userProfile);

        // If admin or super admin, sync with /admins/{uid}
        if (isSuper || role === 'admin') {
          try {
            await setDoc(doc(db, 'admins', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: role,
              grantedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.error('Failed to register admin document:', e);
          }
        }
      } else {
        userProfile = userSnap.data() as UserProfile;
        const targetRole = isSuper ? 'super_admin' : whitelistedRole || userProfile.role;
        if (userProfile.role !== targetRole) {
          userProfile.role = targetRole;
          await updateDoc(userRef, { role: targetRole });
          if (targetRole === 'admin' || targetRole === 'super_admin') {
            await setDoc(doc(db, 'admins', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: targetRole,
              grantedAt: new Date().toISOString(),
            });
          }
        }
      }

      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching or creating user profile:', error);
      // Fallback local profile representation if offline
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Pengguna 8F',
        username: (firebaseUser.email?.split('@')[0] || 'user').toLowerCase(),
        photoURL: firebaseUser.photoURL || undefined,
        role: SUPER_ADMIN_EMAILS.includes(firebaseUser.email || '') ? 'super_admin' : 'anggota',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await fetchProfile(result.user);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        alert(`Gagal masuk: ${error?.message || 'Silakan coba lagi.'}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updated = {
        ...profile,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userRef, updated);
      setProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
        loginWithGoogle,
        logout,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
