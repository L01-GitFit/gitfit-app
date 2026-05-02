import { Stack } from 'expo-router';

/**
 * Auth flow layout.
 * All screens here are presented full-screen with no header.
 * Navigation between onboarding → login is handled by each screen.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
