import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticService {
  private isEnabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private async trigger(
    type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'
  ) {
    if (!this.isEnabled || Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // Silently fail on unsupported devices
    }
  }

  // Basic haptics
  light() {
    return this.trigger('light');
  }

  medium() {
    return this.trigger('medium');
  }

  heavy() {
    return this.trigger('heavy');
  }

  selection() {
    return this.trigger('selection');
  }

  success() {
    return this.trigger('success');
  }

  warning() {
    return this.trigger('warning');
  }

  error() {
    return this.trigger('error');
  }

  // UI patterns
  ui = {
    buttonPress: () => this.light(),
    buttonSuccess: () => this.success(),
    buttonError: () => this.error(),
    toggle: () => this.selection(),
    swipe: () => this.selection(),
    pull: () => this.light(),
    tap: () => this.light(),
  };

  // Game-specific patterns
  game = {
    // Rhythmic countdown ticks
    countdown: async () => {
      await this.light();
    },

    // Warning tick (more intense)
    countdownWarning: async () => {
      await this.medium();
    },

    // Critical countdown (urgent)
    countdownCritical: async () => {
      await this.heavy();
    },

    // Meme submission confirmed
    submission: async () => {
      await this.success();
    },

    // Phase transition announcement
    phaseChange: async () => {
      await this.heavy();
      setTimeout(() => this.medium(), 100);
    },

    // Winner announcement - celebration pattern
    winner: async () => {
      // Burst pattern: heavy, medium, light
      await this.heavy();
      setTimeout(async () => {
        await this.medium();
        setTimeout(async () => {
          await this.light();
          setTimeout(async () => {
            await this.success();
          }, 100);
        }, 100);
      }, 100);
    },

    // Reveal card flip
    cardReveal: async () => {
      await this.medium();
    },

    // Score increase
    scoreUp: async () => {
      await this.success();
    },

    // Timer expired
    timerExpired: async () => {
      await this.warning();
      setTimeout(() => this.error(), 150);
    },

    // Selection in judge view
    cardSelect: async () => {
      await this.selection();
    },

    // Ready button toggle
    ready: async () => {
      await this.success();
    },

    // Game start
    gameStart: async () => {
      await this.heavy();
      setTimeout(async () => {
        await this.heavy();
      }, 150);
    },

    // Round start
    roundStart: async () => {
      await this.medium();
    },

    // Game end
    gameEnd: async () => {
      // Victory pattern
      for (let i = 0; i < 3; i++) {
        setTimeout(async () => {
          await this.heavy();
        }, i * 200);
      }
    },

    // Error during game
    gameError: async () => {
      await this.error();
    },

    // Player joined/left
    playerJoin: async () => {
      await this.light();
    },

    playerLeave: async () => {
      await this.warning();
    },
  };

  // Notification patterns
  notification = {
    success: () => this.success(),
    warning: () => this.warning(),
    error: () => this.error(),
    message: () => this.light(),
  };

  // Custom pattern builder
  async pattern(sequence: Array<{ type: 'light' | 'medium' | 'heavy'; delay: number }>) {
    for (const step of sequence) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      await this.trigger(step.type);
    }
  }
}

// Singleton instance
export const haptics = new HapticService();

export default haptics;
