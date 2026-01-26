import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEditorStore } from '@/stores/editorStore';

const COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#FF69B4',
];

const FONTS = ['Impact', 'Arial', 'Comic Sans MS', 'Times New Roman'];

export default function TextOverlayEditor() {
  const { project, addText, updateText, removeText, selectedTextId } = useEditorStore();
  const [editingText, setEditingText] = useState('');

  const selectedText = project.textOverlays.find((t) => t.id === selectedTextId);

  const handleAddText = () => {
    addText('NEW TEXT');
  };

  const handleTextChange = (text: string) => {
    setEditingText(text);
    if (selectedTextId) {
      updateText(selectedTextId, { text });
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedTextId) {
      updateText(selectedTextId, { color });
    }
  };

  const handleFontSizeChange = (delta: number) => {
    if (selectedTextId && selectedText) {
      const newSize = Math.max(12, Math.min(96, selectedText.fontSize + delta));
      updateText(selectedTextId, { fontSize: newSize });
    }
  };

  return (
    <View className="flex-1">
      {selectedTextId ? (
        <View className="flex-1">
          {/* Text Input */}
          <TextInput
            className="bg-gray-700 text-white px-3 py-2 rounded-lg mb-2"
            value={selectedText?.text || ''}
            onChangeText={handleTextChange}
            placeholder="Enter text..."
            placeholderTextColor="#6b7280"
          />

          {/* Controls Row */}
          <View className="flex-row items-center justify-between">
            {/* Font Size */}
            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-gray-700 p-2 rounded-l-lg"
                onPress={() => handleFontSizeChange(-4)}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <View className="bg-gray-700 px-3 py-2">
                <Text className="text-white text-sm">
                  {selectedText?.fontSize || 48}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-gray-700 p-2 rounded-r-lg"
                onPress={() => handleFontSizeChange(4)}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Colors */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  className="mx-1"
                  onPress={() => handleColorChange(color)}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: color,
                      borderWidth: selectedText?.color === color ? 2 : 1,
                      borderColor: selectedText?.color === color ? '#22c55e' : '#6b7280',
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Delete */}
            <TouchableOpacity
              className="bg-red-500/20 p-2 rounded-lg"
              onPress={() => removeText(selectedTextId)}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          className="flex-1 bg-gray-700 rounded-xl items-center justify-center"
          onPress={handleAddText}
        >
          <MaterialCommunityIcons name="format-text" size={32} color="#9ca3af" />
          <Text className="text-gray-400 mt-2">Add Text</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
