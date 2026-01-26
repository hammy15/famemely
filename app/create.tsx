import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEditorStore } from '@/stores/editorStore';
import MemeCanvas from '@/components/editor/Canvas';
import TextOverlayEditor from '@/components/editor/TextOverlay';
import StickerPicker from '@/components/editor/StickerPicker';
import FilterSlider from '@/components/editor/FilterSlider';
import TemplatePicker from '@/components/editor/TemplatePicker';
import { colors } from '@/constants/theme';

type EditorTab = 'text' | 'sticker' | 'filter' | 'template';

export default function CreateScreen() {
  const [activeTab, setActiveTab] = useState<EditorTab>('text');
  const { project, setImage, clearProject, isExporting } = useEditorStore();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const tabs: { id: EditorTab; icon: string; label: string }[] = [
    { id: 'text', icon: 'format-text', label: 'Text' },
    { id: 'sticker', icon: 'sticker-emoji', label: 'Stickers' },
    { id: 'filter', icon: 'tune-variant', label: 'Filters' },
    { id: 'template', icon: 'view-grid', label: 'Templates' },
  ];

  if (!project.imageUri) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
        <View className="flex-1 justify-center items-center px-6">
          <View
            className="w-32 h-32 rounded-full bg-background-secondary items-center justify-center mb-6"
            style={{
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            <MaterialCommunityIcons name="image-plus" size={64} color={colors.text.muted} />
          </View>
          <Text className="text-white text-3xl font-black">
            Create a Meme
          </Text>
          <Text className="text-gray-400 text-center mt-2 mb-8 text-lg">
            Choose an image to start creating
          </Text>

          <View className="w-full gap-4">
            <TouchableOpacity
              className="bg-primary-500 py-5 rounded-xl flex-row items-center justify-center"
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color={colors.background.primary} />
              <Text className="text-background-primary font-bold text-lg ml-2">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-background-secondary py-5 rounded-xl flex-row items-center justify-center border border-gray-700"
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">
                Take a Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-secondary-500 py-5 rounded-xl flex-row items-center justify-center"
              onPress={() => setActiveTab('template')}
            >
              <MaterialCommunityIcons name="view-grid" size={24} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">
                Use a Template
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2 border-b border-gray-800">
        <TouchableOpacity
          onPress={clearProject}
          className="flex-row items-center"
        >
          <Ionicons name="close" size={24} color="#fff" />
          <Text className="text-white ml-1 font-medium">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-white font-bold text-lg">Edit Meme</Text>

        <TouchableOpacity
          className="bg-primary-500 px-4 py-2 rounded-lg"
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color={colors.background.primary} size="small" />
          ) : (
            <Text className="text-background-primary font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View className="flex-1 justify-center items-center px-4">
        <MemeCanvas />
      </View>

      {/* Tool Tabs */}
      <View className="bg-background-secondary border-t border-gray-700">
        <View className="flex-row justify-around py-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`items-center py-2 px-4 rounded-lg ${
                activeTab === tab.id ? 'bg-background-tertiary' : ''
              }`}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={24}
                color={activeTab === tab.id ? colors.primary : colors.text.secondary}
              />
              <Text
                className={`text-xs mt-1 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tool Panel */}
        <View className="h-32 px-4 pb-4">
          {activeTab === 'text' && <TextOverlayEditor />}
          {activeTab === 'sticker' && <StickerPicker />}
          {activeTab === 'filter' && <FilterSlider />}
          {activeTab === 'template' && <TemplatePicker onSelect={setImage} />}
        </View>
      </View>
    </SafeAreaView>
  );
}
