import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { ChampionCard } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface GameCardProps {
  card: ChampionCard;
  onPress?: () => void;
}

export default function GameCard({ card, onPress }: GameCardProps) {
  return (
    <TouchableOpacity
      className="bg-gradient-to-b from-yellow-500 to-orange-500 rounded-2xl p-1"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View className="bg-gray-900 rounded-xl overflow-hidden">
        {/* Trophy Badge */}
        <View className="absolute top-2 right-2 z-10 bg-yellow-500 rounded-full p-2">
          <MaterialCommunityIcons name="trophy" size={16} color="#000" />
        </View>

        {/* Meme Image */}
        {card.memeUrl ? (
          <Image
            source={{ uri: card.memeUrl }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full aspect-square bg-gray-800 items-center justify-center">
            <MaterialCommunityIcons name="image" size={48} color="#4b5563" />
          </View>
        )}

        {/* Card Info */}
        <View className="p-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-gray-400 text-xs">
              {card.winType === 'both' ? "Judge's Pick + People's Choice" :
               card.winType === 'audience' ? "People's Choice" : "Judge's Pick"}
            </Text>
          </View>
          {card.captions && card.captions.length > 0 && (
            <Text className="text-white text-sm font-medium" numberOfLines={2}>
              "{card.captions[0].text}"
            </Text>
          )}

          <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-gray-800">
            <Text className="text-gray-500 text-xs">
              {card.wonAt ? formatRelativeTime(card.wonAt) : 'Recently'}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="heart" size={14} color="#ef4444" />
              <Text className="text-gray-400 text-xs ml-1">{card.likes || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
