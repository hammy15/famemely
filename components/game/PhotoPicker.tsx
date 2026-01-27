import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useGameStore } from '@/stores/gameStore';
import { colors } from '@/constants/theme';
import type { GamePhoto } from '@/types';
import GameButton from './GameButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH * 0.85;

interface PhotoPickerProps {
  photos: Record<string, GamePhoto>;
  isJudge: boolean;
}

export default function PhotoPicker({ photos, isJudge }: PhotoPickerProps) {
  const { pickPhoto, isLoading } = useGameStore();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const photoList = Object.values(photos).filter(p => !p.isDefault);
  // Also include some random default photos for variety
  const defaultPhotos = Object.values(photos).filter(p => p.isDefault).slice(0, 10);
  const allPhotos = [...photoList, ...defaultPhotos];

  const handleSelectPhoto = async () => {
    if (!selectedPhotoId) {
      Alert.alert('Select a photo', 'Please pick a photo for players to caption');
      return;
    }

    try {
      await pickPhoto(selectedPhotoId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick photo');
    }
  };

  const renderPhoto = ({ item, index }: { item: GamePhoto; index: number }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <TouchableOpacity
        onPress={() => setSelectedPhotoId(item.id)}
        activeOpacity={0.9}
        className="mr-4"
        style={{ width: PHOTO_WIDTH }}
      >
        <View
          className={`rounded-2xl overflow-hidden border-4 ${
            selectedPhotoId === item.id
              ? 'border-primary-500'
              : 'border-transparent'
          }`}
          style={{
            shadowColor: selectedPhotoId === item.id ? colors.primary : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: selectedPhotoId === item.id ? 0.5 : 0,
            shadowRadius: 20,
          }}
        >
          <Image
            source={{ uri: item.photoUrl }}
            style={{ width: PHOTO_WIDTH - 8, height: PHOTO_WIDTH - 8 }}
            resizeMode="cover"
          />

          {/* Selected Badge */}
          {selectedPhotoId === item.id && (
            <View className="absolute top-4 right-4 bg-primary-500 rounded-full p-2">
              <Ionicons name="checkmark" size={24} color="#fff" />
            </View>
          )}

          {/* Photo Type Badge */}
          <View className="absolute bottom-4 left-4 bg-gray-900/80 rounded-lg px-3 py-1">
            <Text className="text-white text-sm font-medium">
              {item.isDefault ? 'Default Photo' : 'Player Photo'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // If not the judge, show waiting screen
  if (!isJudge) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeIn}
          className="w-32 h-32 rounded-full items-center justify-center mb-6"
          style={{
            backgroundColor: `${colors.accent.gold}20`,
            shadowColor: colors.accent.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
          }}
        >
          <MaterialCommunityIcons name="image-search" size={64} color={colors.accent.gold} />
        </Animated.View>

        <Text className="text-white text-3xl font-black text-center mb-2">
          Judge is Picking...
        </Text>
        <Text className="text-gray-400 text-lg text-center">
          The judge is selecting a photo for everyone to caption
        </Text>

        <Animated.View
          entering={FadeInUp.delay(500)}
          className="mt-8 flex-row items-center"
        >
          <View className="w-2 h-2 rounded-full bg-accent-gold animate-pulse mr-2" />
          <Text className="text-accent-gold">Waiting for selection...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <Animated.View entering={FadeInUp} className="items-center mb-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: `${colors.accent.gold}20`,
            shadowColor: colors.accent.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
          }}
        >
          <MaterialCommunityIcons name="gavel" size={40} color={colors.accent.gold} />
        </View>
        <Text className="text-white text-2xl font-black">You're the Judge!</Text>
        <Text className="text-gray-400 text-center mt-1">
          Pick a photo for players to caption
        </Text>
      </Animated.View>

      {/* Photo Carousel */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={allPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - PHOTO_WIDTH) / 2 }}
          snapToInterval={PHOTO_WIDTH + 16}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (PHOTO_WIDTH + 16));
            setCurrentIndex(index);
          }}
        />

        {/* Pagination Dots */}
        <View className="flex-row justify-center mt-4">
          {allPhotos.slice(0, 10).map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-primary-500' : 'bg-gray-600'
              }`}
            />
          ))}
          {allPhotos.length > 10 && (
            <Text className="text-gray-500 text-xs ml-2">+{allPhotos.length - 10} more</Text>
          )}
        </View>
      </View>

      {/* Photo Count */}
      <Text className="text-gray-400 text-center text-sm mb-4">
        {currentIndex + 1} of {allPhotos.length} photos
      </Text>

      {/* Select Button */}
      <View className="px-4 pb-4">
        <GameButton
          label={selectedPhotoId ? "PICK THIS PHOTO" : "SELECT A PHOTO"}
          variant="primary"
          size="xl"
          glow={!!selectedPhotoId}
          onPress={handleSelectPhoto}
          disabled={!selectedPhotoId || isLoading}
          loading={isLoading}
          icon={<MaterialCommunityIcons name="check-circle" size={24} color={colors.background.primary} />}
        />
      </View>
    </View>
  );
}
