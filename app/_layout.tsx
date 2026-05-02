import '../global.css';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Lexend_100Thin,
  Lexend_200ExtraLight,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black,
} from '@expo-google-fonts/lexend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { configureGoogleSignIn } from '@/hooks/useGoogleLogin';

// Configure Google Sign-In once at module load time (before any component mounts)
configureGoogleSignIn();

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { accessToken, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Lexend_100Thin,
    Lexend_200ExtraLight,
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    Lexend_900Black,
  });

  // Hide the splash screen once custom fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Navigation guard — runs whenever auth state or active route changes
  useEffect(() => {
    // Wait until fonts are ready AND the Zustand store has rehydrated from
    // AsyncStorage, so we never redirect based on a stale null token.
    if (!fontsLoaded || !_hasHydrated || segments.length === 0) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (accessToken && inAuthGroup) {
      // Authenticated user landed on an auth screen → push to main app
      router.replace('/(tabs)');
    } else if (!accessToken && inTabsGroup) {
      // Unauthenticated user tried to access the app → push to onboarding
      router.replace('/(auth)/onboarding');
    }
  }, [accessToken, _hasHydrated, fontsLoaded, segments]);

  // Keep the splash screen visible until both fonts and store are ready
  if (!fontsLoaded || !_hasHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack>
          {/* Auth flow: Stack header hidden, inner (auth)/_layout.tsx takes over */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/* Main app: header hidden, inner (tabs)/_layout.tsx takes over */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Global modal accessible from any screen */}
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
