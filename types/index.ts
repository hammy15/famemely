import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: Timestamp;
  stats: UserStats;
  premium: boolean;
  stripeCustomerId?: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  roundsWon: number;
}

// Game Types
export type GameStatus = 'lobby' | 'playing' | 'judging' | 'results' | 'finished';

export interface GameSettings {
  timePerRound: number;
  isPrivate: boolean;
  code?: string;
}

export interface Submission {
  memeUrl: string;
  submittedAt: Timestamp;
}

export interface Game {
  id: string;
  hostId: string;
  status: GameStatus;
  players: string[];
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  currentJudgeIndex: number;
  currentPrompt: string;
  submissions: Record<string, Submission>;
  roundWinner?: string;
  scores: Record<string, number>;
  createdAt: Timestamp;
  settings: GameSettings;
}

// Prompt Types
export interface Prompt {
  id: string;
  text: string;
  category: string;
  createdBy: string;
}

// Champion Card Types
export interface ChampionCard {
  id: string;
  playerId: string;
  gameId: string;
  memeUrl: string;
  prompt: string;
  wonAt: Timestamp;
  likes: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Timestamp;
}

// Editor Types
export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  rotation: number;
  scale: number;
}

export interface Sticker {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

export interface MemeFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface MemeTemplate {
  id: string;
  name: string;
  imageUrl: string;
  textPositions: Array<{ x: number; y: number; maxWidth: number }>;
}

export interface MemeProject {
  id: string;
  imageUri: string | null;
  textOverlays: TextOverlay[];
  stickers: Sticker[];
  filters: MemeFilters;
  template: MemeTemplate | null;
}

// Player Info for Game Display
export interface PlayerInfo {
  id: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  isJudge: boolean;
  hasSubmitted: boolean;
}

// Navigation Types
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  '(tabs)': undefined;
  'game/[id]': { id: string };
  'game/lobby/[id]': { id: string };
};
