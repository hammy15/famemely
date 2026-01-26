import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useEditorStore } from '@/stores/editorStore';

export default function FilterSlider() {
  const { project, updateFilters } = useEditorStore();

  const filters = [
    {
      key: 'brightness' as const,
      label: 'Brightness',
      min: 0.5,
      max: 1.5,
      value: project.filters.brightness,
    },
    {
      key: 'contrast' as const,
      label: 'Contrast',
      min: 0.5,
      max: 1.5,
      value: project.filters.contrast,
    },
    {
      key: 'saturation' as const,
      label: 'Saturation',
      min: 0,
      max: 2,
      value: project.filters.saturation,
    },
  ];

  return (
    <View className="flex-1 justify-center">
      {filters.map((filter) => (
        <View key={filter.key} className="flex-row items-center mb-1">
          <Text className="text-gray-400 text-xs w-20">{filter.label}</Text>
          <View className="flex-1 mx-2">
            <Slider
              minimumValue={filter.min}
              maximumValue={filter.max}
              value={filter.value}
              onValueChange={(value) =>
                updateFilters({ [filter.key]: value })
              }
              minimumTrackTintColor="#22c55e"
              maximumTrackTintColor="#4b5563"
              thumbTintColor="#22c55e"
            />
          </View>
          <Text className="text-gray-400 text-xs w-10 text-right">
            {Math.round(filter.value * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}
