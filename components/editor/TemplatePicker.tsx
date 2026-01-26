import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Placeholder templates - in production, these would come from Firebase Storage
const TEMPLATES = [
  {
    id: '1',
    name: 'Drake',
    url: 'https://via.placeholder.com/200x200/1a1a2e/ffffff?text=Drake',
  },
  {
    id: '2',
    name: 'Distracted BF',
    url: 'https://via.placeholder.com/200x200/16213e/ffffff?text=Distracted',
  },
  {
    id: '3',
    name: 'Change My Mind',
    url: 'https://via.placeholder.com/200x200/0f3460/ffffff?text=ChangeMind',
  },
  {
    id: '4',
    name: 'Two Buttons',
    url: 'https://via.placeholder.com/200x200/e94560/ffffff?text=TwoButtons',
  },
  {
    id: '5',
    name: 'Expanding Brain',
    url: 'https://via.placeholder.com/200x200/533483/ffffff?text=Brain',
  },
  {
    id: '6',
    name: 'Is This a Pigeon',
    url: 'https://via.placeholder.com/200x200/0f3460/ffffff?text=Pigeon',
  },
];

interface TemplatePickerProps {
  onSelect: (imageUri: string) => void;
}

export default function TemplatePicker({ onSelect }: TemplatePickerProps) {
  return (
    <View className="flex-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            className="mr-3"
            onPress={() => onSelect(template.url)}
          >
            <View className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
              <Image
                source={{ uri: template.url }}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-gray-400 text-xs text-center mt-1" numberOfLines={1}>
              {template.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Browse More */}
        <TouchableOpacity className="items-center justify-center">
          <View className="w-20 h-20 bg-gray-700 rounded-lg items-center justify-center border border-dashed border-gray-600">
            <MaterialCommunityIcons name="magnify" size={24} color="#6b7280" />
          </View>
          <Text className="text-gray-400 text-xs text-center mt-1">
            Browse
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
