import { View, Text, Image, Dimensions } from 'react-native';
import { colors } from '@/constants/theme';
import type { Caption } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CaptionPreviewProps {
  photoUrl: string;
  captions: Caption[];
  size?: 'small' | 'medium' | 'large';
  showBorder?: boolean;
}

export default function CaptionPreview({
  photoUrl,
  captions,
  size = 'medium',
  showBorder = false,
}: CaptionPreviewProps) {
  const dimensions = {
    small: SCREEN_WIDTH * 0.4,
    medium: SCREEN_WIDTH * 0.7,
    large: SCREEN_WIDTH - 32,
  };

  const containerSize = dimensions[size];

  const getTextStyle = (caption: Caption) => {
    // Calculate font size relative to container size
    const scaledFontSize = (caption.fontSize / 400) * containerSize;

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
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
      };
    }

    if (caption.style === 'shadow') {
      return {
        ...baseStyle,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
      };
    }

    return baseStyle;
  };

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: showBorder ? 2 : 0,
        borderColor: colors.primary,
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
        <View
          key={caption.id}
          style={{
            position: 'absolute',
            left: `${caption.x}%`,
            top: `${caption.y}%`,
            transform: [{ translateX: -50 }, { translateY: -50 }],
          }}
          pointerEvents="none"
        >
          <Text
            style={getTextStyle(caption)}
            numberOfLines={3}
          >
            {caption.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
