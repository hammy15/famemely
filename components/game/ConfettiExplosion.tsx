import { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, gameConstants } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ConfettiIntensity = 'burst' | 'rain' | 'explosion';

interface ConfettiExplosionProps {
  active: boolean;
  intensity?: ConfettiIntensity;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotation: number;
  size: number;
  type: 'square' | 'rectangle' | 'circle';
}

const confettiColors = [
  colors.primary,
  colors.secondary,
  colors.accent.gold,
  colors.accent.lime,
  colors.accent.purple,
  colors.accent.orange,
  '#FF69B4',
  '#00D4FF',
];

const intensityConfig: Record<ConfettiIntensity, { count: number; duration: number; spread: number }> = {
  burst: { count: 50, duration: 2000, spread: 0.8 },
  rain: { count: 100, duration: 4000, spread: 1 },
  explosion: { count: gameConstants.confettiCount, duration: 3000, spread: 1.2 },
};

function ConfettiPieceComponent({ piece, intensity }: { piece: ConfettiPiece; intensity: ConfettiIntensity }) {
  const config = intensityConfig[intensity];
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(piece.rotation);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const targetY = SCREEN_HEIGHT + 100;
    const horizontalDrift = (Math.random() - 0.5) * SCREEN_WIDTH * config.spread;

    translateY.value = withDelay(
      piece.delay,
      withTiming(targetY, {
        duration: config.duration + Math.random() * 1000,
        easing: Easing.out(Easing.quad),
      })
    );

    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(horizontalDrift * 0.5, { duration: config.duration * 0.3 }),
        withTiming(horizontalDrift, { duration: config.duration * 0.7 })
      )
    );

    rotation.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + 360 * (2 + Math.random() * 2), {
        duration: config.duration,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      piece.delay + config.duration * 0.7,
      withTiming(0, { duration: config.duration * 0.3 })
    );

    scale.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(0.8, { duration: config.duration - 200 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const shapeStyle = {
    square: {
      width: piece.size,
      height: piece.size,
      borderRadius: 2,
    },
    rectangle: {
      width: piece.size * 0.5,
      height: piece.size * 1.5,
      borderRadius: 2,
    },
    circle: {
      width: piece.size,
      height: piece.size,
      borderRadius: piece.size / 2,
    },
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: piece.x,
          top: -50,
          backgroundColor: piece.color,
          ...shapeStyle[piece.type],
        },
      ]}
    />
  );
}

export default function ConfettiExplosion({
  active,
  intensity = 'explosion',
  onComplete,
}: ConfettiExplosionProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const config = intensityConfig[intensity];
      const newPieces: ConfettiPiece[] = [];

      for (let i = 0; i < config.count; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * SCREEN_WIDTH,
          delay: Math.random() * 500,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          rotation: Math.random() * 360,
          size: 6 + Math.random() * 8,
          type: ['square', 'rectangle', 'circle'][Math.floor(Math.random() * 3)] as any,
        });
      }

      setPieces(newPieces);

      // Cleanup and callback
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, config.duration + 1000);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [active, intensity]);

  if (!active || pieces.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} intensity={intensity} />
      ))}
    </View>
  );
}
