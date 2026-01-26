import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'shield-outline',
      label: 'Privacy',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      label: 'Terms of Service',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="items-center py-8 px-4">
          {/* Avatar */}
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center">
              <Text className="text-white text-3xl font-bold">
                {user?.displayName ? getInitials(user.displayName) : '?'}
              </Text>
            </View>
          )}

          <Text className="text-white text-2xl font-bold mt-4">
            {user?.displayName || 'Anonymous'}
          </Text>
          <Text className="text-gray-400 mt-1">{user?.email}</Text>

          {/* Premium Badge */}
          {user?.premium && (
            <View className="flex-row items-center bg-yellow-500/20 px-3 py-1 rounded-full mt-3">
              <MaterialCommunityIcons name="crown" size={16} color="#fbbf24" />
              <Text className="text-yellow-500 font-medium ml-1">Premium</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row mx-4 mb-6">
          <View className="flex-1 bg-gray-800 rounded-xl p-4 mr-2 items-center">
            <Text className="text-white text-2xl font-bold">
              {user?.stats?.gamesPlayed || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Games</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 mx-2 items-center">
            <Text className="text-white text-2xl font-bold">
              {user?.stats?.gamesWon || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Wins</Text>
          </View>
          <View className="flex-1 bg-gray-800 rounded-xl p-4 ml-2 items-center">
            <Text className="text-white text-2xl font-bold">
              {user?.stats?.roundsWon || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Rounds</Text>
          </View>
        </View>

        {/* Premium Upsell */}
        {!user?.premium && (
          <TouchableOpacity className="mx-4 mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="crown" size={32} color="#fff" />
              <View className="flex-1 ml-3">
                <Text className="text-white font-bold text-lg">
                  Go Premium
                </Text>
                <Text className="text-yellow-100 text-sm">
                  No ads, exclusive stickers, and more!
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View className="mx-4 bg-gray-800 rounded-2xl overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-700' : ''
              }`}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon as any} size={24} color="#9ca3af" />
              <Text className="text-white flex-1 ml-3">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="mx-4 mb-8 bg-red-500/10 rounded-xl py-4"
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <Text className="text-red-500 text-center font-bold">Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text className="text-gray-600 text-center text-sm mb-8">
          FaMEMEly v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
