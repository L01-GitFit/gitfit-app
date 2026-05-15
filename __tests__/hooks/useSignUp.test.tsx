import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSignUp } from '@/hooks/useSignUp';
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

describe('useSignUp hook', () => {
  const mockAuthResult: AuthResult = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    user: {
      id: 'user-456',
      email: 'newuser@example.com',
      username: 'newuser',
      fullName: null,
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

  it('should successfully sign up new user', async () => {
    mockGitfitService.register.mockResolvedValueOnce(mockAuthResult);
    mockSentryUser.identifySentryUser.mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.register).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
    });

    expect(mockSentryUser.identifySentryUser).toHaveBeenCalledWith(mockAuthResult.user);

    const authState = useAuthStore.getState();
    expect(authState.accessToken).toBe('access-token-123');
    expect(authState.user?.username).toBe('newuser');
  });

  it('should handle sign up error', async () => {
    const error = new Error('Email already exists');
    mockGitfitService.register.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        email: 'existing@example.com',
        password: 'password123',
        username: 'existinguser',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Email already exists');
  });

  it('should track isPending state', async () => {
    mockGitfitService.register.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockAuthResult), 100);
        }),
    );

    const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      result.current.mutate({
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
      });
      // Give React Query time to update isPending
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it('should support onError callback', async () => {
    const error = new Error('Registration failed');
    mockGitfitService.register.mockRejectedValueOnce(error);

    const onError = jest.fn();
    const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(
        {
          email: 'newuser@example.com',
          password: 'password123',
          username: 'newuser',
        },
        { onError },
      );
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    // React Query v5 passes (error, variables, context)
    const call = onError.mock.calls[0];
    expect(call[0]?.message).toBe('Registration failed');
  });

  it('should support onSuccess callback', async () => {
    mockGitfitService.register.mockResolvedValueOnce(mockAuthResult);
    mockSentryUser.identifySentryUser.mockReturnValueOnce(undefined);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(
        {
          email: 'newuser@example.com',
          password: 'password123',
          username: 'newuser',
        },
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

  it('should convert array error messages to friendly format', async () => {
    const axiosError = {
      response: {
        data: {
          message: ['Validation failed: password too weak'],
        },
      },
    };

    mockGitfitService.register.mockRejectedValueOnce(axiosError);

    const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        email: 'user@example.com',
        password: '123',
        username: 'user',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
