import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp, ZoomIn } from 'react-native-reanimated';
import { useGameStore } from '@/stores/gameStore';
import { colors } from '@/constants/theme';

interface TimeExtensionButtonProps {
  isJudge: boolean;
  timeRemaining: number;
}

const EXTENSION_OPTIONS: Array<15 | 30 | 60> = [15, 30, 60];

export default function TimeExtensionButton({ isJudge, timeRemaining }: TimeExtensionButtonProps) {
  const { grantTimeExtension, currentGame } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  // Only show for judge during captioning phase
  if (!isJudge || currentGame?.status !== 'captioning') {
    return null;
  }

  const extensionsGranted = currentGame?.timeExtensions?.length || 0;
  const maxExtensions = 3;
  const canGrantMore = extensionsGranted < maxExtensions;

  const handleGrant = async (seconds: 15 | 30 | 60) => {
    setIsGranting(true);
    try {
      await grantTimeExtension(seconds);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to grant extension:', error);
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        disabled={!canGrantMore}
        className={`flex-row items-center px-4 py-2 rounded-full ${
          canGrantMore ? 'bg-accent-gold/20 border border-accent-gold/50' : 'bg-gray-800/50'
        }`}
      >
        <MaterialCommunityIcons
          name="timer-plus"
          size={20}
          color={canGrantMore ? colors.accent.gold : colors.text.muted}
        />
        <Text
          className={`ml-2 font-bold ${
            canGrantMore ? 'text-accent-gold' : 'text-gray-500'
          }`}
        >
          +Time ({maxExtensions - extensionsGranted} left)
        </Text>
      </TouchableOpacity>

      {/* Extension Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <Animated.View
            entering={SlideInUp}
            className="bg-background-secondary rounded-2xl p-6 w-full max-w-sm"
          >
            <View className="items-center mb-6">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${colors.accent.gold}20` }}
              >
                <MaterialCommunityIcons name="timer-plus" size={32} color={colors.accent.gold} />
              </View>
              <Text className="text-white text-xl font-black">Grant Extra Time</Text>
              <Text className="text-gray-400 text-center mt-1">
                Give players more time to perfect their captions
              </Text>
            </View>

            {/* Extension Options */}
            <View className="flex-row justify-between mb-6">
              {EXTENSION_OPTIONS.map((seconds, index) => (
                <Animated.View key={seconds} entering={ZoomIn.delay(index * 100)}>
                  <TouchableOpacity
                    onPress={() => handleGrant(seconds)}
                    disabled={isGranting}
                    className="bg-accent-gold/20 border border-accent-gold/50 rounded-xl px-6 py-4 items-center"
                    style={{
                      shadowColor: colors.accent.gold,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                    }}
                  >
                    <Text className="text-accent-gold text-2xl font-black">+{seconds}</Text>
                    <Text className="text-gray-400 text-xs">seconds</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="bg-background-tertiary py-3 rounded-xl items-center"
            >
              <Text className="text-gray-400 font-bold">Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
