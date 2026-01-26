import { Audio } from 'expo-av';
import { Platform } from 'react-native';

/**
 * Game Audio Service
 *
 * Sound files should be added to assets/sounds/ with these names:
 * - button-press.mp3, button-success.mp3, button-error.mp3
 * - timer-tick.mp3, timer-warning.mp3, timer-expired.mp3
 * - phase-transition.mp3, submission-received.mp3
 * - reveal-card.mp3, winner-announcement.mp3, celebration.mp3
 * - lobby-music.mp3, game-music.mp3
 *
 * Until sound files are added, this service will silently no-op.
 */

// Sound configuration - map keys to asset paths
// Uncomment and update paths when sound files are added
const SOUND_CONFIG: Record<string, any> = {
  // When you have sound files, use like this:
  // buttonPress: require('../assets/sounds/button-press.mp3'),
};

class GameAudioService {
  private soundObjects: Map<string, Audio.Sound> = new Map();
  private musicObject: Audio.Sound | null = null;
  private isEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private volume: number = 1.0;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('[GameAudio] Failed to initialize:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled && this.musicObject) {
      this.stopMusic();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private async loadSound(key: string): Promise<Audio.Sound | null> {
    // Return cached sound if available
    if (this.soundObjects.has(key)) {
      return this.soundObjects.get(key)!;
    }

    // Check if sound file is configured
    const source = SOUND_CONFIG[key];
    if (!source) {
      // Sound not configured - silently skip
      return null;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        volume: this.volume,
      });
      this.soundObjects.set(key, sound);
      return sound;
    } catch (error) {
      console.warn(`[GameAudio] Failed to load sound: ${key}`, error);
      return null;
    }
  }

  private async playSound(key: string, options?: { volume?: number; loop?: boolean }) {
    if (!this.isEnabled) return;

    try {
      const sound = await this.loadSound(key);
      if (!sound) return;

      await sound.setVolumeAsync((options?.volume ?? 1) * this.volume);
      await sound.setIsLoopingAsync(options?.loop ?? false);
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      // Silently fail - sounds are optional
    }
  }

  // ==================
  // UI Sounds
  // ==================
  async buttonPress() {
    await this.playSound('buttonPress', { volume: 0.5 });
  }

  async buttonSuccess() {
    await this.playSound('buttonSuccess', { volume: 0.7 });
  }

  async buttonError() {
    await this.playSound('buttonError', { volume: 0.7 });
  }

  // ==================
  // Timer Sounds
  // ==================
  async timerTick() {
    await this.playSound('timerTick', { volume: 0.3 });
  }

  async timerWarning() {
    await this.playSound('timerWarning', { volume: 0.8 });
  }

  async timerExpired() {
    await this.playSound('timerExpired', { volume: 1.0 });
  }

  // ==================
  // Game Events
  // ==================
  async phaseTransition() {
    await this.playSound('phaseTransition', { volume: 0.9 });
  }

  async submissionReceived() {
    await this.playSound('submissionReceived', { volume: 0.6 });
  }

  async revealCard() {
    await this.playSound('revealCard', { volume: 0.8 });
  }

  async winnerAnnouncement() {
    await this.playSound('winnerAnnouncement', { volume: 1.0 });
  }

  async celebration() {
    await this.playSound('celebration', { volume: 1.0 });
  }

  // ==================
  // Background Music
  // ==================
  async playLobbyMusic() {
    if (!this.isMusicEnabled) return;
    await this.playMusic('lobbyMusic');
  }

  async playGameMusic() {
    if (!this.isMusicEnabled) return;
    await this.playMusic('gameMusic');
  }

  private async playMusic(key: string) {
    const source = SOUND_CONFIG[key];
    if (!source) return;

    try {
      await this.stopMusic();

      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        volume: 0.3 * this.volume,
      });

      this.musicObject = sound;
      await sound.playAsync();
    } catch (error) {
      console.warn('[GameAudio] Failed to play music:', error);
    }
  }

  async stopMusic() {
    if (this.musicObject) {
      try {
        await this.musicObject.stopAsync();
        await this.musicObject.unloadAsync();
      } catch (error) {
        // Ignore errors during cleanup
      }
      this.musicObject = null;
    }
  }

  stopAllSounds() {
    this.soundObjects.forEach(async (sound) => {
      try {
        await sound.stopAsync();
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
    this.stopMusic();
  }

  async cleanup() {
    this.stopAllSounds();
    for (const sound of this.soundObjects.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    this.soundObjects.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const gameAudio = new GameAudioService();

// Initialize on import (non-blocking)
gameAudio.initialize();

export default gameAudio;
