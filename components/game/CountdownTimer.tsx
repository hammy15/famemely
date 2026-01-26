import { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, gameConstants } from '@/constants/theme';
import { formatTimer } from '@/lib/utils';

interface CountdownTimerProps {
  timeRemaining: number;
  totalTime: number;
  size?: 'normal' | 'large' | 'hero';
  showProgress?: boolean;
}

const sizeConfig = {
  normal: { fontSize: 24, iconSize: 24, height: 48 },
  large: { fontSize: 48, iconSize: 32, height: 80 },
  hero: { fontSize: 80, iconSize: 48, height: 120 },
};

export default function CountdownTimer({
  timeRemaining,
  totalTime,
  size = 'large',
  showProgress = true,
}: CountdownTimerProps) {
  const config = sizeConfig[size];
  const progress = timeRemaining / totalTime;
  const isWarning = timeRemaining <= gameConstants.timerWarningThreshold;
  const isCritical = timeRemaining <= gameConstants.timerCriticalThreshold;

  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isCritical) {
      // Critical pulsing
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 200 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        true
      );
    } else if (isWarning) {
      // Warning pulse (slower)
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
      pulseOpacity.value = 0;
    } else {
      scale.value = withTiming(1);
      pulseOpacity.value = 0;
    }
  }, [isWarning, isCritical]);

  const timerColor = isCritical
    ? colors.game.timerWarning
    : isWarning
    ? colors.game.timer
    : colors.game.timerSafe;

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View className="items-center">
      {/* Timer Display */}
      <Animated.View
        style={containerStyle}
        className="flex-row items-center justify-center"
      >
        {/* Background Pulse for Critical */}
        {isCritical && (
          <Animated.View
            style={[
              pulseStyle,
              {
                position: 'absolute',
                width: '120%',
                height: '120%',
                borderRadius: 20,
                backgroundColor: colors.game.timerWarning,
              },
            ]}
          />
        )}

        <View
          className="flex-row items-center px-6 rounded-xl"
          style={{
            backgroundColor: colors.background.secondary,
            height: config.height,
            shadowColor: timerColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isWarning ? 0.6 : 0.3,
            shadowRadius: isWarning ? 20 : 10,
          }}
        >
          <Ionicons name="time" size={config.iconSize} color={timerColor} />
          <Text
            className="ml-3 font-black"
            style={{
              fontSize: config.fontSize,
              color: timerColor,
              textShadowColor: timerColor,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isWarning ? 10 : 0,
            }}
          >
            {formatTimer(timeRemaining)}
          </Text>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      {showProgress && (
        <View
          className="mt-3 rounded-full overflow-hidden"
          style={{
            width: '80%',
            height: 6,
            backgroundColor: colors.background.tertiary,
          }}
        >
          <Animated.View
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: timerColor,
              borderRadius: 3,
            }}
          />
        </View>
      )}
    </View>
  );
}
