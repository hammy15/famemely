import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';
import type { Game, PlayerInfo, Prompt, Submission, GamePhoto, Caption, Vote } from '@/types';
import { shuffleArray } from '@/lib/utils';
import {
  DEMO_MODE,
  mockDelay,
  createMockGame,
  MOCK_PLAYERS,
  MOCK_PROMPTS,
  MOCK_MEME_URLS,
  DEFAULT_PHOTOS,
} from '@/lib/mock';

// Only import Firebase if not in demo mode
let firebaseFunctions: any = null;
if (!DEMO_MODE) {
  firebaseFunctions = require('@/lib/firebase');
}

interface GameState {
  // State
  currentGame: Game | null;
  players: PlayerInfo[];
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;
  timeRemaining: number;
  timerInterval: ReturnType<typeof setInterval> | null;

  // Vote tracking
  voteCounts: Record<string, number>;

  // Subscriptions
  unsubscribeGame: (() => void) | null;

  // Core Actions
  createNewGame: (hostId: string) => Promise<string>;
  joinGameById: (gameId: string, playerId: string) => Promise<void>;
  leaveGame: () => void;
  subscribeToCurrentGame: (gameId: string) => void;
  endGame: () => Promise<void>;
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  clearError: () => void;

  // Settings & Lobby
  updateGameSettings: (settings: Partial<Game['settings']>) => Promise<void>;
  setPlayerReady: (playerId: string, isReady: boolean) => Promise<void>;

  // Photo Upload Phase
  startPhotoUpload: () => Promise<void>;
  uploadPhoto: (playerId: string, photoUri: string) => Promise<string>;
  addDefaultPhotos: () => Promise<void>;
  finishPhotoUpload: () => Promise<void>;

  // Picking Phase
  startPickingPhase: () => Promise<void>;
  pickPhoto: (photoId: string) => Promise<void>;

  // Captioning Phase
  startCaptioningPhase: () => Promise<void>;
  submitCaption: (playerId: string, captions: Caption[], finalImageUrl?: string) => Promise<void>;
  grantTimeExtension: (seconds: 15 | 30 | 60) => Promise<void>;

  // Judging Phase
  startJudgingPhase: () => Promise<void>;
  submitJudgeVote: (winnerPlayerId: string) => Promise<void>;

  // Voting Phase
  startVotingPhase: () => Promise<void>;
  submitAudienceVote: (voterId: string, submissionPlayerId: string) => Promise<void>;

  // Results Phase
  calculateResults: () => Promise<void>;
  nextRound: () => Promise<void>;

  // Legacy (for backwards compatibility)
  startGame: () => Promise<void>;
  submitPlayerMeme: (playerId: string, memeUrl: string) => Promise<void>;
  selectWinner: (winnerId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  players: [],
  prompts: [],
  isLoading: false,
  error: null,
  timeRemaining: 0,
  timerInterval: null,
  voteCounts: {},
  unsubscribeGame: null,

  createNewGame: async (hostId) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(500);
      const game = createMockGame(hostId);
      set({
        currentGame: game,
        players: MOCK_PLAYERS.slice(0, 1).map(p => ({ ...p, id: hostId })),
        isLoading: false
      });
      return game.id;
    }

    try {
      const gameId = await firebaseFunctions.createGame(hostId);
      set({ isLoading: false });
      return gameId;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create game',
        isLoading: false,
      });
      throw error;
    }
  },

  joinGameById: async (gameId, playerId) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(500);
      const game = createMockGame(playerId);
      game.id = gameId;
      game.players = [playerId, ...MOCK_PLAYERS.slice(1, 3).map(p => p.id)];
      set({
        currentGame: game,
        players: [
          { ...MOCK_PLAYERS[0], id: playerId },
          ...MOCK_PLAYERS.slice(1, 3)
        ],
        isLoading: false
      });
      return;
    }

    try {
      await firebaseFunctions.joinGame(gameId, playerId);
      get().subscribeToCurrentGame(gameId);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to join game',
        isLoading: false,
      });
      throw error;
    }
  },

  leaveGame: () => {
    const { unsubscribeGame, timerInterval } = get();
    if (unsubscribeGame) {
      unsubscribeGame();
    }
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({
      currentGame: null,
      players: [],
      unsubscribeGame: null,
      timerInterval: null,
      timeRemaining: 0,
    });
  },

  subscribeToCurrentGame: (gameId) => {
    const { unsubscribeGame, currentGame } = get();
    if (unsubscribeGame) {
      unsubscribeGame();
    }

    if (DEMO_MODE) {
      // In demo mode, we already set the game state directly
      // Just simulate other players joining
      setTimeout(() => {
        const { currentGame } = get();
        if (currentGame && currentGame.players.length < 3) {
          // Add mock players to the lobby
          set({
            players: MOCK_PLAYERS.slice(0, 4),
            currentGame: {
              ...currentGame,
              players: MOCK_PLAYERS.slice(0, 4).map(p => p.id),
            }
          });
        }
      }, 2000);
      set({ unsubscribeGame: () => {} });
      return;
    }

    const unsubscribe = firebaseFunctions.subscribeToGame(gameId, async (game: Game | null) => {
      if (game) {
        // Fetch player info for all players
        const playerInfoPromises = game.players.map(async (playerId: string) => {
          const profile = await firebaseFunctions.getUserProfile(playerId);
          return {
            id: playerId,
            displayName: profile?.displayName || 'Unknown',
            photoURL: profile?.photoURL || null,
            score: game.scores[playerId] || 0,
            isJudge: playerId === game.currentJudgeId,
            hasSubmitted: !!game.submissions[playerId],
            isReady: true,
            photosUploaded: Object.values(game.photos).filter(p => p.uploaderId === playerId).length,
          };
        });

        const players = await Promise.all(playerInfoPromises);

        set({ currentGame: game, players });
      } else {
        set({ currentGame: null, players: [] });
      }
    });

    set({ unsubscribeGame: unsubscribe });
  },

  startGame: async () => {
    // v2: Start game now goes to photo_upload phase
    const { currentGame } = get();
    if (!currentGame) return;

    // Start the photo upload phase (new v2 flow)
    await get().startPhotoUpload();
  },

  submitPlayerMeme: async (playerId, memeUrl) => {
    // Legacy function - redirect to new submitCaption with empty captions
    // This is for backwards compatibility
    const { currentGame } = get();
    if (!currentGame || !currentGame.currentPhotoId) return;

    const submission: Submission = {
      playerId,
      photoId: currentGame.currentPhotoId,
      captions: [],
      finalImageUrl: memeUrl,
      submittedAt: Timestamp.now(),
    };

    const { players } = get();

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);

      const newSubmissions: Record<string, Submission> = {
        ...currentGame.submissions,
        [playerId]: submission,
      };

      // Simulate other players submitting
      const nonJudgePlayers = players.filter((p) => p.id !== currentGame.currentJudgeId);
      nonJudgePlayers.forEach((player, i) => {
        if (player.id !== playerId && !newSubmissions[player.id]) {
          newSubmissions[player.id] = {
            playerId: player.id,
            photoId: currentGame.currentPhotoId!,
            captions: [],
            finalImageUrl: MOCK_MEME_URLS[i % MOCK_MEME_URLS.length],
            submittedAt: Timestamp.now(),
          };
        }
      });

      const allSubmitted = Object.keys(newSubmissions).length >= nonJudgePlayers.length;

      set({
        currentGame: {
          ...currentGame,
          submissions: newSubmissions,
          status: allSubmitted ? 'judging' : currentGame.status,
        },
        isLoading: false,
      });

      if (allSubmitted) {
        get().stopTimer();
      }
      return;
    }

    try {
      await firebaseFunctions.submitMeme(currentGame.id, playerId, memeUrl);
      set({ isLoading: false });

      const nonJudgePlayers = currentGame.players.filter((id) => id !== currentGame.currentJudgeId);
      const submissionCount = Object.keys(currentGame.submissions).length + 1;

      if (submissionCount >= nonJudgePlayers.length) {
        await firebaseFunctions.updateGame(currentGame.id, { status: 'judging' });
        get().stopTimer();
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to submit meme',
        isLoading: false,
      });
      throw error;
    }
  },

  selectWinner: async (winnerId) => {
    // Legacy function - redirect to new judge vote flow
    await get().submitJudgeVote(winnerId);
  },

  nextRound: async () => {
    const { currentGame, players } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    // Check if someone won (reached cardsToWin)
    const winner = Object.entries(currentGame.scores).find(
      ([_, score]) => score >= currentGame.settings.cardsToWin
    );

    if (winner || currentGame.currentRound >= currentGame.totalRounds) {
      await get().endGame();
      return;
    }

    // Rotate judge to next player
    const currentJudgeIndex = players.findIndex((p) => p.id === currentGame.currentJudgeId);
    const nextJudgeIndex = (currentJudgeIndex + 1) % players.length;
    const nextJudgeId = players[nextJudgeIndex].id;

    if (DEMO_MODE) {
      await mockDelay(300);

      set({
        currentGame: {
          ...currentGame,
          status: 'picking',
          currentRound: currentGame.currentRound + 1,
          currentJudgeId: nextJudgeId,
          currentPhotoId: undefined,
          submissions: {},
          votes: [],
          judgeWinnerId: undefined,
          audienceWinnerId: undefined,
          timeExtensions: [],
        },
        players: players.map((p) => ({
          ...p,
          isJudge: p.id === nextJudgeId,
          hasSubmitted: false,
        })),
        voteCounts: {},
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'picking',
        currentRound: currentGame.currentRound + 1,
        currentJudgeId: nextJudgeId,
        currentPhotoId: undefined,
        submissions: {},
        votes: [],
        judgeWinnerId: undefined,
        audienceWinnerId: undefined,
        timeExtensions: [],
      });

      set({ voteCounts: {}, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to start next round',
        isLoading: false,
      });
      throw error;
    }
  },

  endGame: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);
      set({
        currentGame: {
          ...currentGame,
          status: 'finished',
        },
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'finished',
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to end game',
        isLoading: false,
      });
      throw error;
    }
  },

  startTimer: (seconds) => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    set({ timeRemaining: seconds });

    const interval = setInterval(() => {
      const { timeRemaining, currentGame } = get();
      if (timeRemaining <= 1) {
        clearInterval(interval);
        set({ timeRemaining: 0, timerInterval: null });

        // Auto-transition when time runs out
        if (currentGame?.status === 'captioning') {
          // Move to judging when captioning time expires
          if (DEMO_MODE) {
            set({
              currentGame: {
                ...currentGame,
                status: 'judging',
              },
            });
          } else {
            firebaseFunctions.updateGame(currentGame.id, { status: 'judging' });
          }
        } else if (currentGame?.status === 'voting') {
          // Calculate results when voting time expires
          get().calculateResults();
        }
      } else {
        set({ timeRemaining: timeRemaining - 1 });
      }
    }, 1000);

    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    set({ timerInterval: null, timeRemaining: 0 });
  },

  clearError: () => set({ error: null }),

  // ===== NEW V2 CAPTION BATTLE ACTIONS =====

  updateGameSettings: async (settings) => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(200);
      set({
        currentGame: {
          ...currentGame,
          settings: { ...currentGame.settings, ...settings },
        },
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        settings: { ...currentGame.settings, ...settings },
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update settings', isLoading: false });
    }
  },

  setPlayerReady: async (playerId, isReady) => {
    const { players } = get();
    set({
      players: players.map((p) =>
        p.id === playerId ? { ...p, isReady } : p
      ),
    });
  },

  // Photo Upload Phase
  startPhotoUpload: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);

      // Add default photos if enabled
      let photos: Record<string, GamePhoto> = {};
      if (currentGame.settings.useDefaultPhotos) {
        DEFAULT_PHOTOS.forEach((photo) => {
          photos[photo.id] = photo;
        });
      }

      set({
        currentGame: {
          ...currentGame,
          status: 'photo_upload',
          photos,
        },
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, { status: 'photo_upload' });
      if (currentGame.settings.useDefaultPhotos) {
        await get().addDefaultPhotos();
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start photo upload', isLoading: false });
    }
  },

  uploadPhoto: async (playerId, photoUri) => {
    const { currentGame, players } = get();
    if (!currentGame) return '';

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);
      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newPhoto: GamePhoto = {
        id: photoId,
        uploaderId: playerId,
        photoUrl: photoUri,
        isDefault: false,
        uploadedAt: Timestamp.now(),
      };

      set({
        currentGame: {
          ...currentGame,
          photos: { ...currentGame.photos, [photoId]: newPhoto },
        },
        players: players.map((p) =>
          p.id === playerId ? { ...p, photosUploaded: p.photosUploaded + 1 } : p
        ),
        isLoading: false,
      });
      return photoId;
    }

    try {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const photoUrl = await firebaseFunctions.uploadMeme(playerId, blob);

      const photoId = `photo-${Date.now()}`;
      const newPhoto: GamePhoto = {
        id: photoId,
        uploaderId: playerId,
        photoUrl,
        isDefault: false,
        uploadedAt: Timestamp.now(),
      };

      await firebaseFunctions.updateGame(currentGame.id, {
        photos: { ...currentGame.photos, [photoId]: newPhoto },
      });

      set({ isLoading: false });
      return photoId;
    } catch (error: any) {
      set({ error: error.message || 'Failed to upload photo', isLoading: false });
      return '';
    }
  },

  addDefaultPhotos: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    const defaultPhotosRecord: Record<string, GamePhoto> = {};
    DEFAULT_PHOTOS.forEach((photo) => {
      defaultPhotosRecord[photo.id] = photo;
    });

    if (DEMO_MODE) {
      set({
        currentGame: {
          ...currentGame,
          photos: { ...currentGame.photos, ...defaultPhotosRecord },
        },
      });
      return;
    }

    await firebaseFunctions.updateGame(currentGame.id, {
      photos: { ...currentGame.photos, ...defaultPhotosRecord },
    });
  },

  finishPhotoUpload: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    // Move to picking phase
    await get().startPickingPhase();
  },

  // Picking Phase
  startPickingPhase: async () => {
    const { currentGame, players } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    // Select random judge for first round, or rotate
    let judgeId = currentGame.currentJudgeId;
    if (currentGame.currentRound === 0) {
      const randomIndex = Math.floor(Math.random() * players.length);
      judgeId = players[randomIndex].id;
    }

    if (DEMO_MODE) {
      await mockDelay(300);
      set({
        currentGame: {
          ...currentGame,
          status: 'picking',
          currentRound: currentGame.currentRound + 1,
          currentJudgeId: judgeId,
          submissions: {},
          votes: [],
          judgeWinnerId: undefined,
          audienceWinnerId: undefined,
          timeExtensions: [],
        },
        players: players.map((p) => ({
          ...p,
          isJudge: p.id === judgeId,
          hasSubmitted: false,
        })),
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'picking',
        currentRound: currentGame.currentRound + 1,
        currentJudgeId: judgeId,
        submissions: {},
        votes: [],
        judgeWinnerId: undefined,
        audienceWinnerId: undefined,
        timeExtensions: [],
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start picking phase', isLoading: false });
    }
  },

  pickPhoto: async (photoId) => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(200);
      set({
        currentGame: {
          ...currentGame,
          currentPhotoId: photoId,
        },
        isLoading: false,
      });

      // Auto-transition to captioning
      await get().startCaptioningPhase();
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, { currentPhotoId: photoId });
      set({ isLoading: false });
      await get().startCaptioningPhase();
    } catch (error: any) {
      set({ error: error.message || 'Failed to pick photo', isLoading: false });
    }
  },

  // Captioning Phase
  startCaptioningPhase: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(200);
      set({
        currentGame: {
          ...currentGame,
          status: 'captioning',
        },
        isLoading: false,
      });

      // Start the timer
      get().startTimer(currentGame.settings.timePerRound);
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, { status: 'captioning' });
      set({ isLoading: false });
      get().startTimer(currentGame.settings.timePerRound);
    } catch (error: any) {
      set({ error: error.message || 'Failed to start captioning', isLoading: false });
    }
  },

  submitCaption: async (playerId, captions, finalImageUrl) => {
    const { currentGame, players } = get();
    if (!currentGame || !currentGame.currentPhotoId) return;

    set({ isLoading: true, error: null });

    const submission: Submission = {
      playerId,
      photoId: currentGame.currentPhotoId,
      captions,
      finalImageUrl,
      submittedAt: Timestamp.now(),
    };

    if (DEMO_MODE) {
      await mockDelay(300);

      const newSubmissions = {
        ...currentGame.submissions,
        [playerId]: submission,
      };

      // Check if all non-judge players submitted
      const nonJudgePlayers = players.filter((p) => p.id !== currentGame.currentJudgeId);
      const allSubmitted = nonJudgePlayers.every((p) => newSubmissions[p.id]);

      set({
        currentGame: {
          ...currentGame,
          submissions: newSubmissions,
        },
        players: players.map((p) =>
          p.id === playerId ? { ...p, hasSubmitted: true } : p
        ),
        isLoading: false,
      });

      if (allSubmitted) {
        get().stopTimer();
        await get().startJudgingPhase();
      }
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        submissions: { ...currentGame.submissions, [playerId]: submission },
      });
      set({ isLoading: false });

      // Check if all submitted
      const nonJudgePlayers = currentGame.players.filter((id) => id !== currentGame.currentJudgeId);
      const submissionCount = Object.keys(currentGame.submissions).length + 1;
      if (submissionCount >= nonJudgePlayers.length) {
        get().stopTimer();
        await get().startJudgingPhase();
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit caption', isLoading: false });
    }
  },

  grantTimeExtension: async (seconds) => {
    const { currentGame, timeRemaining } = get();
    if (!currentGame) return;

    const extension = { seconds, grantedAt: Timestamp.now() };

    if (DEMO_MODE) {
      set({
        currentGame: {
          ...currentGame,
          timeExtensions: [...currentGame.timeExtensions, extension],
        },
        timeRemaining: timeRemaining + seconds,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        timeExtensions: [...currentGame.timeExtensions, extension],
      });
      set({ timeRemaining: timeRemaining + seconds });
    } catch (error: any) {
      set({ error: error.message || 'Failed to grant extension', isLoading: false });
    }
  },

  // Judging Phase
  startJudgingPhase: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(200);
      set({
        currentGame: {
          ...currentGame,
          status: 'judging',
        },
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, { status: 'judging' });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start judging', isLoading: false });
    }
  },

  submitJudgeVote: async (winnerPlayerId) => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);
      set({
        currentGame: {
          ...currentGame,
          judgeWinnerId: winnerPlayerId,
        },
        isLoading: false,
      });

      // Move to audience voting
      await get().startVotingPhase();
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, { judgeWinnerId: winnerPlayerId });
      set({ isLoading: false });
      await get().startVotingPhase();
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit judge vote', isLoading: false });
    }
  },

  // Voting Phase (Audience)
  startVotingPhase: async () => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null, voteCounts: {} });

    if (DEMO_MODE) {
      await mockDelay(200);
      set({
        currentGame: {
          ...currentGame,
          status: 'voting',
          votes: [],
        },
        isLoading: false,
      });

      // 30 second timer for voting
      get().startTimer(30);
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, { status: 'voting', votes: [] });
      set({ isLoading: false });
      get().startTimer(30);
    } catch (error: any) {
      set({ error: error.message || 'Failed to start voting', isLoading: false });
    }
  },

  submitAudienceVote: async (voterId, submissionPlayerId) => {
    const { currentGame, voteCounts } = get();
    if (!currentGame) return;

    // Can't vote for yourself
    if (voterId === submissionPlayerId) return;

    // Check if already voted
    if (currentGame.votes.find((v) => v.voterId === voterId)) return;

    const vote: Vote = {
      id: `vote-${Date.now()}`,
      voterId,
      submissionPlayerId,
      type: 'audience',
      votedAt: Timestamp.now(),
    };

    const newVoteCounts = {
      ...voteCounts,
      [submissionPlayerId]: (voteCounts[submissionPlayerId] || 0) + 1,
    };

    if (DEMO_MODE) {
      set({
        currentGame: {
          ...currentGame,
          votes: [...currentGame.votes, vote],
        },
        voteCounts: newVoteCounts,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        votes: [...currentGame.votes, vote],
      });
      set({ voteCounts: newVoteCounts });
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit vote', isLoading: false });
    }
  },

  // Results Phase
  calculateResults: async () => {
    const { currentGame, players } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    // Count audience votes
    const audienceVoteCounts: Record<string, number> = {};
    currentGame.votes.forEach((vote) => {
      if (vote.type === 'audience') {
        audienceVoteCounts[vote.submissionPlayerId] =
          (audienceVoteCounts[vote.submissionPlayerId] || 0) + 1;
      }
    });

    // Find audience winner
    let audienceWinnerId: string | undefined;
    let maxVotes = 0;
    Object.entries(audienceVoteCounts).forEach(([playerId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        audienceWinnerId = playerId;
      }
    });

    // Update scores
    const newScores = { ...currentGame.scores };
    if (currentGame.judgeWinnerId) {
      newScores[currentGame.judgeWinnerId] = (newScores[currentGame.judgeWinnerId] || 0) + 1;
    }
    if (audienceWinnerId && audienceWinnerId !== currentGame.judgeWinnerId) {
      // Audience winner gets 0.5 points (or you could make it 1 for equal scoring)
      newScores[audienceWinnerId] = (newScores[audienceWinnerId] || 0) + 0.5;
    }

    if (DEMO_MODE) {
      await mockDelay(300);
      set({
        currentGame: {
          ...currentGame,
          status: 'results',
          audienceWinnerId,
          scores: newScores,
        },
        players: players.map((p) => ({
          ...p,
          score: newScores[p.id] || 0,
        })),
        isLoading: false,
      });
      return;
    }

    try {
      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'results',
        audienceWinnerId,
        scores: newScores,
      });

      // Create champion cards for winners
      if (currentGame.judgeWinnerId) {
        const submission = currentGame.submissions[currentGame.judgeWinnerId];
        if (submission) {
          await firebaseFunctions.createChampionCard(
            currentGame.judgeWinnerId,
            currentGame.id,
            submission.finalImageUrl || currentGame.photos[currentGame.currentPhotoId!]?.photoUrl,
            'Judge Pick'
          );
        }
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to calculate results', isLoading: false });
    }
  },
}));
