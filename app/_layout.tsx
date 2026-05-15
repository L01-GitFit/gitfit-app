import '../global.css';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useNavigationContainerRef, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import * as Sentry from '@sentry/react-native';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: 'https://bc828750025345574a2c4aeee86746cf@o4511343459565568.ingest.de.sentry.io/4511375879307344',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1,
  enableNativeFramesTracking: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    navigationIntegration,
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Configure Google Sign-In once at module load time (before any component mounts)
configureGoogleSignIn();

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const { accessToken, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

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

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  // Navigation guard — runs whenever auth state or active route changes
  useEffect(() => {
    // Wait until fonts are ready AND the Zustand store has rehydrated from
    // AsyncStorage, so we never redirect based on a stale null token.
    if (!fontsLoaded || !_hasHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inModalRoute = ['create-routine', 'workout-log', 'add-exercise', 'workout-detail', 'modal'].includes(segments[0] ?? '');
    const isValidRoute = inAuthGroup || inTabsGroup || inModalRoute;

    if (accessToken) {
      // User is authenticated
      if (inAuthGroup) {
        // Authenticated user landed on an auth screen → push to main app
        router.replace('/(tabs)/home');
      } else if (!isValidRoute) {
        // Router state is invalid (app restart) → reset to home
        router.replace('/(tabs)/home');
      }
    } else {
      // User is not authenticated
      if (inTabsGroup) {
        // Unauthenticated user tried to access the app → push to onboarding
        router.replace('/(auth)/onboarding');
      } else if (!isValidRoute) {
        // Router state is invalid → reset to onboarding
        router.replace('/(auth)/onboarding');
      }
    }
  }, [accessToken, _hasHydrated, fontsLoaded, segments]);

  // Keep the splash screen visible until both fonts and store are ready
  if (!fontsLoaded || !_hasHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <Stack ref={navigationRef}>
          {/* Auth flow: Stack header hidden, inner (auth)/_layout.tsx takes over */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/* Main app: header hidden, inner (tabs)/_layout.tsx takes over */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Global modal accessible from any screen */}
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          {/* Workout log / session screen — full-screen modal */}
          <Stack.Screen name="workout-log" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          {/* Workout detail screen */}
          <Stack.Screen name="workout-detail" options={{ headerShown: false }} />
          {/* Add exercise picker — full-screen modal */}
          <Stack.Screen name="add-exercise" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          {/* Create routine screen */}
          <Stack.Screen name="create-routine" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
});
