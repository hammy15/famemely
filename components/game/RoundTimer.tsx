import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { formatTimer } from '@/lib/utils';

interface RoundTimerProps {
  timeRemaining: number;
  totalTime: number;
}

export default function RoundTimer({ timeRemaining, totalTime }: RoundTimerProps) {
  const progress = timeRemaining / totalTime;
  const isLow = timeRemaining <= 10;

  const pulseStyle = useAnimatedStyle(() => {
    if (!isLow) return { transform: [{ scale: 1 }] };

    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.1, { duration: 300 }),
              withTiming(1, { duration: 300 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  }, [isLow]);

  return (
    <Animated.View
      style={pulseStyle}
      className={`flex-row items-center px-4 py-2 rounded-full ${
        isLow ? 'bg-red-500/20' : 'bg-gray-700'
      }`}
    >
      <Ionicons
        name="time"
        size={20}
        color={isLow ? '#ef4444' : '#22c55e'}
      />
      <Text
        className={`ml-2 font-bold text-lg ${
          isLow ? 'text-red-500' : 'text-primary-500'
        }`}
      >
        {formatTimer(timeRemaining)}
      </Text>

      {/* Progress Bar */}
      <View className="ml-3 flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${
            isLow ? 'bg-red-500' : 'bg-primary-500'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </Animated.View>
  );
}
