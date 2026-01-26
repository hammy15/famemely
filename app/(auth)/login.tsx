import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail } from '@/lib/utils';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo/Title */}
          <View className="items-center mb-12">
            <Text className="text-5xl font-bold text-white mb-2">
              FaMEMEly
            </Text>
            <Text className="text-lg text-gray-400">
              Meme battles with friends
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-300 mb-2 text-sm font-medium">
                Email
              </Text>
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary-500"
                placeholder="you@example.com"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2 text-sm font-medium">
                Password
              </Text>
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary-500"
                placeholder="Enter your password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`bg-primary-500 py-4 rounded-xl mt-4 ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login */}
          <View className="mt-8">
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-700" />
              <Text className="text-gray-500 px-4">or continue with</Text>
              <View className="flex-1 h-px bg-gray-700" />
            </View>

            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className="bg-gray-800 px-8 py-3 rounded-xl border border-gray-700">
                <Text className="text-white font-medium">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-800 px-8 py-3 rounded-xl border border-gray-700">
                <Text className="text-white font-medium">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
