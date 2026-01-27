import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/types';
import { DEMO_MODE, MOCK_USER, mockDelay } from '@/lib/mock';

// Only import Firebase if not in demo mode
let firebaseFunctions: any = null;
if (!DEMO_MODE) {
  firebaseFunctions = require('@/lib/firebase');
}

interface AuthState {
  // State
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: () => {
    if (DEMO_MODE) {
      // In demo mode, just mark as initialized (not logged in)
      setTimeout(() => {
        set({ isInitialized: true, isLoading: false });
      }, 500);
      return () => {};
    }

    const unsubscribe = firebaseFunctions.onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userProfile = await firebaseFunctions.getUserProfile(firebaseUser.uid);
          set({
            firebaseUser,
            user: userProfile,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          set({
            firebaseUser,
            user: null,
            isInitialized: true,
            isLoading: false,
          });
        }
      } else {
        set({
          firebaseUser: null,
          user: null,
          isInitialized: true,
          isLoading: false,
        });
      }
    });

    return unsubscribe;
  },

  signUp: async (email, password, displayName) => {
    if (DEMO_MODE) {
      // In demo mode, just sign in with mock user
      await get().signInDemo();
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await firebaseFunctions.signUpWithEmail(email, password, displayName);
      const userProfile = await firebaseFunctions.getUserProfile(firebaseUser.uid);
      set({
        firebaseUser,
        user: userProfile,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to sign up',
        isLoading: false,
      });
      throw error;
    }
  },

  signIn: async (email, password) => {
    if (DEMO_MODE) {
      // In demo mode, just sign in with mock user
      await get().signInDemo();
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await firebaseFunctions.signInWithEmail(email, password);
      const userProfile = await firebaseFunctions.getUserProfile(firebaseUser.uid);
      set({
        firebaseUser,
        user: userProfile,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to sign in',
        isLoading: false,
      });
      throw error;
    }
  },

  signInDemo: async () => {
    set({ isLoading: true, error: null });
    await mockDelay(800);
    set({
      user: MOCK_USER,
      firebaseUser: null,
      isLoading: false,
    });
  },

  signOut: async () => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);
      set({
        firebaseUser: null,
        user: null,
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.signOut();
      set({
        firebaseUser: null,
        user: null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to sign out',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProfile: async (data) => {
    const { user, firebaseUser } = get();
    if (!user) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);
      set({
        user: { ...user, ...data },
        isLoading: false,
      });
      return;
    }

    if (!firebaseUser) return;

    try {
      await firebaseFunctions.updateUserProfile(firebaseUser.uid, data);
      set({
        user: { ...user, ...data },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
