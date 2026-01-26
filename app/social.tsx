import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

type TabType = 'friends' | 'discover';

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data
  const friends = [
    { id: '1', name: 'Player One', status: 'online', gamesWon: 12 },
    { id: '2', name: 'Meme Lord', status: 'in-game', gamesWon: 8 },
    { id: '3', name: 'Caption King', status: 'offline', gamesWon: 15 },
  ];

  const renderFriend = ({ item }: { item: typeof friends[0] }) => (
    <TouchableOpacity className="flex-row items-center bg-background-secondary rounded-xl p-4 mb-3">
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.players[parseInt(item.id) % colors.players.length] }}
      >
        <Text className="text-background-primary font-black text-lg">
          {item.name.charAt(0)}
        </Text>
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-white font-bold">{item.name}</Text>
        <View className="flex-row items-center mt-1">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              item.status === 'online'
                ? 'bg-accent-lime'
                : item.status === 'in-game'
                ? 'bg-primary-500'
                : 'bg-gray-500'
            }`}
          />
          <Text className="text-gray-400 text-sm capitalize">{item.status}</Text>
        </View>
      </View>

      <View className="items-center">
        <Text className="text-accent-gold font-black text-lg">{item.gamesWon}</Text>
        <Text className="text-gray-500 text-xs">wins</Text>
      </View>

      {item.status === 'online' && (
        <TouchableOpacity className="ml-3 bg-primary-500 px-4 py-2 rounded-lg">
          <Text className="text-background-primary font-bold">Invite</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      {/* Tabs */}
      <View className="flex-row mx-4 mb-4 bg-background-secondary rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${activeTab === 'friends' ? 'bg-primary-500' : ''}`}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            className={`text-center font-bold ${
              activeTab === 'friends' ? 'text-background-primary' : 'text-gray-400'
            }`}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg ${activeTab === 'discover' ? 'bg-primary-500' : ''}`}
          onPress={() => setActiveTab('discover')}
        >
          <Text
            className={`text-center font-bold ${
              activeTab === 'discover' ? 'text-background-primary' : 'text-gray-400'
            }`}
          >
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="mx-4 mb-4">
        <View className="flex-row items-center bg-background-secondary rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color={colors.text.muted} />
          <TextInput
            className="flex-1 ml-3 text-white"
            placeholder="Search players..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {activeTab === 'friends' ? (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons
                name="account-group-outline"
                size={64}
                color={colors.text.muted}
              />
              <Text className="text-white text-xl font-bold mt-4">
                No Friends Yet
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                Add friends to play games together!
              </Text>
            </View>
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="account-search"
            size={64}
            color={colors.text.muted}
          />
          <Text className="text-white text-xl font-bold mt-4">
            Find Players
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Search for players by username to add them as friends
          </Text>
        </View>
      )}

      {/* Add Friend Button */}
      <View className="px-4 py-4">
        <TouchableOpacity className="bg-secondary-500 py-4 rounded-xl flex-row items-center justify-center">
          <Ionicons name="person-add" size={24} color="#fff" />
          <Text className="text-white font-bold text-lg ml-2">Add Friend</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
