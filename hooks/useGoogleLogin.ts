import { useMutation } from '@tanstack/react-query';
// TODO: @react-native-google-signin/google-signin is a native module — not compatible with Expo Go.
// Re-enable the import below when running on a custom dev build.
// import {
//   GoogleSignin,
//   statusCodes,
//   isErrorWithCode,
// } from '@react-native-google-signin/google-signin';
import { AxiosError } from 'axios';
import { apiClient } from '../utils/apiClient';
import { useAuthStore, AuthUser } from '../store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── One-time SDK configuration ───────────────────────────────────────────────
// Call this once at app startup, e.g. in app/_layout.tsx, before any sign-in.
//
//   import { configureGoogleSignIn } from '@/hooks/useGoogleLogin';
//   configureGoogleSignIn();
//
// IMPORTANT: Replace the value below with your actual Web Client ID from the
// Google Cloud Console (APIs & Services → Credentials → OAuth 2.0 Client IDs).
// The *Web* Client ID is required for backend token verification even in mobile
// flows; it is NOT the Android or iOS client ID.

export function configureGoogleSignIn(): void {
  // TODO: Re-enable when using a custom dev build (native module, not Expo Go compatible)
  // GoogleSignin.configure({
  //   webClientId: process.env.PUBLIC_EXPO_GOOGLE_CLIENT_ID,
  //   // For iOS: set iosClientId only when targeting iOS with a different client ID
  //   // iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  //   offlineAccess: false,
  // });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Provides a `mutate` / `mutateAsync` function that runs the full
 * Google Sign-In flow end-to-end:
 *   1. Opens the native Google Sign-In sheet
 *   2. Sends the resulting idToken to the NestJS backend
 *   3. Persists the returned JWT tokens + user in the Zustand auth store
 *
 * Usage:
 *   const { mutate: signInWithGoogle, isPending, error } = useGoogleLogin();
 */
export function useGoogleLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<GoogleAuthResponse, Error, void>({
    mutationFn: async () => {
      // TODO: Re-enable native Google Sign-In when using a custom dev build.
      // @react-native-google-signin/google-signin is not compatible with Expo Go.
      //
      // // ── Step 1: ensure Google Play Services are available (Android) ─────────
      // await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      //
      // // ── Step 2: open the native Google Sign-In prompt ────────────────────────
      // const signInResult = await GoogleSignin.signIn();
      //
      // // The idToken is inside the nested data object in SDK v13+
      // const idToken = signInResult.data?.idToken;
      //
      // if (!idToken) {
      //   throw new Error('Google Sign-In did not return an idToken');
      // }
      //
      // // ── Step 3: exchange idToken for app JWT tokens via the NestJS backend ───
      // const { data } = await apiClient.post<GoogleAuthResponse>(
      //   '/auth/google',
      //   { idToken },
      // );
      // return data;

      // ── EXPO GO STUB: đăng nhập bằng tài khoản test thay vì Google OAuth ────
      const email = process.env.EXPO_PUBLIC_TEST_EMAIL;
      const password = process.env.EXPO_PUBLIC_TEST_PASSWORD;

      if (!email || !password) {
        throw new Error('EXPO_PUBLIC_TEST_EMAIL / EXPO_PUBLIC_TEST_PASSWORD chưa được set trong .env');
      }

      // ── Bước 1: lấy tokens ────────────────────────────────────────────────
      // TransformInterceptor wrap response thành { success, data } → đọc .data.data
      const { data: loginBody } = await apiClient.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
        '/auth/login',
        { email, password },
      );
      const tokens = loginBody.data;

      // ── Bước 2: lấy user profile bằng accessToken vừa nhận ───────────────
      const { data: meBody } = await apiClient.get<{ success: boolean; data: AuthUser }>('/users/me', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      return { ...tokens, user: meBody.data };
    },

    onSuccess: (data) => {
      // Persist tokens and user profile into the secure Zustand store
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },

    onError: (error) => {
      // TODO: Re-enable Google Sign-In SDK error code handling with a custom dev build.
      // if (isErrorWithCode(error)) {
      //   switch (error.code) {
      //     case statusCodes.SIGN_IN_CANCELLED:
      //       console.log('[GoogleLogin] User cancelled the sign-in flow');
      //       break;
      //     case statusCodes.IN_PROGRESS:
      //       console.warn('[GoogleLogin] Sign-in already in progress');
      //       break;
      //     case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      //       console.error('[GoogleLogin] Google Play Services not available');
      //       break;
      //     default:
      //       console.error('[GoogleLogin] Unexpected SDK error:', error.message);
      //   }
      //   return;
      // }

      if (error instanceof AxiosError) {
        console.error(
          '[GoogleLogin] Backend error:',
          error,
        );
        return;
      }

      console.error('[GoogleLogin] Unknown error:', error);
    },
  });
}
