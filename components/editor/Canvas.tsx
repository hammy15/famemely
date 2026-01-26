import { useRef } from 'react';
import { View, Image, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useEditorStore } from '@/stores/editorStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 32;

export default function MemeCanvas() {
  const { project, updateText, updateSticker, selectText, selectSticker, selectedTextId, selectedStickerId } = useEditorStore();

  return (
    <View
      className="bg-gray-800 rounded-xl overflow-hidden"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    >
      {/* Base Image */}
      {project.imageUri && (
        <Image
          source={{ uri: project.imageUri }}
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            opacity: project.filters.brightness,
          }}
          resizeMode="cover"
        />
      )}

      {/* Text Overlays */}
      {project.textOverlays.map((textOverlay) => (
        <DraggableText
          key={textOverlay.id}
          textOverlay={textOverlay}
          canvasSize={CANVAS_SIZE}
          isSelected={selectedTextId === textOverlay.id}
          onSelect={() => selectText(textOverlay.id)}
          onUpdate={(updates) => updateText(textOverlay.id, updates)}
        />
      ))}

      {/* Stickers */}
      {project.stickers.map((sticker) => (
        <DraggableSticker
          key={sticker.id}
          sticker={sticker}
          canvasSize={CANVAS_SIZE}
          isSelected={selectedStickerId === sticker.id}
          onSelect={() => selectSticker(sticker.id)}
          onUpdate={(updates) => updateSticker(sticker.id, updates)}
        />
      ))}
    </View>
  );
}

function DraggableText({
  textOverlay,
  canvasSize,
  isSelected,
  onSelect,
  onUpdate,
}: {
  textOverlay: any;
  canvasSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}) {
  const translateX = useSharedValue(textOverlay.x * canvasSize);
  const translateY = useSharedValue(textOverlay.y * canvasSize);
  const scale = useSharedValue(textOverlay.scale);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      onSelect();
    })
    .onUpdate((event) => {
      translateX.value = Math.max(0, Math.min(canvasSize, textOverlay.x * canvasSize + event.translationX));
      translateY.value = Math.max(0, Math.min(canvasSize, textOverlay.y * canvasSize + event.translationY));
    })
    .onEnd(() => {
      onUpdate({
        x: translateX.value / canvasSize,
        y: translateY.value / canvasSize,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(3, textOverlay.scale * event.scale));
    })
    .onEnd(() => {
      onUpdate({ scale: scale.value });
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - canvasSize / 2 },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: canvasSize / 2,
            top: 0,
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            borderWidth: isSelected ? 2 : 0,
            borderColor: '#22c55e',
            borderStyle: 'dashed',
            padding: isSelected ? 4 : 0,
          }}
        >
          <Animated.Text
            style={{
              fontFamily: textOverlay.fontFamily,
              fontSize: textOverlay.fontSize,
              color: textOverlay.color,
              textShadowColor: textOverlay.strokeColor,
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: textOverlay.strokeWidth,
              textAlign: 'center',
            }}
          >
            {textOverlay.text}
          </Animated.Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function DraggableSticker({
  sticker,
  canvasSize,
  isSelected,
  onSelect,
  onUpdate,
}: {
  sticker: any;
  canvasSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}) {
  const translateX = useSharedValue(sticker.x * canvasSize);
  const translateY = useSharedValue(sticker.y * canvasSize);
  const scale = useSharedValue(sticker.scale);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      onSelect();
    })
    .onUpdate((event) => {
      translateX.value = sticker.x * canvasSize + event.translationX;
      translateY.value = sticker.y * canvasSize + event.translationY;
    })
    .onEnd(() => {
      onUpdate({
        x: translateX.value / canvasSize,
        y: translateY.value / canvasSize,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.3, Math.min(3, sticker.scale * event.scale));
    })
    .onEnd(() => {
      onUpdate({ scale: scale.value });
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - sticker.width / 2 },
      { translateY: translateY.value - sticker.height / 2 },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: sticker.width,
            height: sticker.height,
          },
          animatedStyle,
        ]}
      >
        <Image
          source={{ uri: sticker.imageUrl }}
          style={{
            width: sticker.width,
            height: sticker.height,
            borderWidth: isSelected ? 2 : 0,
            borderColor: '#22c55e',
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}
