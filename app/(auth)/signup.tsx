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
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { isValidEmail } from '@/lib/utils';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, isLoading } = useAuthStore();

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signUp(email, password, displayName);
    } catch (err: any) {
      Alert.alert('Signup Failed', err.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo/Title */}
            <View className="items-center mb-10">
              <Text className="text-5xl font-bold text-white mb-2">
                FaMEMEly
              </Text>
              <Text className="text-lg text-gray-400">
                Join the meme battles
              </Text>
            </View>

            {/* Signup Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-gray-300 mb-2 text-sm font-medium">
                  Display Name
                </Text>
                <TextInput
                  className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary-500"
                  placeholder="MemeLord420"
                  placeholderTextColor="#6b7280"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>

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
                  placeholder="At least 6 characters"
                  placeholderTextColor="#6b7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-gray-300 mb-2 text-sm font-medium">
                  Confirm Password
                </Text>
                <TextInput
                  className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-primary-500"
                  placeholder="Confirm your password"
                  placeholderTextColor="#6b7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className={`bg-primary-500 py-4 rounded-xl mt-4 ${
                  isLoading ? 'opacity-50' : ''
                }`}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text className="text-gray-500 text-center text-xs mt-6 px-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-500 font-bold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
