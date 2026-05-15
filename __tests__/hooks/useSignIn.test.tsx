import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSignIn } from '@/hooks/useSignIn';
import gitfitService from '@/services/gitfit.service';
import { useAuthStore } from '@/store/authStore';
import * as sentryUser from '@/utils/sentryUser';
import type { AuthResult } from '@/services/gitfit.service';
import React from 'react';

jest.mock('@/services/gitfit.service');
jest.mock('@/utils/sentryUser');

const mockGitfitService = gitfitService as jest.Mocked<typeof gitfitService>;
const mockSentryUser = sentryUser as jest.Mocked<typeof sentryUser>;

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSignIn hook', () => {
  const mockAuthResult: AuthResult = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      fullName: 'Test User',
      avatarUrl: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,
    });
  });

  it('should successfully sign in user', async () => {
    mockGitfitService.login.mockResolvedValueOnce(mockAuthResult);
    mockSentryUser.identifySentryUser.mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useSignIn(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'password123' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockSentryUser.identifySentryUser).toHaveBeenCalledWith(mockAuthResult.user);

    const authState = useAuthStore.getState();
    expect(authState.accessToken).toBe('access-token-123');
    expect(authState.user?.email).toBe('test@example.com');
  });

  it('should handle sign in error', async () => {
    const error = new Error('Invalid credentials');
    mockGitfitService.login.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useSignIn(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'wrongpassword' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Invalid credentials');
  });

  it('should track isPending state', async () => {
    mockGitfitService.login.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockAuthResult), 100);
        }),
    );

    const { result } = renderHook(() => useSignIn(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'password123' });
      // Give React Query time to update isPending
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it('should support onError callback', async () => {
    const error = new Error('Sign in failed');
    mockGitfitService.login.mockRejectedValueOnce(error);

    const onError = jest.fn();
    const { result } = renderHook(() => useSignIn(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(
        { email: 'test@example.com', password: 'password123' },
        { onError },
      );
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    // React Query v5 passes (error, variables, context)
    const call = onError.mock.calls[0];
    expect(call[0]?.message).toBe('Sign in failed');
  });

  it('should support onSuccess callback', async () => {
    mockGitfitService.login.mockResolvedValueOnce(mockAuthResult);
    mockSentryUser.identifySentryUser.mockReturnValueOnce(undefined);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useSignIn(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(
        { email: 'test@example.com', password: 'password123' },
        { onSuccess },
      );
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    // React Query v5 passes (data, variables, context)
    const call = onSuccess.mock.calls[0];
    expect(call[0]).toEqual(mockAuthResult);
  });

  it('should convert friendly error messages', async () => {
    const axiosError = {
      response: {
        data: {
          message: 'User not found',
        },
      },
    };

    mockGitfitService.login.mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useSignIn(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'nonexistent@example.com', password: 'password' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
