import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useEditorStore } from '@/stores/editorStore';
import { useAuthStore } from '@/stores/authStore';
import { uploadMeme } from '@/lib/firebase';

export function useEditor() {
  const user = useAuthStore((state) => state.user);
  const {
    project,
    selectedTextId,
    selectedStickerId,
    isExporting,
    setImage,
    clearProject,
    addText,
    updateText,
    removeText,
    selectText,
    addSticker,
    updateSticker,
    removeSticker,
    selectSticker,
    updateFilters,
    resetFilters,
    setTemplate,
    undo,
    redo,
    setExporting,
  } = useEditorStore();

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  }, [setImage]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  }, [setImage]);

  const saveMeme = useCallback(async (): Promise<string | null> => {
    if (!project.imageUri || !user) return null;

    setExporting(true);
    try {
      // In a real app, we'd capture the canvas view and upload
      // For now, just upload the base image
      const response = await fetch(project.imageUri);
      const blob = await response.blob();
      const url = await uploadMeme(user.id, blob);
      return url;
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save meme');
      return null;
    } finally {
      setExporting(false);
    }
  }, [project.imageUri, user, setExporting]);

  const shareMeme = useCallback(async () => {
    if (!project.imageUri) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing not available', 'Sharing is not supported on this device');
      return;
    }

    try {
      await Sharing.shareAsync(project.imageUri);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share meme');
    }
  }, [project.imageUri]);

  return {
    project,
    selectedTextId,
    selectedStickerId,
    isExporting,
    pickImage,
    takePhoto,
    clearProject,
    addText,
    updateText,
    removeText,
    selectText,
    addSticker,
    updateSticker,
    removeSticker,
    selectSticker,
    updateFilters,
    resetFilters,
    setTemplate,
    undo,
    redo,
    saveMeme,
    shareMeme,
  };
}
