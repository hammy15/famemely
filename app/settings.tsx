import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { colors } from '@/constants/theme';

type ToggleItem = {
  icon: string;
  label: string;
  type: 'toggle';
  value: boolean;
  onToggle: (value: boolean) => void;
};

type LinkItem = {
  icon: string;
  label: string;
  type: 'link';
  onPress: () => void;
};

type SettingItem = ToggleItem | LinkItem;

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingSections: SettingSection[] = [
    {
      title: 'GAME',
      items: [
        {
          icon: 'volume-high-outline',
          label: 'Sound Effects',
          type: 'toggle',
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          icon: 'phone-portrait-outline',
          label: 'Haptic Feedback',
          type: 'toggle',
          value: hapticsEnabled,
          onToggle: setHapticsEnabled,
        },
      ],
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & FAQ',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Us',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'bug-outline',
          label: 'Report a Bug',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'LEGAL',
      items: [
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, totalItems: number) => {
    const isToggle = item.type === 'toggle';

    return (
      <View
        key={item.label}
        className={`flex-row items-center px-4 py-4 ${
          index !== totalItems - 1 ? 'border-b border-gray-700' : ''
        }`}
      >
        <Ionicons name={item.icon as any} size={24} color={colors.text.secondary} />
        <Text className="text-white flex-1 ml-3 font-medium">{item.label}</Text>
        {isToggle ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.background.tertiary, true: colors.primary }}
            thumbColor="#fff"
          />
        ) : (
          <TouchableOpacity onPress={item.onPress}>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      <ScrollView className="flex-1 px-4">
        {settingSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="text-gray-400 text-xs font-bold mb-2 ml-1">
              {section.title}
            </Text>
            <View className="bg-background-secondary rounded-xl overflow-hidden">
              {section.items.map((item, index) =>
                renderSettingItem(item, index, section.items.length)
              )}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="items-center py-8">
          <Text className="text-primary-500 text-2xl font-black">FaMEMEly</Text>
          <Text className="text-gray-500 text-sm mt-1">Version 1.0.0</Text>
          <Text className="text-gray-600 text-xs mt-4">
            Made with memes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
