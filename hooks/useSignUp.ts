import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import gitfitService, { type RegisterPayload } from '@/services/gitfit.service';
import { useAuthStore } from '@/store/authStore';
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

  return new Error('Sign-up failed. Please try again.');
}

export function useSignUp() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      try {
        return await gitfitService.register(payload);
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
