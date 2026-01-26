import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/types';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as firebaseSignOut,
  onAuthChange,
  getUserProfile,
  updateUserProfile,
} from '@/lib/firebase';

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
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
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
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await signUpWithEmail(email, password, displayName);
      const userProfile = await getUserProfile(firebaseUser.uid);
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
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await signInWithEmail(email, password);
      const userProfile = await getUserProfile(firebaseUser.uid);
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

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignOut();
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
    if (!user || !firebaseUser) return;

    set({ isLoading: true, error: null });
    try {
      await updateUserProfile(firebaseUser.uid, data);
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
