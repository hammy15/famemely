import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';

// Spring configurations
export const springs = {
  // Bouncy entrance (cards, buttons)
  bouncy: {
    damping: 8,
    stiffness: 100,
    mass: 1,
  },

  // Smooth transitions
  smooth: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Snappy interactions
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },

  // Gentle (used for subtle movements)
  gentle: {
    damping: 25,
    stiffness: 80,
    mass: 1,
  },

  // Button press
  button: {
    damping: 10,
    stiffness: 400,
    mass: 0.5,
  },
};

// Timing configurations
export const timings = {
  instant: { duration: 100, easing: Easing.linear },
  fast: { duration: 200, easing: Easing.out(Easing.ease) },
  normal: { duration: 300, easing: Easing.inOut(Easing.ease) },
  slow: { duration: 500, easing: Easing.inOut(Easing.ease) },
  phase: { duration: 2000, easing: Easing.inOut(Easing.ease) },
};

// Common animation sequences
export const sequences = {
  // Scale bounce in
  bounceIn: (scale: SharedValue<number>) => {
    'worklet';
    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1.1, springs.bouncy),
      withSpring(1, springs.snappy)
    );
  },

  // Scale bounce out
  bounceOut: (scale: SharedValue<number>, callback?: () => void) => {
    'worklet';
    scale.value = withSequence(
      withSpring(1.1, springs.bouncy),
      withTiming(0, timings.fast, () => {
        if (callback) runOnJS(callback)();
      })
    );
  },

  // Pulse effect (attention)
  pulse: (scale: SharedValue<number>) => {
    'worklet';
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  },

  // Button press effect
  buttonPress: (scale: SharedValue<number>) => {
    'worklet';
    scale.value = withSequence(
      withSpring(0.95, springs.button),
      withSpring(1, springs.button)
    );
  },

  // Shake effect (error)
  shake: (translateX: SharedValue<number>) => {
    'worklet';
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  },

  // Glow pulse
  glowPulse: (opacity: SharedValue<number>, minOpacity = 0.3, maxOpacity = 0.8) => {
    'worklet';
    opacity.value = withRepeat(
      withSequence(
        withTiming(maxOpacity, { duration: 1000 }),
        withTiming(minOpacity, { duration: 1000 })
      ),
      -1,
      true
    );
  },

  // Float up and fade (score pop)
  floatUp: (
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
    callback?: () => void
  ) => {
    'worklet';
    translateY.value = withTiming(-100, { duration: 1000, easing: Easing.out(Easing.ease) });
    opacity.value = withDelay(
      500,
      withTiming(0, { duration: 500 }, () => {
        if (callback) runOnJS(callback)();
      })
    );
  },

  // Slide in from direction
  slideIn: (
    translate: SharedValue<number>,
    from: number,
    to: number = 0,
    delay: number = 0
  ) => {
    'worklet';
    translate.value = from;
    translate.value = withDelay(delay, withSpring(to, springs.smooth));
  },

  // Fade in
  fadeIn: (opacity: SharedValue<number>, delay: number = 0, duration: number = 300) => {
    'worklet';
    opacity.value = 0;
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  },

  // Winner celebration sequence
  winnerCelebration: (
    scale: SharedValue<number>,
    rotation: SharedValue<number>,
    glow: SharedValue<number>
  ) => {
    'worklet';
    // Scale bounce
    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1.2, springs.bouncy),
      withSpring(1, springs.smooth)
    );

    // Slight rotation wiggle
    rotation.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(-3, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Glow pulse
    glow.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.6, { duration: 300 })
    );
  },

  // Timer warning pulse
  timerWarningPulse: (
    scale: SharedValue<number>,
    backgroundColor: SharedValue<string>,
    warningColor: string
  ) => {
    'worklet';
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      ),
      -1,
      true
    );
  },
};

// Entrance animations for FlatList items
export const listItemEnterances = {
  // Staggered slide up
  staggeredSlideUp: (index: number, translateY: SharedValue<number>, opacity: SharedValue<number>) => {
    'worklet';
    const delay = index * 50;
    translateY.value = 30;
    opacity.value = 0;
    translateY.value = withDelay(delay, withSpring(0, springs.smooth));
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
  },

  // Staggered scale in
  staggeredScaleIn: (index: number, scale: SharedValue<number>, opacity: SharedValue<number>) => {
    'worklet';
    const delay = index * 75;
    scale.value = 0.8;
    opacity.value = 0;
    scale.value = withDelay(delay, withSpring(1, springs.bouncy));
    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
  },

  // Pop in
  popIn: (index: number, scale: SharedValue<number>) => {
    'worklet';
    const delay = index * 50;
    scale.value = 0;
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.1, springs.bouncy),
        withSpring(1, springs.snappy)
      )
    );
  },
};

// Phase transition animations
export const phaseAnimations = {
  // Full-screen phase announcement
  phaseAnnounce: (
    scale: SharedValue<number>,
    opacity: SharedValue<number>,
    textY: SharedValue<number>,
    onComplete?: () => void
  ) => {
    'worklet';
    // Initial state
    scale.value = 0.5;
    opacity.value = 0;
    textY.value = 50;

    // Animate in
    scale.value = withSequence(
      withSpring(1.1, springs.bouncy),
      withSpring(1, springs.smooth)
    );
    opacity.value = withTiming(1, { duration: 200 });
    textY.value = withDelay(200, withSpring(0, springs.smooth));

    // Animate out after delay
    const exitDelay = 1700;
    scale.value = withDelay(exitDelay, withTiming(0.8, { duration: 300 }));
    opacity.value = withDelay(
      exitDelay,
      withTiming(0, { duration: 300 }, () => {
        if (onComplete) runOnJS(onComplete)();
      })
    );
  },
};

export default {
  springs,
  timings,
  sequences,
  listItemEnterances,
  phaseAnimations,
};
