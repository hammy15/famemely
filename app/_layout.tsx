import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useAuthStore } from '@/stores/authStore';
import { initializeStripe } from '@/lib/stripe';
import { colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(main)',
};

SplashScreen.preventAutoHideAsync();

// Custom dark theme with game colors
const GameDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background.primary,
    card: colors.background.secondary,
    text: colors.text.primary,
    border: colors.background.tertiary,
    notification: colors.secondary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();

    // Initialize Stripe
    initializeStripe();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const user = useAuthStore((state) => state.user);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to main game launcher if authenticated
      router.replace('/(main)' as Href);
    }
  }, [user, segments]);

  return (
    <ThemeProvider value={GameDarkTheme}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'fade',
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Main Game Launcher */}
        <Stack.Screen name="(main)" options={{ headerShown: false }} />

        {/* Game Lobby - Full Screen Modal */}
        <Stack.Screen
          name="game/lobby/[id]"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_bottom',
          }}
        />

        {/* Active Game - Full Screen Modal (no gestures during play) */}
        <Stack.Screen
          name="game/[id]"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: false,  // Prevent accidental exits during game
            animation: 'slide_from_bottom',
          }}
        />

        {/* Secondary Screens - Stack Navigation */}
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: 'Profile',
            headerStyle: { backgroundColor: colors.background.secondary },
            headerTintColor: colors.text.primary,
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="champions"
          options={{
            headerShown: true,
            headerTitle: 'Champion Cards',
            headerStyle: { backgroundColor: colors.background.secondary },
            headerTintColor: colors.text.primary,
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            headerTitle: 'Settings',
            headerStyle: { backgroundColor: colors.background.secondary },
            headerTintColor: colors.text.primary,
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="social"
          options={{
            headerShown: true,
            headerTitle: 'Social',
            headerStyle: { backgroundColor: colors.background.secondary },
            headerTintColor: colors.text.primary,
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="create"
          options={{
            headerShown: true,
            headerTitle: 'Create Meme',
            headerStyle: { backgroundColor: colors.background.secondary },
            headerTintColor: colors.text.primary,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
