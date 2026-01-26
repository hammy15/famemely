import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  // @ts-ignore - React Native persistence
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { User, Game, ChampionCard, ChatMessage, Prompt } from '@/types';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Auth functions
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    displayName,
    email: user.email,
    photoURL: null,
    createdAt: serverTimestamp(),
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      roundsWon: 0,
    },
    premium: false,
  });

  return user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = () => auth.currentUser;

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User functions
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  await updateDoc(doc(db, 'users', userId), data);
};

// Game functions
export const createGame = async (hostId: string, settings: Partial<Game['settings']> = {}): Promise<string> => {
  const gameRef = await addDoc(collection(db, 'games'), {
    hostId,
    status: 'lobby',
    players: [hostId],
    maxPlayers: 8,
    currentRound: 0,
    totalRounds: 5,
    currentJudgeIndex: 0,
    currentPrompt: '',
    submissions: {},
    scores: { [hostId]: 0 },
    createdAt: serverTimestamp(),
    settings: {
      timePerRound: 60,
      isPrivate: true,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      ...settings,
    },
  });
  return gameRef.id;
};

export const joinGame = async (gameId: string, playerId: string) => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const game = gameDoc.data() as Game;

  if (game.status !== 'lobby') {
    throw new Error('Game already started');
  }

  if (game.players.length >= game.maxPlayers) {
    throw new Error('Game is full');
  }

  if (game.players.includes(playerId)) {
    return; // Already in game
  }

  await updateDoc(gameRef, {
    players: [...game.players, playerId],
    [`scores.${playerId}`]: 0,
  });
};

export const joinGameByCode = async (code: string, playerId: string): Promise<string> => {
  const gamesQuery = query(
    collection(db, 'games'),
    where('settings.code', '==', code.toUpperCase()),
    where('status', '==', 'lobby'),
    limit(1)
  );

  const snapshot = await getDoc(doc(db, 'games', 'placeholder')); // TODO: Fix query
  // For now, we'll need to implement proper query logic
  throw new Error('Game not found with that code');
};

export const subscribeToGame = (gameId: string, callback: (game: Game | null) => void) => {
  return onSnapshot(doc(db, 'games', gameId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Game);
    } else {
      callback(null);
    }
  });
};

export const updateGame = async (gameId: string, data: Partial<Game>) => {
  await updateDoc(doc(db, 'games', gameId), data);
};

export const submitMeme = async (gameId: string, playerId: string, memeUrl: string) => {
  await updateDoc(doc(db, 'games', gameId), {
    [`submissions.${playerId}`]: {
      memeUrl,
      submittedAt: serverTimestamp(),
    },
  });
};

// Chat functions
export const sendMessage = async (gameId: string, senderId: string, senderName: string, message: string) => {
  await addDoc(collection(db, 'games', gameId, 'chat'), {
    senderId,
    senderName,
    message,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToChat = (gameId: string, callback: (messages: ChatMessage[]) => void) => {
  const chatQuery = query(
    collection(db, 'games', gameId, 'chat'),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(chatQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(messages);
  });
};

// Champion Cards functions
export const createChampionCard = async (
  playerId: string,
  gameId: string,
  memeUrl: string,
  prompt: string
): Promise<string> => {
  const cardRef = await addDoc(collection(db, 'championCards'), {
    playerId,
    gameId,
    memeUrl,
    prompt,
    wonAt: serverTimestamp(),
    likes: 0,
  });
  return cardRef.id;
};

export const getUserChampionCards = async (userId: string): Promise<ChampionCard[]> => {
  const cardsQuery = query(
    collection(db, 'championCards'),
    where('playerId', '==', userId),
    orderBy('wonAt', 'desc')
  );

  // TODO: Implement proper query
  return [];
};

export const subscribeToUserChampionCards = (userId: string, callback: (cards: ChampionCard[]) => void) => {
  const cardsQuery = query(
    collection(db, 'championCards'),
    where('playerId', '==', userId),
    orderBy('wonAt', 'desc')
  );

  return onSnapshot(cardsQuery, (snapshot) => {
    const cards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ChampionCard[];
    callback(cards);
  });
};

// Storage functions
export const uploadMeme = async (userId: string, imageBlob: Blob): Promise<string> => {
  const fileName = `memes/${userId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, imageBlob);
  return getDownloadURL(storageRef);
};

export const uploadProfilePhoto = async (userId: string, imageBlob: Blob): Promise<string> => {
  const fileName = `profiles/${userId}.jpg`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, imageBlob);
  return getDownloadURL(storageRef);
};

// Prompts functions
export const getRandomPrompts = async (count: number = 10): Promise<Prompt[]> => {
  // For now, return hardcoded prompts - later fetch from Firestore
  const defaultPrompts: Prompt[] = [
    { id: '1', text: "When your code works on the first try", category: 'tech', createdBy: 'system' },
    { id: '2', text: "Me explaining to my mom what I do for work", category: 'family', createdBy: 'system' },
    { id: '3', text: "The group chat at 3am", category: 'friends', createdBy: 'system' },
    { id: '4', text: "When you finally find the bug after 5 hours", category: 'tech', createdBy: 'system' },
    { id: '5', text: "My last two brain cells during an exam", category: 'school', createdBy: 'system' },
    { id: '6', text: "How I think I look vs how I actually look", category: 'selfie', createdBy: 'system' },
    { id: '7', text: "When the wifi goes out for 5 seconds", category: 'life', createdBy: 'system' },
    { id: '8', text: "Me pretending to work while my boss walks by", category: 'work', createdBy: 'system' },
    { id: '9', text: "That one friend who always says 'I'm on my way'", category: 'friends', createdBy: 'system' },
    { id: '10', text: "When you open your phone and forget why", category: 'life', createdBy: 'system' },
  ];

  return defaultPrompts.slice(0, count);
};

export { app, auth, db, storage, Timestamp, serverTimestamp };
