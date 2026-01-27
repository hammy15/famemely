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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail } from '@/lib/utils';
import { DEMO_MODE } from '@/lib/mock';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInDemo, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (DEMO_MODE) {
      // In demo mode, any login attempt works
      await signInDemo();
      return;
    }

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

  const handleDemoLogin = async () => {
    await signInDemo();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo/Title */}
          <View className="items-center mb-12">
            <Text className="text-5xl font-black text-primary-500 mb-2">
              FaMEMEly
            </Text>
            <Text className="text-lg text-gray-400">
              Meme battles with friends
            </Text>
          </View>

          {/* Demo Mode Banner */}
          {DEMO_MODE && (
            <View className="bg-accent-gold/20 border border-accent-gold/50 rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="test-tube" size={20} color="#FFD700" />
                <Text className="text-accent-gold font-bold ml-2">DEMO MODE</Text>
              </View>
              <Text className="text-gray-400 text-center text-sm mt-1">
                No account needed - just tap Play Demo!
              </Text>
            </View>
          )}

          {/* Demo Login Button */}
          <TouchableOpacity
            className={`bg-primary-500 py-4 rounded-xl mb-4 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleDemoLogin}
            disabled={isLoading}
            style={{
              shadowColor: '#00FFFF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="play-circle" size={24} color="#000" />
                <Text className="text-background-primary text-center font-black text-lg ml-2">
                  PLAY DEMO
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="text-gray-500 px-4 text-sm">or sign in</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-300 mb-2 text-sm font-medium">
                Email
              </Text>
              <TextInput
                className="bg-background-secondary text-white px-4 py-3 rounded-xl border border-gray-700"
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
                className="bg-background-secondary text-white px-4 py-3 rounded-xl border border-gray-700"
                placeholder="Enter your password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`bg-background-secondary py-4 rounded-xl border border-gray-700 ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-bold text-lg">
                Sign In
              </Text>
            </TouchableOpacity>
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
