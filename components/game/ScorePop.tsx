import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, animation } from '@/constants/theme';

interface ScorePopProps {
  visible: boolean;
  text?: string;
  color?: string;
  onComplete?: () => void;
}

export default function ScorePop({
  visible,
  text = '+1 CARD!',
  color = colors.accent.gold,
  onComplete,
}: ScorePopProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      // Reset
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0.5;

      // Animate in
      scale.value = withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 100 })
      );
      opacity.value = withTiming(1, { duration: 150 });

      // Float up and fade out
      translateY.value = withDelay(
        500,
        withTiming(-100, { duration: 800, easing: Easing.out(Easing.ease) })
      );
      opacity.value = withDelay(
        800,
        withTiming(0, { duration: 500 })
      );

      // Callback
      if (onComplete) {
        const timer = setTimeout(() => {
          runOnJS(onComplete)();
        }, animation.scorePopDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          alignSelf: 'center',
          top: '40%',
          zIndex: 100,
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: '900',
            color: color,
            textShadowColor: color,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}
