import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEditorStore } from '@/stores/editorStore';

// Placeholder sticker URLs - in production, these would come from Firebase Storage
const STICKERS = [
  { id: '1', url: 'https://via.placeholder.com/100/FFE135/000000?text=LOL', name: 'LOL' },
  { id: '2', url: 'https://via.placeholder.com/100/FF6B35/FFFFFF?text=WOW', name: 'WOW' },
  { id: '3', url: 'https://via.placeholder.com/100/39FF14/000000?text=NICE', name: 'NICE' },
  { id: '4', url: 'https://via.placeholder.com/100/00D4FF/000000?text=OMG', name: 'OMG' },
  { id: '5', url: 'https://via.placeholder.com/100/FF69B4/FFFFFF?text=BRUH', name: 'BRUH' },
  { id: '6', url: 'https://via.placeholder.com/100/FFE135/000000?text=DEAD', name: 'DEAD' },
];

const STICKER_PACKS = [
  { id: 'popular', name: 'Popular', icon: 'fire' },
  { id: 'faces', name: 'Faces', icon: 'emoticon' },
  { id: 'text', name: 'Text', icon: 'format-text' },
  { id: 'premium', name: 'Premium', icon: 'crown', premium: true },
];

export default function StickerPicker() {
  const { addSticker } = useEditorStore();

  const handleAddSticker = (url: string) => {
    addSticker(url);
  };

  return (
    <View className="flex-1">
      {/* Sticker Pack Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {STICKER_PACKS.map((pack) => (
          <TouchableOpacity
            key={pack.id}
            className={`flex-row items-center px-3 py-1 mr-2 rounded-full ${
              pack.id === 'popular' ? 'bg-primary-500' : 'bg-gray-700'
            }`}
          >
            <MaterialCommunityIcons
              name={pack.icon as any}
              size={16}
              color={pack.id === 'popular' ? '#fff' : '#9ca3af'}
            />
            <Text
              className={`ml-1 text-sm ${
                pack.id === 'popular' ? 'text-white' : 'text-gray-400'
              }`}
            >
              {pack.name}
            </Text>
            {pack.premium && (
              <MaterialCommunityIcons
                name="lock"
                size={12}
                color="#fbbf24"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stickers Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {STICKERS.map((sticker) => (
          <TouchableOpacity
            key={sticker.id}
            className="w-16 h-16 bg-gray-700 rounded-lg mr-2 items-center justify-center overflow-hidden"
            onPress={() => handleAddSticker(sticker.url)}
          >
            <Image
              source={{ uri: sticker.url }}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}

        {/* Add More Placeholder */}
        <TouchableOpacity className="w-16 h-16 bg-gray-700 rounded-lg items-center justify-center border border-dashed border-gray-600">
          <MaterialCommunityIcons name="plus" size={24} color="#6b7280" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
