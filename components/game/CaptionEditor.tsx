import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  PanResponder,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { useCaptionStore, CAPTION_PRESETS, FONT_FAMILIES, CAPTION_COLORS } from '@/stores/captionStore';
import { colors } from '@/constants/theme';
import type { Caption } from '@/types';
import GameButton from './GameButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_SIZE = SCREEN_WIDTH - 48;

interface CaptionEditorProps {
  photoUrl: string;
  onSubmit: (captions: Caption[]) => void;
  isSubmitting?: boolean;
}

export default function CaptionEditor({ photoUrl, onSubmit, isSubmitting }: CaptionEditorProps) {
  const {
    captions,
    selectedCaptionId,
    addCaption,
    updateCaption,
    removeCaption,
    selectCaption,
    moveCaption,
    applyCaptionPreset,
  } = useCaptionStore();

  const [showControls, setShowControls] = useState(true);
  const previewRef = useRef<View>(null);

  const selectedCaption = captions.find(c => c.id === selectedCaptionId);

  // Handle touch on the preview to position captions
  const handlePreviewPress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const x = (locationX / PREVIEW_SIZE) * 100;
    const y = (locationY / PREVIEW_SIZE) * 100;

    if (selectedCaptionId) {
      moveCaption(selectedCaptionId, x, y);
    } else {
      // Add new caption at tap location
      const newId = addCaption();
      moveCaption(newId, x, y);
    }
    Keyboard.dismiss();
  }, [selectedCaptionId, moveCaption, addCaption]);

  const handleAddCaption = () => {
    addCaption();
    setShowControls(true);
  };

  const handleDeleteCaption = () => {
    if (selectedCaptionId) {
      removeCaption(selectedCaptionId);
    }
  };

  const handleSubmit = () => {
    onSubmit(captions);
  };

  const getTextStyle = (caption: Caption) => {
    const scaledFontSize = (caption.fontSize / 400) * PREVIEW_SIZE;

    const baseStyle: any = {
      fontSize: scaledFontSize,
      fontFamily: caption.fontFamily,
      color: caption.color,
      transform: [
        { rotate: `${caption.rotation}deg` },
        { scale: caption.scale },
      ],
      textAlign: 'center' as const,
    };

    if (caption.style === 'outline') {
      return {
        ...baseStyle,
        textShadowColor: '#000',
        textShadowOffset: { width: -2, height: 2 },
        textShadowRadius: 3,
      };
    }

    if (caption.style === 'shadow') {
      return {
        ...baseStyle,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 3, height: 3 },
        textShadowRadius: 5,
      };
    }

    return baseStyle;
  };

  return (
    <View className="flex-1">
      {/* Preview Area */}
      <Animated.View entering={FadeIn} className="items-center mb-4">
        <TouchableOpacity
          ref={previewRef}
          activeOpacity={1}
          onPress={handlePreviewPress}
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: colors.background.tertiary,
          }}
        >
          {/* Photo */}
          <Image
            source={{ uri: photoUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Caption Overlays */}
          {captions.map((caption) => (
            <TouchableOpacity
              key={caption.id}
              onPress={() => selectCaption(caption.id)}
              style={{
                position: 'absolute',
                left: `${caption.x}%`,
                top: `${caption.y}%`,
                transform: [{ translateX: -50 }, { translateY: -50 }],
                borderWidth: selectedCaptionId === caption.id ? 2 : 0,
                borderColor: colors.primary,
                borderStyle: 'dashed',
                padding: 4,
                borderRadius: 4,
              }}
            >
              <Text style={getTextStyle(caption)}>
                {caption.text || 'Tap to edit'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Tap hint when no captions */}
          {captions.length === 0 && (
            <View className="absolute inset-0 items-center justify-center bg-black/30">
              <MaterialCommunityIcons name="gesture-tap" size={48} color="#fff" />
              <Text className="text-white font-bold mt-2">Tap to add caption</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Controls */}
      {showControls && selectedCaption && (
        <Animated.View entering={SlideInUp} className="flex-1">
          {/* Text Input */}
          <View className="bg-background-secondary rounded-xl p-3 mb-3">
            <TextInput
              value={selectedCaption.text}
              onChangeText={(text) => updateCaption(selectedCaption.id, { text })}
              placeholder="Enter your caption..."
              placeholderTextColor={colors.text.muted}
              className="text-white text-lg font-bold text-center"
              multiline
              maxLength={100}
              autoFocus
            />
          </View>

          {/* Position Presets */}
          <View className="flex-row justify-around mb-3">
            {(['top', 'middle', 'bottom'] as const).map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => applyCaptionPreset(selectedCaption.id, preset)}
                className="bg-background-secondary px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-400 capitalize">{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Font Size */}
          <View className="flex-row items-center justify-center mb-3">
            <TouchableOpacity
              onPress={() => updateCaption(selectedCaption.id, {
                fontSize: Math.max(16, selectedCaption.fontSize - 4)
              })}
              className="bg-background-secondary p-3 rounded-lg mr-2"
            >
              <MaterialCommunityIcons name="format-font-size-decrease" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <View className="bg-background-secondary px-4 py-2 rounded-lg mx-2">
              <Text className="text-white font-bold">{selectedCaption.fontSize}px</Text>
            </View>
            <TouchableOpacity
              onPress={() => updateCaption(selectedCaption.id, {
                fontSize: Math.min(72, selectedCaption.fontSize + 4)
              })}
              className="bg-background-secondary p-3 rounded-lg ml-2"
            >
              <MaterialCommunityIcons name="format-font-size-increase" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Colors */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {CAPTION_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => updateCaption(selectedCaption.id, { color })}
                className={`w-10 h-10 rounded-full mx-1 items-center justify-center ${
                  selectedCaption.color === color ? 'border-2 border-primary-500' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedCaption.color === color && (
                  <Ionicons name="checkmark" size={20} color={color === '#FFFFFF' ? '#000' : '#fff'} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Style Options */}
          <View className="flex-row justify-center mb-3">
            {(['normal', 'outline', 'shadow'] as const).map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => updateCaption(selectedCaption.id, { style })}
                className={`px-4 py-2 mx-1 rounded-lg ${
                  selectedCaption.style === style
                    ? 'bg-primary-500'
                    : 'bg-background-secondary'
                }`}
              >
                <Text
                  className={`capitalize ${
                    selectedCaption.style === style ? 'text-background-primary font-bold' : 'text-gray-400'
                  }`}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDeleteCaption}
            className="flex-row items-center justify-center py-2"
          >
            <Ionicons name="trash-outline" size={20} color={colors.secondary} />
            <Text className="text-secondary-500 ml-2">Delete Caption</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom Actions */}
      <View className="flex-row gap-3 mt-auto pt-3">
        <TouchableOpacity
          onPress={handleAddCaption}
          className="flex-1 bg-background-secondary py-4 rounded-xl items-center flex-row justify-center"
        >
          <Ionicons name="add" size={24} color={colors.text.secondary} />
          <Text className="text-gray-400 ml-2 font-bold">Add Caption</Text>
        </TouchableOpacity>

        <View className="flex-2">
          <GameButton
            label="SUBMIT"
            variant="submit"
            size="lg"
            glow={captions.length > 0}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={captions.length === 0 || isSubmitting}
            icon={<Ionicons name="send" size={20} color={colors.background.primary} />}
          />
        </View>
      </View>
    </View>
  );
}
