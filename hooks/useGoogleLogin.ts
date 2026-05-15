import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import gitfitService, { type AuthResult } from '@/services/gitfit.service';
import { useAuthStore } from '../store/authStore';
import { identifySentryUser } from '@/utils/sentryUser';

function toFriendlyError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return new Error(message);
    }
    if (Array.isArray(message) && message.length > 0) {
      return new Error(String(message[0]));
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Test account sign-in failed. Please try again.');
}

export function configureGoogleSignIn(): void {
  // Kept for backward compatibility with app/_layout.tsx.
}

/**
 * Keeps the existing Google-login call sites working, but signs in with the
 * seeded test account configured in env so the app can run on Expo Go.
 *
 * Usage:
 *   const { mutate: signInWithGoogle, isPending, error } = useGoogleLogin();
 */
export function useGoogleLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResult, Error, void>({
    mutationFn: async () => {
      const email = process.env.EXPO_PUBLIC_TEST_EMAIL?.trim();
      const password = process.env.EXPO_PUBLIC_TEST_PASSWORD?.trim();

      if (!email || !password) {
        throw new Error('Test account credentials are not configured.');
      }

      try {
        return await gitfitService.login({ email, password });
      } catch (error) {
        throw toFriendlyError(error);
      }
    },

    onSuccess: (data) => {
      identifySentryUser(data.user);
      setAuth(data);
    },
  });
}
