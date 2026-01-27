import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/theme';
import type { GamePhoto } from '@/types';
import GameButton from './GameButton';

interface PhotoUploaderProps {
  photos: Record<string, GamePhoto>;
  onFinish: () => void;
  isHost: boolean;
}

export default function PhotoUploader({ photos, onFinish, isHost }: PhotoUploaderProps) {
  const user = useAuthStore((state) => state.user);
  const { uploadPhoto, isLoading } = useGameStore();
  const [isUploading, setIsUploading] = useState(false);

  const photoList = Object.values(photos);
  const userPhotos = photoList.filter(p => p.uploaderId === user?.id);
  const defaultPhotos = photoList.filter(p => p.isDefault);
  const playerPhotos = photoList.filter(p => !p.isDefault);

  const handlePickPhoto = useCallback(async () => {
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

    if (!result.canceled && result.assets[0] && user) {
      setIsUploading(true);
      try {
        await uploadPhoto(user.id, result.assets[0].uri);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
    }
  }, [user, uploadPhoto]);

  const handleTakePhoto = useCallback(async () => {
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

    if (!result.canceled && result.assets[0] && user) {
      setIsUploading(true);
      try {
        await uploadPhoto(user.id, result.assets[0].uri);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
    }
  }, [user, uploadPhoto]);

  const renderPhoto = ({ item, index }: { item: GamePhoto; index: number }) => (
    <Animated.View
      entering={ZoomIn.delay(index * 50)}
      className="w-[31%] aspect-square m-[1%] rounded-lg overflow-hidden"
    >
      <Image
        source={{ uri: item.photoUrl }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {item.uploaderId === user?.id && (
        <View className="absolute top-1 right-1 bg-primary-500 rounded-full p-1">
          <Ionicons name="person" size={10} color="#fff" />
        </View>
      )}
      {item.isDefault && (
        <View className="absolute bottom-1 left-1 bg-gray-800/80 rounded px-1">
          <Text className="text-white text-xs">Default</Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View className="flex-1">
      {/* Header Stats */}
      <Animated.View entering={FadeInDown.delay(100)} className="px-4 mb-4">
        <View className="flex-row justify-between bg-background-secondary rounded-xl p-4">
          <View className="items-center">
            <Text className="text-primary-500 text-2xl font-black">{playerPhotos.length}</Text>
            <Text className="text-gray-400 text-xs">Player Photos</Text>
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center">
            <Text className="text-gray-400 text-2xl font-black">{defaultPhotos.length}</Text>
            <Text className="text-gray-400 text-xs">Default Photos</Text>
          </View>
          <View className="w-px bg-gray-700" />
          <View className="items-center">
            <Text className="text-accent-lime text-2xl font-black">{userPhotos.length}</Text>
            <Text className="text-gray-400 text-xs">Your Photos</Text>
          </View>
        </View>
      </Animated.View>

      {/* Upload Buttons */}
      <Animated.View entering={FadeInDown.delay(200)} className="px-4 mb-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handlePickPhoto}
            disabled={isUploading}
            className="flex-1 bg-primary-500/20 border border-primary-500/50 rounded-xl p-4 items-center"
            style={{
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
            }}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="images" size={32} color={colors.primary} />
                <Text className="text-primary-500 font-bold mt-2">Gallery</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTakePhoto}
            disabled={isUploading}
            className="flex-1 bg-secondary-500/20 border border-secondary-500/50 rounded-xl p-4 items-center"
            style={{
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
            }}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <>
                <Ionicons name="camera" size={32} color={colors.secondary} />
                <Text className="text-secondary-500 font-bold mt-2">Camera</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Photo Grid */}
      <View className="flex-1 px-2">
        <Text className="text-gray-400 text-sm px-2 mb-2">
          Photo Pool ({photoList.length} photos)
        </Text>
        <FlatList
          data={photoList}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center py-10">
              <MaterialCommunityIcons name="image-multiple" size={64} color={colors.text.muted} />
              <Text className="text-gray-400 mt-4">No photos yet</Text>
              <Text className="text-gray-500 text-sm">Upload some photos to get started!</Text>
            </View>
          }
        />
      </View>

      {/* Finish Button (Host Only) */}
      {isHost && (
        <Animated.View entering={FadeIn.delay(300)} className="px-4 pb-4">
          <GameButton
            label="START GAME"
            variant="primary"
            size="xl"
            glow={playerPhotos.length >= 3}
            onPress={onFinish}
            disabled={playerPhotos.length < 3 || isLoading}
            loading={isLoading}
            icon={<Ionicons name="play" size={24} color={colors.background.primary} />}
          />
          {playerPhotos.length < 3 && (
            <Text className="text-gray-500 text-center text-sm mt-2">
              Need at least 3 player photos to start
            </Text>
          )}
        </Animated.View>
      )}

      {!isHost && (
        <Animated.View entering={FadeIn.delay(300)} className="px-4 pb-4">
          <View className="bg-background-secondary rounded-xl py-4">
            <Text className="text-gray-400 text-center">
              Waiting for host to start the game...
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
