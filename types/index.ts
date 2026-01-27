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

// Game Types - v2 Caption Battle
export type GameStatus =
  | 'lobby'           // Players joining, setting rules
  | 'photo_upload'    // Everyone uploads photos
  | 'picking'         // Judge picks a photo
  | 'captioning'      // Players create captions
  | 'judging'         // Judge reviews submissions
  | 'voting'          // Audience votes (People's Choice)
  | 'results'         // Show winners
  | 'finished';       // Game over

export interface GameSettings {
  timePerRound: number;      // Default 90 seconds for captioning
  cardsToWin: number;        // First to X cards wins (default 5)
  useDefaultPhotos: boolean; // Include 50 default photos
  isPrivate: boolean;
  code: string;
}

// Photo in the game pool
export interface GamePhoto {
  id: string;
  uploaderId: string;        // Player ID or 'system' for defaults
  photoUrl: string;
  isDefault: boolean;
  uploadedAt: Timestamp;
}

// Caption overlay for photos
export interface Caption {
  id: string;
  text: string;
  x: number;                 // % position (0-100)
  y: number;                 // % position (0-100)
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  scale: number;
  style: 'normal' | 'outline' | 'shadow';
}

// Player's submission (photo + captions)
export interface Submission {
  playerId: string;
  photoId: string;
  captions: Caption[];
  finalImageUrl?: string;    // Rendered image with captions baked in
  submittedAt: Timestamp;
}

// Vote record
export interface Vote {
  id: string;
  voterId: string;
  submissionPlayerId: string;
  type: 'judge' | 'audience';
  votedAt: Timestamp;
}

// Time extension granted by judge
export interface TimeExtension {
  seconds: 15 | 30 | 60;
  grantedAt: Timestamp;
}

export interface Game {
  id: string;
  hostId: string;
  status: GameStatus;
  players: string[];
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;       // Max rounds (or unlimited if using cardsToWin)
  currentJudgeId: string;    // Changed from index to ID for clarity

  // Photo pool
  photos: Record<string, GamePhoto>;
  currentPhotoId?: string;   // Photo being captioned this round

  // Submissions & Voting
  submissions: Record<string, Submission>;
  votes: Vote[];
  judgeWinnerId?: string;    // Judge's pick
  audienceWinnerId?: string; // People's Choice winner

  // Scores (cards won)
  scores: Record<string, number>;

  // Time extensions
  timeExtensions: TimeExtension[];

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
  memeUrl: string;           // Final captioned image
  originalPhotoUrl: string;  // Original photo before captions
  captions: Caption[];       // Captions used
  wonAt: Timestamp;
  likes: number;
  winType: 'judge' | 'audience' | 'both';  // How they won
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
  isReady: boolean;          // Ready status in lobby
  photosUploaded: number;    // Count of photos uploaded
}

// Navigation Types
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  '(tabs)': undefined;
  'game/[id]': { id: string };
  'game/lobby/[id]': { id: string };
};
