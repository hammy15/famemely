import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';
import type { Game, PlayerInfo, Prompt, Submission } from '@/types';
import { shuffleArray } from '@/lib/utils';
import {
  DEMO_MODE,
  mockDelay,
  createMockGame,
  MOCK_PLAYERS,
  MOCK_PROMPTS,
  MOCK_MEME_URLS,
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

  // Subscriptions
  unsubscribeGame: (() => void) | null;

  // Actions
  createNewGame: (hostId: string) => Promise<string>;
  joinGameById: (gameId: string, playerId: string) => Promise<void>;
  leaveGame: () => void;
  subscribeToCurrentGame: (gameId: string) => void;
  startGame: () => Promise<void>;
  submitPlayerMeme: (playerId: string, memeUrl: string) => Promise<void>;
  selectWinner: (winnerId: string) => Promise<void>;
  nextRound: () => Promise<void>;
  endGame: () => Promise<void>;
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  players: [],
  prompts: [],
  isLoading: false,
  error: null,
  timeRemaining: 0,
  timerInterval: null,
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
        const playerInfoPromises = game.players.map(async (playerId: string, index: number) => {
          const profile = await firebaseFunctions.getUserProfile(playerId);
          return {
            id: playerId,
            displayName: profile?.displayName || 'Unknown',
            photoURL: profile?.photoURL || null,
            score: game.scores[playerId] || 0,
            isJudge: index === game.currentJudgeIndex,
            hasSubmitted: !!game.submissions[playerId],
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
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(500);
      const shuffledPrompts = shuffleArray([...MOCK_PROMPTS]);

      set({
        currentGame: {
          ...currentGame,
          status: 'playing',
          currentRound: 1,
          currentPrompt: shuffledPrompts[0].text,
          submissions: {},
        },
        prompts: shuffledPrompts,
        isLoading: false,
      });

      get().startTimer(currentGame.settings.timePerRound);
      return;
    }

    try {
      // Get prompts for the game
      const prompts: Prompt[] = await firebaseFunctions.getRandomPrompts(currentGame.totalRounds);
      const shuffledPrompts: Prompt[] = shuffleArray(prompts);

      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'playing',
        currentRound: 1,
        currentPrompt: shuffledPrompts[0].text,
        submissions: {},
      });

      set({ prompts: shuffledPrompts, isLoading: false });

      // Start timer
      get().startTimer(currentGame.settings.timePerRound);
    } catch (error: any) {
      set({
        error: error.message || 'Failed to start game',
        isLoading: false,
      });
      throw error;
    }
  },

  submitPlayerMeme: async (playerId, memeUrl) => {
    const { currentGame, players } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);

      // Add the player's submission
      const newSubmissions: Record<string, Submission> = {
        ...currentGame.submissions,
        [playerId]: { memeUrl, submittedAt: Timestamp.now() },
      };

      // Simulate other players submitting
      const nonJudgePlayers = players.filter((_, index) => index !== currentGame.currentJudgeIndex);
      nonJudgePlayers.forEach((player, i) => {
        if (player.id !== playerId && !newSubmissions[player.id]) {
          newSubmissions[player.id] = {
            memeUrl: MOCK_MEME_URLS[i % MOCK_MEME_URLS.length],
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

      // Check if all non-judge players have submitted
      const nonJudgePlayers = currentGame.players.filter(
        (_, index) => index !== currentGame.currentJudgeIndex
      );
      const submissionCount = Object.keys(currentGame.submissions).length + 1;

      if (submissionCount >= nonJudgePlayers.length) {
        // All submitted, move to judging phase
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
    const { currentGame, prompts } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);

      // Update scores
      const newScores = { ...currentGame.scores };
      newScores[winnerId] = (newScores[winnerId] || 0) + 1;

      set({
        currentGame: {
          ...currentGame,
          status: 'results',
          roundWinner: winnerId,
          scores: newScores,
        },
        isLoading: false,
      });
      return;
    }

    try {
      // Update scores
      const newScores = { ...currentGame.scores };
      newScores[winnerId] = (newScores[winnerId] || 0) + 1;

      // Create champion card for winner
      const winningSubmission = currentGame.submissions[winnerId];
      if (winningSubmission) {
        await firebaseFunctions.createChampionCard(
          winnerId,
          currentGame.id,
          winningSubmission.memeUrl,
          currentGame.currentPrompt
        );
      }

      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'results',
        roundWinner: winnerId,
        scores: newScores,
      });

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to select winner',
        isLoading: false,
      });
      throw error;
    }
  },

  nextRound: async () => {
    const { currentGame, prompts, players } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(300);

      const nextRound = currentGame.currentRound + 1;

      if (nextRound > currentGame.totalRounds) {
        await get().endGame();
        return;
      }

      const nextJudgeIndex = (currentGame.currentJudgeIndex + 1) % players.length;

      set({
        currentGame: {
          ...currentGame,
          status: 'playing',
          currentRound: nextRound,
          currentJudgeIndex: nextJudgeIndex,
          currentPrompt: prompts[nextRound - 1]?.text || MOCK_PROMPTS[nextRound - 1]?.text || 'Make a funny meme!',
          submissions: {},
          roundWinner: undefined,
        },
        isLoading: false,
      });

      get().startTimer(currentGame.settings.timePerRound);
      return;
    }

    try {
      const nextRound = currentGame.currentRound + 1;

      if (nextRound > currentGame.totalRounds) {
        // Game over
        await get().endGame();
        return;
      }

      // Rotate judge
      const nextJudgeIndex =
        (currentGame.currentJudgeIndex + 1) % currentGame.players.length;

      await firebaseFunctions.updateGame(currentGame.id, {
        status: 'playing',
        currentRound: nextRound,
        currentJudgeIndex: nextJudgeIndex,
        currentPrompt: prompts[nextRound - 1]?.text || 'Make a funny meme!',
        submissions: {},
        roundWinner: undefined,
      });

      set({ isLoading: false });

      // Start timer for new round
      get().startTimer(currentGame.settings.timePerRound);
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

        // Auto-transition to judging if time runs out
        if (currentGame?.status === 'playing') {
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
}));
