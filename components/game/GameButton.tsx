import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, touchTargets } from '@/constants/theme';

type ButtonSize = 'md' | 'lg' | 'xl';
type ButtonVariant = 'primary' | 'secondary' | 'ready' | 'submit' | 'danger';

interface GameButtonProps {
  onPress: () => void;
  label: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  glow?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const sizeStyles: Record<ButtonSize, { height: number; fontSize: number; paddingX: number }> = {
  md: { height: touchTargets.medium, fontSize: 18, paddingX: 20 },
  lg: { height: touchTargets.large, fontSize: 22, paddingX: 28 },
  xl: { height: touchTargets.xlarge, fontSize: 28, paddingX: 36 },
};

const variantStyles: Record<ButtonVariant, { bg: string; text: string; glow: string }> = {
  primary: { bg: colors.primary, text: colors.background.primary, glow: colors.primary },
  secondary: { bg: colors.secondary, text: '#fff', glow: colors.secondary },
  ready: { bg: colors.accent.lime, text: colors.background.primary, glow: colors.accent.lime },
  submit: { bg: colors.primary, text: colors.background.primary, glow: colors.primary },
  danger: { bg: colors.status.error, text: '#fff', glow: colors.status.error },
};

export default function GameButton({
  onPress,
  label,
  size = 'lg',
  variant = 'primary',
  glow = false,
  disabled = false,
  loading = false,
  icon,
  style,
}: GameButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  useEffect(() => {
    if (glow && !disabled) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [glow, disabled]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow ? glowOpacity.value : 0,
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        animatedStyle,
        glowStyle,
        {
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingX,
          backgroundColor: disabled ? colors.background.tertiary : variantStyle.bg,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: variantStyle.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: glow ? 25 : 0,
          elevation: glow ? 10 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={{
              color: disabled ? colors.text.muted : variantStyle.text,
              fontSize: sizeStyle.fontSize,
              fontWeight: '900',
              marginLeft: icon ? 8 : 0,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}
