/**
 * FaMEMEly Game Theme
 * Jackbox-style party game aesthetic: bold, saturated, game-focused
 */

export const colors = {
  // Primary game colors - bright and saturated
  primary: '#00FFFF',      // Brighter cyan
  primaryDark: '#00CED1',
  primaryLight: '#7FFFD4',

  secondary: '#FF1493',    // Hot magenta
  secondaryDark: '#C71585',
  secondaryLight: '#FF69B4',

  // Accent colors for game states
  accent: {
    gold: '#FFD700',       // Winner gold
    lime: '#32CD32',       // Ready green
    purple: '#9B30FF',     // Special effects
    orange: '#FF6B35',     // Highlights
  },

  // Game-specific colors
  game: {
    timer: '#FF4500',           // Timer orange
    timerWarning: '#FF0000',    // Timer critical
    timerSafe: '#00FFFF',       // Timer normal
    judging: '#FFD700',         // Judging phase
    playing: '#00FFFF',         // Playing phase
    results: '#32CD32',         // Results phase
    winner: '#FFD700',          // Winner highlight
  },

  // Background layers
  background: {
    primary: '#0A0A0F',    // Deepest black
    secondary: '#12121A',  // Card backgrounds
    tertiary: '#1A1A24',   // Elevated surfaces
    overlay: 'rgba(0,0,0,0.85)',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B0',
    muted: '#606070',
    accent: '#00FFFF',
  },

  // Status colors
  status: {
    success: '#32CD32',
    error: '#FF3B3B',
    warning: '#FFD700',
    info: '#00FFFF',
  },

  // Player colors for avatars/pucks
  players: [
    '#00FFFF',  // Cyan
    '#FF1493',  // Magenta
    '#FFD700',  // Gold
    '#32CD32',  // Lime
    '#9B30FF',  // Purple
    '#FF6B35',  // Orange
    '#00CED1',  // Dark cyan
    '#FF69B4',  // Pink
  ],
};

export const typography = {
  // Font sizes - bigger for game UI
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,      // Phase titles
    display: 64,   // "JUDGING!"
    hero: 80,      // Winner announcements
  },

  // Font weights - mostly bold
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Letter spacing
  letterSpacing: {
    tight: -1,
    normal: 0,
    wide: 2,
    wider: 4,
    widest: 8,  // For game codes
  },
};

export const spacing = {
  // Tighter spacing for game UI
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  xxxl: 40,

  // Screen padding
  screenPadding: 16,
  cardPadding: 14,
};

export const borderRadius = {
  // Sharper edges for game aesthetic
  none: 0,
  sm: 4,
  md: 8,      // Primary game cards
  lg: 10,
  xl: 12,     // Max for game UI
  full: 9999, // Pills and avatars
};

export const shadows = {
  // No soft shadows - bold game glows
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Sharp drop shadow
  game: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 8,
  },

  // Glow effects
  glowCyan: {
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  glowMagenta: {
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  glowGold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 15,
  },

  glowLime: {
    shadowColor: '#32CD32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
};

// Touch targets - minimum sizes for game UI
export const touchTargets = {
  minimum: 44,
  small: 48,
  medium: 56,
  large: 64,
  xlarge: 80,
  hero: 120,  // Main PLAY button
};

// Animation durations
export const animation = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  phaseTransition: 2000,
  celebration: 3000,
  scorePopDuration: 1500,
};

// Z-index layers
export const zIndex = {
  base: 0,
  card: 10,
  header: 20,
  modal: 30,
  phaseTransition: 40,
  celebration: 50,
  toast: 60,
};

// Game-specific constants
export const gameConstants = {
  minPlayers: 3,
  maxPlayers: 8,
  defaultRounds: 5,
  defaultTimePerRound: 60,

  // Timer thresholds
  timerWarningThreshold: 10,
  timerCriticalThreshold: 5,

  // Animation counts
  confettiCount: 150,
  scorePopDuration: 1500,
};

// Export combined theme object
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  touchTargets,
  animation,
  zIndex,
  gameConstants,
};

export default theme;
