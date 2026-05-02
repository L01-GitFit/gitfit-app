import { Stack } from 'expo-router';

/**
 * Auth flow layout.
 * All screens here are presented full-screen with no header.
 * Navigation between onboarding → login/signin is handled by each screen.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
