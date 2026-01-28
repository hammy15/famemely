import * as Sharing from 'expo-sharing';
import { Share, Platform } from 'react-native';

// Share types for different platforms
export type ShareTarget = 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'whatsapp' | 'general';

interface ShareOptions {
  imageUri?: string;
  message?: string;
  url?: string;
  title?: string;
}

// Check if sharing is available on this device
export const canShare = async (): Promise<boolean> => {
  return Sharing.isAvailableAsync();
};

// Share a meme image with optional message
export const shareMeme = async (options: ShareOptions): Promise<boolean> => {
  const { imageUri, message, title } = options;

  try {
    if (imageUri && await Sharing.isAvailableAsync()) {
      // For iOS/Android native sharing with image
      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/jpeg',
        dialogTitle: title || 'Share your meme',
        UTI: 'public.jpeg',
      });
      return true;
    } else {
      // Fallback to text-only share
      await Share.share({
        message: message || 'Check out this meme from FaMEMEly!',
        title: title || 'FaMEMEly Meme',
      });
      return true;
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
};

// Share game invite
export const shareGameInvite = async (gameCode: string, hostName?: string): Promise<boolean> => {
  const message = hostName
    ? `${hostName} invited you to play FaMEMEly!\n\nGame Code: ${gameCode}\n\nDownload the app and join the fun: https://famemely.app`
    : `Join my FaMEMEly game!\n\nGame Code: ${gameCode}\n\nDownload the app: https://famemely.app`;

  try {
    await Share.share({
      message,
      title: 'FaMEMEly Game Invite',
    });
    return true;
  } catch (error) {
    console.error('Error sharing invite:', error);
    return false;
  }
};

// Share champion card
export const shareChampionCard = async (
  cardImageUri: string,
  caption?: string,
  winType?: 'judge' | 'audience' | 'both'
): Promise<boolean> => {
  const winText = winType === 'both'
    ? "Judge's Pick & People's Choice!"
    : winType === 'judge'
      ? "Judge's Pick!"
      : "People's Choice!";

  const message = caption
    ? `"${caption}" - ${winText}\n\nMade with FaMEMEly`
    : `${winText}\n\nMade with FaMEMEly`;

  return shareMeme({
    imageUri: cardImageUri,
    message,
    title: 'FaMEMEly Champion Card',
  });
};

// Share to specific platform (deep link if available)
export const shareToTarget = async (
  target: ShareTarget,
  options: ShareOptions
): Promise<boolean> => {
  const { imageUri, message, url } = options;

  // Platform-specific sharing requires additional setup
  // For now, use general sharing
  // TODO: Implement deep linking for specific platforms

  return shareMeme(options);
};

// Download image to device (for saving memes)
// Uses expo-media-library for saving to camera roll
export const downloadMeme = async (
  imageUri: string,
  _filename?: string
): Promise<string | null> => {
  try {
    // For saving to device, use expo-media-library instead
    // This is a placeholder - implement with MediaLibrary.saveToLibraryAsync
    console.log('Save meme:', imageUri);
    return imageUri;
  } catch (error) {
    console.error('Error downloading meme:', error);
    return null;
  }
};

// Generate shareable link for a meme/card
export const generateShareLink = (cardId: string): string => {
  return `https://famemely.app/card/${cardId}`;
};

// Copy text to clipboard (game code, etc.)
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    const { Clipboard } = await import('react-native');
    Clipboard.setString(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export default {
  canShare,
  shareMeme,
  shareGameInvite,
  shareChampionCard,
  shareToTarget,
  downloadMeme,
  generateShareLink,
  copyToClipboard,
};
