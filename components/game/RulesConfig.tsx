import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGameStore } from '@/stores/gameStore';
import { colors } from '@/constants/theme';
import type { GameSettings } from '@/types';

interface RulesConfigProps {
  settings: GameSettings;
  onUpdate: (settings: Partial<GameSettings>) => void;
  isHost: boolean;
}

const TIME_OPTIONS = [60, 90, 120, 180];
const CARDS_TO_WIN_OPTIONS = [3, 5, 7, 10];

export default function RulesConfig({ settings, onUpdate, isHost }: RulesConfigProps) {
  if (!isHost) {
    // Non-hosts see read-only view
    return (
      <Animated.View entering={FadeInDown} className="bg-background-secondary rounded-xl p-4">
        <Text className="text-gray-400 text-sm font-bold mb-3">GAME RULES</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-primary-500 text-2xl font-black">{settings.timePerRound}s</Text>
            <Text className="text-gray-500 text-xs">Caption Time</Text>
          </View>
          <View className="items-center">
            <Text className="text-secondary-500 text-2xl font-black">{settings.cardsToWin}</Text>
            <Text className="text-gray-500 text-xs">Cards to Win</Text>
          </View>
          <View className="items-center">
            <Ionicons
              name={settings.useDefaultPhotos ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={settings.useDefaultPhotos ? colors.accent.lime : colors.text.muted}
            />
            <Text className="text-gray-500 text-xs">Default Photos</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown} className="bg-background-secondary rounded-xl p-4">
      <Text className="text-gray-400 text-sm font-bold mb-4">GAME RULES</Text>

      {/* Caption Time */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="timer" size={18} color={colors.primary} />
          <Text className="text-white font-medium ml-2">Caption Time</Text>
        </View>
        <View className="flex-row">
          {TIME_OPTIONS.map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => onUpdate({ timePerRound: time })}
              className={`flex-1 py-2 mx-1 rounded-lg items-center ${
                settings.timePerRound === time
                  ? 'bg-primary-500'
                  : 'bg-background-tertiary'
              }`}
            >
              <Text
                className={`font-bold ${
                  settings.timePerRound === time ? 'text-background-primary' : 'text-gray-400'
                }`}
              >
                {time}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cards to Win */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="trophy" size={18} color={colors.accent.gold} />
          <Text className="text-white font-medium ml-2">Cards to Win</Text>
        </View>
        <View className="flex-row">
          {CARDS_TO_WIN_OPTIONS.map((cards) => (
            <TouchableOpacity
              key={cards}
              onPress={() => onUpdate({ cardsToWin: cards })}
              className={`flex-1 py-2 mx-1 rounded-lg items-center ${
                settings.cardsToWin === cards
                  ? 'bg-accent-gold'
                  : 'bg-background-tertiary'
              }`}
            >
              <Text
                className={`font-bold ${
                  settings.cardsToWin === cards ? 'text-background-primary' : 'text-gray-400'
                }`}
              >
                {cards}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Default Photos Toggle */}
      <View className="flex-row items-center justify-between py-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="image-multiple" size={18} color={colors.text.secondary} />
          <View className="ml-2">
            <Text className="text-white font-medium">Include Default Photos</Text>
            <Text className="text-gray-500 text-xs">50 funny photos to add to the pool</Text>
          </View>
        </View>
        <Switch
          value={settings.useDefaultPhotos}
          onValueChange={(value) => onUpdate({ useDefaultPhotos: value })}
          trackColor={{ false: colors.background.tertiary, true: `${colors.accent.lime}50` }}
          thumbColor={settings.useDefaultPhotos ? colors.accent.lime : colors.text.muted}
        />
      </View>
    </Animated.View>
  );
}
