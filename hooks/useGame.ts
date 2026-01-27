import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';

export function useGame(gameId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const {
    currentGame,
    players,
    timeRemaining,
    isLoading,
    error,
    subscribeToCurrentGame,
    leaveGame,
    submitPlayerMeme,
    selectWinner,
    nextRound,
  } = useGameStore();

  useEffect(() => {
    if (gameId) {
      subscribeToCurrentGame(gameId);
    }
    return () => leaveGame();
  }, [gameId]);

  const isHost = currentGame?.hostId === user?.id;
  const isJudge = currentGame?.currentJudgeId === user?.id;
  const hasSubmitted = currentGame?.submissions?.[user?.id || ''];

  const submitMeme = useCallback(
    async (memeUrl: string) => {
      if (!user) return;
      await submitPlayerMeme(user.id, memeUrl);
    },
    [user, submitPlayerMeme]
  );

  const pickWinner = useCallback(
    async (winnerId: string) => {
      await selectWinner(winnerId);
    },
    [selectWinner]
  );

  const advanceRound = useCallback(async () => {
    await nextRound();
  }, [nextRound]);

  return {
    game: currentGame,
    players,
    timeRemaining,
    isLoading,
    error,
    isHost,
    isJudge,
    hasSubmitted,
    submitMeme,
    pickWinner,
    advanceRound,
    leaveGame,
  };
}
