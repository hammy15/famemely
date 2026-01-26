import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View>
            <Text className="text-gray-400 text-sm">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">
              {user?.displayName || 'Meme Lord'}
            </Text>
          </View>
          <TouchableOpacity className="bg-gray-800 p-3 rounded-full">
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-primary-500 p-4 rounded-2xl"
            onPress={() => router.push('/(tabs)/play')}
          >
            <MaterialCommunityIcons name="sword-cross" size={32} color="#fff" />
            <Text className="text-white font-bold text-lg mt-2">Play Now</Text>
            <Text className="text-primary-100 text-sm">Join a meme battle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-accent-600 p-4 rounded-2xl"
            onPress={() => router.push('/(tabs)/create')}
          >
            <MaterialCommunityIcons name="image-edit" size={32} color="#fff" />
            <Text className="text-white font-bold text-lg mt-2">Create</Text>
            <Text className="text-accent-100 text-sm">Make a meme</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View className="bg-gray-800 rounded-2xl p-4 mb-6">
          <Text className="text-gray-400 text-sm mb-3">Your Stats</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {user?.stats?.gamesPlayed || 0}
              </Text>
              <Text className="text-gray-400 text-xs">Games</Text>
            </View>
            <View className="h-full w-px bg-gray-700" />
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {user?.stats?.gamesWon || 0}
              </Text>
              <Text className="text-gray-400 text-xs">Wins</Text>
            </View>
            <View className="h-full w-px bg-gray-700" />
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {user?.stats?.roundsWon || 0}
              </Text>
              <Text className="text-gray-400 text-xs">Rounds Won</Text>
            </View>
          </View>
        </View>

        {/* Featured Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg font-bold">
              Trending Memes
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-500 text-sm">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className="w-40 h-40 bg-gray-800 rounded-xl mr-3 items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="image"
                  size={48}
                  color="#4b5563"
                />
                <Text className="text-gray-500 text-xs mt-2">
                  Trending #{i}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* How to Play */}
        <View className="bg-gray-800 rounded-2xl p-4 mb-6">
          <Text className="text-white text-lg font-bold mb-3">
            How to Play
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className="text-gray-300 flex-1">
                Join or create a game with friends
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className="text-gray-300 flex-1">
                Create memes for the prompt each round
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold">3</Text>
              </View>
              <Text className="text-gray-300 flex-1">
                Judge picks the funniest meme - winner gets a Champion Card!
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer for tab bar */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
