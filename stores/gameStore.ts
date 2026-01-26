import { create } from 'zustand';
import type { Game, PlayerInfo, Prompt } from '@/types';
import {
  createGame,
  joinGame,
  subscribeToGame,
  updateGame,
  submitMeme,
  createChampionCard,
  getRandomPrompts,
  getUserProfile,
} from '@/lib/firebase';
import { shuffleArray } from '@/lib/utils';

interface GameState {
  // State
  currentGame: Game | null;
  players: PlayerInfo[];
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;
  timeRemaining: number;
  timerInterval: NodeJS.Timeout | null;

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
    try {
      const gameId = await createGame(hostId);
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
    try {
      await joinGame(gameId, playerId);
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
    const { unsubscribeGame } = get();
    if (unsubscribeGame) {
      unsubscribeGame();
    }

    const unsubscribe = subscribeToGame(gameId, async (game) => {
      if (game) {
        // Fetch player info for all players
        const playerInfoPromises = game.players.map(async (playerId, index) => {
          const profile = await getUserProfile(playerId);
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
    try {
      // Get prompts for the game
      const prompts = await getRandomPrompts(currentGame.totalRounds);
      const shuffledPrompts = shuffleArray(prompts);

      await updateGame(currentGame.id, {
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
    const { currentGame } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });
    try {
      await submitMeme(currentGame.id, playerId, memeUrl);
      set({ isLoading: false });

      // Check if all non-judge players have submitted
      const nonJudgePlayers = currentGame.players.filter(
        (_, index) => index !== currentGame.currentJudgeIndex
      );
      const submissionCount = Object.keys(currentGame.submissions).length + 1;

      if (submissionCount >= nonJudgePlayers.length) {
        // All submitted, move to judging phase
        await updateGame(currentGame.id, { status: 'judging' });
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
    try {
      // Update scores
      const newScores = { ...currentGame.scores };
      newScores[winnerId] = (newScores[winnerId] || 0) + 1;

      // Create champion card for winner
      const winningSubmission = currentGame.submissions[winnerId];
      if (winningSubmission) {
        await createChampionCard(
          winnerId,
          currentGame.id,
          winningSubmission.memeUrl,
          currentGame.currentPrompt
        );
      }

      await updateGame(currentGame.id, {
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
    const { currentGame, prompts } = get();
    if (!currentGame) return;

    set({ isLoading: true, error: null });
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

      await updateGame(currentGame.id, {
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
    try {
      await updateGame(currentGame.id, {
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
          updateGame(currentGame.id, { status: 'judging' });
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
