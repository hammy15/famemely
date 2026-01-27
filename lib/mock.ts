// Mock data and functions for demo mode
import { Timestamp } from 'firebase/firestore';
import type { User, Game, ChampionCard, ChatMessage, Prompt, PlayerInfo, GamePhoto, Caption } from '@/types';

// Demo mode flag
export const DEMO_MODE = true;

// Mock user
export const MOCK_USER: User = {
  id: 'demo-user-1',
  displayName: 'MemeLord420',
  email: 'demo@famemely.app',
  photoURL: null,
  createdAt: Timestamp.now(),
  stats: {
    gamesPlayed: 12,
    gamesWon: 5,
    roundsWon: 23,
  },
  premium: false,
};

// Mock players for games
export const MOCK_PLAYERS: PlayerInfo[] = [
  { id: 'demo-user-1', displayName: 'MemeLord420', photoURL: null, score: 0, isJudge: false, hasSubmitted: false, isReady: true, photosUploaded: 3 },
  { id: 'demo-user-2', displayName: 'DankMaster', photoURL: null, score: 0, isJudge: false, hasSubmitted: false, isReady: true, photosUploaded: 2 },
  { id: 'demo-user-3', displayName: 'MemeQueen', photoURL: null, score: 0, isJudge: true, hasSubmitted: false, isReady: true, photosUploaded: 4 },
  { id: 'demo-user-4', displayName: 'LolzGuy', photoURL: null, score: 0, isJudge: false, hasSubmitted: false, isReady: true, photosUploaded: 2 },
];

// 50 Default photos for the game pool
export const DEFAULT_PHOTOS: GamePhoto[] = Array.from({ length: 50 }, (_, i) => ({
  id: `default-${i + 1}`,
  uploaderId: 'system',
  photoUrl: `https://picsum.photos/seed/default${i + 1}/800/800`,
  isDefault: true,
  uploadedAt: Timestamp.now(),
}));

// Funny photo categories for better variety
export const DEFAULT_PHOTO_CATEGORIES = [
  'cats', 'dogs', 'surprised', 'confused', 'happy', 'angry',
  'weird', 'stock', 'reaction', 'vintage', 'nature', 'food'
];

// Mock prompts
export const MOCK_PROMPTS: Prompt[] = [
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

// Mock captions for champion cards
export const MOCK_CAPTIONS: Caption[] = [
  { id: 'cap-1', text: 'Me at 3am', x: 50, y: 15, fontSize: 32, fontFamily: 'Impact', color: '#FFFFFF', rotation: 0, scale: 1, style: 'outline' },
  { id: 'cap-2', text: 'Still debugging', x: 50, y: 85, fontSize: 28, fontFamily: 'Impact', color: '#FFFFFF', rotation: 0, scale: 1, style: 'outline' },
];

// Mock champion cards
export const MOCK_CHAMPION_CARDS: ChampionCard[] = [
  {
    id: 'card-1',
    playerId: 'demo-user-1',
    gameId: 'game-1',
    memeUrl: 'https://picsum.photos/seed/meme1/400/400',
    originalPhotoUrl: 'https://picsum.photos/seed/original1/400/400',
    captions: [MOCK_CAPTIONS[0]],
    wonAt: Timestamp.now(),
    likes: 42,
    winType: 'judge',
  },
  {
    id: 'card-2',
    playerId: 'demo-user-1',
    gameId: 'game-2',
    memeUrl: 'https://picsum.photos/seed/meme2/400/400',
    originalPhotoUrl: 'https://picsum.photos/seed/original2/400/400',
    captions: MOCK_CAPTIONS,
    wonAt: Timestamp.now(),
    likes: 28,
    winType: 'audience',
  },
  {
    id: 'card-3',
    playerId: 'demo-user-1',
    gameId: 'game-3',
    memeUrl: 'https://picsum.photos/seed/meme3/400/400',
    originalPhotoUrl: 'https://picsum.photos/seed/original3/400/400',
    captions: [MOCK_CAPTIONS[1]],
    wonAt: Timestamp.now(),
    likes: 15,
    winType: 'both',
  },
];

// Mock chat messages
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: '1', senderId: 'demo-user-2', senderName: 'DankMaster', message: 'This is gonna be good 😂', timestamp: Timestamp.now() },
  { id: '2', senderId: 'demo-user-3', senderName: 'MemeQueen', message: 'Ready to judge!', timestamp: Timestamp.now() },
  { id: '3', senderId: 'demo-user-4', senderName: 'LolzGuy', message: 'glhf everyone', timestamp: Timestamp.now() },
];

// Generate game code
export const generateGameCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// Generate a mock game v2 (caption battle)
export const createMockGame = (hostId: string): Game => {
  const code = generateGameCode();
  return {
    id: `game-${Date.now()}`,
    hostId,
    status: 'lobby',
    players: [hostId],
    maxPlayers: 8,
    currentRound: 0,
    totalRounds: 10,              // Max rounds (can end early if cardsToWin reached)
    currentJudgeId: hostId,       // Host starts as first judge

    // Photo pool (empty until photo_upload phase)
    photos: {},
    currentPhotoId: undefined,

    // Submissions & Voting
    submissions: {},
    votes: [],
    judgeWinnerId: undefined,
    audienceWinnerId: undefined,

    // Scores
    scores: { [hostId]: 0 },

    // Time extensions
    timeExtensions: [],

    createdAt: Timestamp.now(),
    settings: {
      timePerRound: 90,           // 1:30 default for captioning
      cardsToWin: 5,              // First to 5 cards wins
      useDefaultPhotos: true,     // Include 50 default photos
      isPrivate: true,
      code,
    },
  };
};

// Legacy createMockGame for backwards compatibility
export const createMockGameLegacy = createMockGame;

// Mock meme URLs for submissions
export const MOCK_MEME_URLS = [
  'https://picsum.photos/seed/submit1/400/400',
  'https://picsum.photos/seed/submit2/400/400',
  'https://picsum.photos/seed/submit3/400/400',
  'https://picsum.photos/seed/submit4/400/400',
];

// Simulate network delay
export const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));
