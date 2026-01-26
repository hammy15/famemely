import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';
import { colors } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuthStore();
  const router = useRouter();

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
      icon: 'trophy-outline',
      label: 'Champion Cards',
      onPress: () => router.push('/champions' as Href),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => router.push('/settings' as Href),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="items-center py-8 px-4">
          {/* Avatar */}
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="w-28 h-28 rounded-full border-4 border-primary-500"
            />
          ) : (
            <View
              className="w-28 h-28 rounded-full bg-primary-500 items-center justify-center"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
              }}
            >
              <Text className="text-background-primary text-4xl font-black">
                {user?.displayName ? getInitials(user.displayName) : '?'}
              </Text>
            </View>
          )}

          <Text className="text-white text-3xl font-black mt-4">
            {user?.displayName || 'Anonymous'}
          </Text>
          <Text className="text-gray-400 mt-1">{user?.email}</Text>

          {/* Premium Badge */}
          {user?.premium && (
            <View className="flex-row items-center bg-accent-gold/20 px-4 py-2 rounded-full mt-4">
              <MaterialCommunityIcons name="crown" size={20} color={colors.accent.gold} />
              <Text className="text-accent-gold font-bold ml-2">PREMIUM</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row mx-4 mb-6">
          <View className="flex-1 bg-background-secondary rounded-xl p-4 mr-2 items-center">
            <Text className="text-primary-500 text-3xl font-black">
              {user?.stats?.gamesPlayed || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Games</Text>
          </View>
          <View className="flex-1 bg-background-secondary rounded-xl p-4 mx-2 items-center">
            <Text className="text-secondary-500 text-3xl font-black">
              {user?.stats?.gamesWon || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Wins</Text>
          </View>
          <View className="flex-1 bg-background-secondary rounded-xl p-4 ml-2 items-center">
            <Text className="text-accent-gold text-3xl font-black">
              {user?.stats?.roundsWon || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Cards</Text>
          </View>
        </View>

        {/* Premium Upsell */}
        {!user?.premium && (
          <TouchableOpacity className="mx-4 mb-6 bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="crown" size={32} color={colors.accent.gold} />
              <View className="flex-1 ml-3">
                <Text className="text-accent-gold font-bold text-lg">
                  Go Premium
                </Text>
                <Text className="text-gray-400 text-sm">
                  No ads, exclusive stickers, and more!
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.accent.gold} />
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View className="mx-4 bg-background-secondary rounded-xl overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-700' : ''
              }`}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon as any} size={24} color={colors.text.secondary} />
              <Text className="text-white flex-1 ml-3 font-medium">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="mx-4 mb-8 bg-status-error/10 border border-status-error/30 rounded-xl py-4"
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <Text className="text-status-error text-center font-bold">Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text className="text-gray-600 text-center text-sm mb-8">
          FaMEMEly v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
