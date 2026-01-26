/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary - Bright Cyan (Jackbox-style)
        primary: {
          50: '#E0FFFF',
          100: '#B8FFFF',
          200: '#7FFFD4',
          300: '#40E0D0',
          400: '#00CED1',
          500: '#00FFFF',  // Main primary - brighter cyan
          600: '#00D4D4',
          700: '#00A8A8',
          800: '#007878',
          900: '#004D4D',
        },
        // Secondary - Hot Magenta
        secondary: {
          50: '#FFF0F7',
          100: '#FFE0EE',
          200: '#FFB8D9',
          300: '#FF8CC4',
          400: '#FF5AAE',
          500: '#FF1493',  // Main secondary - hot magenta
          600: '#DB1180',
          700: '#B70E6B',
          800: '#930B55',
          900: '#6F083F',
        },
        // Accent - Game state colors
        accent: {
          gold: '#FFD700',
          lime: '#32CD32',
          purple: '#9B30FF',
          orange: '#FF6B35',
        },
        // Game-specific
        game: {
          timer: '#FF4500',
          timerWarning: '#FF0000',
          timerSafe: '#00FFFF',
          judging: '#FFD700',
          playing: '#00FFFF',
          results: '#32CD32',
          winner: '#FFD700',
        },
        // Backgrounds - deeper darks
        background: {
          primary: '#0A0A0F',
          secondary: '#12121A',
          tertiary: '#1A1A24',
        },
        // Meme colors (preserved)
        meme: {
          yellow: '#FFE135',
          orange: '#FF6B35',
          pink: '#FF69B4',
          blue: '#00D4FF',
          green: '#39FF14',
        },
        // Override grays for game aesthetic
        gray: {
          50: '#F5F5F7',
          100: '#E8E8EB',
          200: '#D0D0D6',
          300: '#A0A0B0',
          400: '#707080',
          500: '#505060',
          600: '#404050',
          700: '#2A2A34',
          800: '#1A1A24',
          900: '#12121A',
          950: '#0A0A0F',
        },
      },
      fontFamily: {
        'impact': ['Impact', 'system-ui'],
        'comic': ['Comic Sans MS', 'system-ui'],
        'game': ['system-ui', '-apple-system', 'BlinkMacSystemFont'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['24px', { lineHeight: '32px' }],
        '2xl': ['32px', { lineHeight: '40px' }],
        '3xl': ['48px', { lineHeight: '56px' }],
        '4xl': ['64px', { lineHeight: '72px' }],
        '5xl': ['80px', { lineHeight: '88px' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '30': '120px',
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '12px',  // Capped at 12px for game UI
        '3xl': '12px',
        'full': '9999px',
      },
      boxShadow: {
        'none': 'none',
        'game': '0 4px 0 rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.8)',
        'glow-magenta': '0 0 20px rgba(255, 20, 147, 0.8)',
        'glow-gold': '0 0 30px rgba(255, 215, 0, 1)',
        'glow-lime': '0 0 15px rgba(50, 205, 50, 0.8)',
      },
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 255, 255, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 255, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
