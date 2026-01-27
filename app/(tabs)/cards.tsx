import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { DEMO_MODE, MOCK_CHAMPION_CARDS } from '@/lib/mock';
import type { ChampionCard } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

// Only import Firebase if not in demo mode
let firebaseFunctions: any = null;
if (!DEMO_MODE) {
  firebaseFunctions = require('@/lib/firebase');
}

export default function CardsScreen() {
  const user = useAuthStore((state) => state.user);
  const [cards, setCards] = useState<ChampionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (DEMO_MODE) {
      // Use mock champion cards in demo mode
      setTimeout(() => {
        setCards(MOCK_CHAMPION_CARDS);
        setIsLoading(false);
      }, 500);
      return;
    }

    const unsubscribe = firebaseFunctions.subscribeToUserChampionCards(user.id, (newCards: ChampionCard[]) => {
      setCards(newCards);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderCard = ({ item }: { item: ChampionCard }) => (
    <TouchableOpacity className="w-[48%] mb-4">
      <View className="bg-gradient-to-b from-yellow-500 to-orange-500 rounded-2xl p-1">
        <View className="bg-gray-900 rounded-xl overflow-hidden">
          {item.memeUrl ? (
            <Image
              source={{ uri: item.memeUrl }}
              className="w-full aspect-square"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full aspect-square bg-gray-800 items-center justify-center">
              <MaterialCommunityIcons
                name="trophy"
                size={48}
                color="#fbbf24"
              />
            </View>
          )}
          <View className="p-2">
            <Text className="text-gray-400 text-xs" numberOfLines={2}>
              "{item.prompt}"
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-gray-500 text-xs">
                {item.wonAt ? formatRelativeTime(item.wonAt) : 'Recently'}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="heart" size={12} color="#ef4444" />
                <Text className="text-gray-400 text-xs ml-1">
                  {item.likes || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Champion Cards</Text>
        <Text className="text-gray-400 mt-1">
          Your collection of winning memes
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row px-4 mb-4">
        <View className="flex-1 bg-gray-800 rounded-xl p-3 mr-2">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="trophy" size={24} color="#fbbf24" />
            <Text className="text-white font-bold text-xl ml-2">
              {cards.length}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-1">Total Cards</Text>
        </View>
        <View className="flex-1 bg-gray-800 rounded-xl p-3 ml-2">
          <View className="flex-row items-center">
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text className="text-white font-bold text-xl ml-2">
              {cards.reduce((sum, card) => sum + (card.likes || 0), 0)}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-1">Total Likes</Text>
        </View>
      </View>

      {/* Cards Grid */}
      {cards.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="cards-outline"
            size={80}
            color="#4b5563"
          />
          <Text className="text-white text-xl font-bold mt-4">
            No Cards Yet
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Win rounds in meme battles to earn Champion Cards!
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              tintColor="#22c55e"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
