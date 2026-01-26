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
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons name="image-plus" size={80} color="#4b5563" />
          <Text className="text-white text-2xl font-bold mt-6">
            Create a Meme
          </Text>
          <Text className="text-gray-400 text-center mt-2 mb-8">
            Choose an image to start creating your masterpiece
          </Text>

          <View className="w-full space-y-4">
            <TouchableOpacity
              className="bg-primary-500 py-4 rounded-xl flex-row items-center justify-center"
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-800 py-4 rounded-xl flex-row items-center justify-center border border-gray-700"
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">
                Take a Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-accent-600 py-4 rounded-xl flex-row items-center justify-center"
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
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2">
        <TouchableOpacity
          onPress={clearProject}
          className="flex-row items-center"
        >
          <Ionicons name="close" size={24} color="#fff" />
          <Text className="text-white ml-1">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-white font-bold text-lg">Edit Meme</Text>

        <TouchableOpacity
          className="bg-primary-500 px-4 py-2 rounded-lg"
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View className="flex-1 justify-center items-center px-4">
        <MemeCanvas />
      </View>

      {/* Tool Tabs */}
      <View className="bg-gray-800 border-t border-gray-700">
        <View className="flex-row justify-around py-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`items-center py-2 px-4 rounded-lg ${
                activeTab === tab.id ? 'bg-gray-700' : ''
              }`}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={24}
                color={activeTab === tab.id ? '#22c55e' : '#9ca3af'}
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
