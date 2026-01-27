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
import { colors } from '@/constants/theme';

// Only import Firebase if not in demo mode
let firebaseFunctions: any = null;
if (!DEMO_MODE) {
  firebaseFunctions = require('@/lib/firebase');
}

export default function ChampionsScreen() {
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
      <View
        className="rounded-xl p-1"
        style={{
          backgroundColor: colors.accent.gold,
          shadowColor: colors.accent.gold,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
        }}
      >
        <View className="bg-background-secondary rounded-lg overflow-hidden">
          {item.memeUrl ? (
            <Image
              source={{ uri: item.memeUrl }}
              className="w-full aspect-square"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full aspect-square bg-background-tertiary items-center justify-center">
              <MaterialCommunityIcons
                name="trophy"
                size={48}
                color={colors.accent.gold}
              />
            </View>
          )}
          <View className="p-2">
            {item.captions && item.captions.length > 0 && (
              <Text className="text-gray-400 text-xs" numberOfLines={2}>
                "{item.captions[0].text}"
              </Text>
            )}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-gray-500 text-xs">
                {item.wonAt ? formatRelativeTime(item.wonAt) : 'Recently'}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="heart" size={12} color={colors.secondary} />
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
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      {/* Stats Bar */}
      <View className="flex-row px-4 py-4">
        <View className="flex-1 bg-background-secondary rounded-xl p-3 mr-2">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="trophy" size={28} color={colors.accent.gold} />
            <Text className="text-white font-black text-2xl ml-2">
              {cards.length}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-1">Champion Cards</Text>
        </View>
        <View className="flex-1 bg-background-secondary rounded-xl p-3 ml-2">
          <View className="flex-row items-center">
            <Ionicons name="heart" size={28} color={colors.secondary} />
            <Text className="text-white font-black text-2xl ml-2">
              {cards.reduce((sum, card) => sum + (card.likes || 0), 0)}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-1">Total Likes</Text>
        </View>
      </View>

      {/* Cards Grid */}
      {cards.length === 0 && !isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-32 h-32 rounded-full bg-background-secondary items-center justify-center mb-6"
            style={{
              shadowColor: colors.accent.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            <MaterialCommunityIcons
              name="cards-outline"
              size={64}
              color={colors.text.muted}
            />
          </View>
          <Text className="text-white text-2xl font-black">
            No Cards Yet
          </Text>
          <Text className="text-gray-400 text-center mt-2 text-lg">
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
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
