import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PlayerSubmissionProps {
  memeUri: string | null;
  onPickMeme: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function PlayerSubmission({
  memeUri,
  onPickMeme,
  onSubmit,
  isSubmitting,
}: PlayerSubmissionProps) {
  return (
    <View className="flex-1">
      {memeUri ? (
        <View className="flex-1">
          {/* Preview */}
          <View className="flex-1 items-center justify-center">
            <View className="rounded-2xl overflow-hidden">
              <Image
                source={{ uri: memeUri }}
                style={{ width: 280, height: 280 }}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 bg-gray-800 py-4 rounded-xl flex-row items-center justify-center"
              onPress={onPickMeme}
            >
              <Ionicons name="swap-horizontal" size={20} color="#9ca3af" />
              <Text className="text-gray-400 font-medium ml-2">Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 bg-primary-500 py-4 rounded-xl flex-row items-center justify-center ${
                isSubmitting ? 'opacity-50' : ''
              }`}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text className="text-white font-bold ml-2">Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <TouchableOpacity
            className="bg-gray-800 rounded-2xl p-8 items-center"
            onPress={onPickMeme}
          >
            <MaterialCommunityIcons
              name="image-plus"
              size={64}
              color="#22c55e"
            />
            <Text className="text-white font-bold text-lg mt-4">
              Create Your Meme
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Pick an image from your gallery
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center mt-6">
            <View className="flex-row items-center">
              <Ionicons name="bulb" size={20} color="#fbbf24" />
              <Text className="text-yellow-500 ml-2">
                Tip: Be creative and funny!
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
