/**
 * __tests__/hooks/useGoogleLogin.test.tsx
 *
 * Tests for hooks/useGoogleLogin.ts
 *
 * Covers:
 *   - configureGoogleSignIn calls GoogleSignin.configure with correct options
 *   - useGoogleLogin: initial state (isPending=false)
 *   - Successful flow: signIn → idToken → POST /auth/google → setAuth called
 *   - Correct endpoint and payload sent to apiClient
 *   - Error: missing idToken throws before calling the API
 *   - Error: hasPlayServices rejection stops flow before setAuth
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────────────
// IMPORTANT: jest.fn() must be placed INLINE inside the factory (not in module-level
// variables) for modules that are eagerly required during import. Module-level
// `const mock* = jest.fn()` variables are only hoisted as `var` declarations;
// their assignments run AFTER require() calls, so the factory would capture `undefined`.
// Closures (like the useAuthStore factory below) are fine because they evaluate
// `mockSetAuth` lazily at call time, not at factory-creation time.

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
  isErrorWithCode: jest.fn((err: any, code: string) => err?.code === code),
}));

jest.mock('@/utils/apiClient', () => ({
  apiClient: { post: jest.fn() },
}));

// Safe to use a module-level variable here because `useAuthStore` is a closure:
// `mockSetAuth` is evaluated when useAuthStore() is *called* (lazily), not when
// the factory object is built.
const mockSetAuth = jest.fn();
jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: any) => any) =>
    selector({ setAuth: mockSetAuth }),
}));

// Import AFTER mocks
import { configureGoogleSignIn, useGoogleLogin } from '@/hooks/useGoogleLogin';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { apiClient } from '@/utils/apiClient';

// ── Helpers ───────────────────────────────────────────────────────────────────

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

const MOCK_USER = {
  id: 'u1',
  email: 'test@example.com',
  username: 'testuser',
  fullName: 'Test User',
  avatarUrl: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.mocked(GoogleSignin.configure).mockClear();
  jest.mocked(GoogleSignin.hasPlayServices).mockReset().mockResolvedValue(true);
  jest.mocked(GoogleSignin.signIn).mockReset();
  jest.mocked(apiClient.post).mockReset();
  mockSetAuth.mockClear();
});

// ── configureGoogleSignIn ──────────────────────────────────────────────────────
describe('configureGoogleSignIn', () => {
  it('calls GoogleSignin.configure exactly once', () => {
    configureGoogleSignIn();
    expect(jest.mocked(GoogleSignin.configure)).toHaveBeenCalledTimes(1);
  });

  it('passes a webClientId option (key must be present)', () => {
    configureGoogleSignIn();
    const [calledWith] = jest.mocked(GoogleSignin.configure).mock.calls[0];
    expect(calledWith).toHaveProperty('webClientId');
  });

  it('sets offlineAccess to false', () => {
    configureGoogleSignIn();
    expect(jest.mocked(GoogleSignin.configure)).toHaveBeenCalledWith(
      expect.objectContaining({ offlineAccess: false }),
    );
  });
});

// ── useGoogleLogin hook ────────────────────────────────────────────────────────
describe('useGoogleLogin', () => {
  it('returns a mutate function and isPending=false initially', () => {
    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.mutate).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('calls setAuth with the full response on a successful sign-in', async () => {
    const fakeResponse = { accessToken: 'at-1', refreshToken: 'rt-1', user: MOCK_USER };
    jest.mocked(GoogleSignin.signIn).mockResolvedValueOnce({ data: { idToken: 'google-id-token' } } as any);
    jest.mocked(apiClient.post).mockResolvedValueOnce({ data: fakeResponse });

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockSetAuth).toHaveBeenCalledTimes(1);
    expect(mockSetAuth).toHaveBeenCalledWith(fakeResponse);
  });

  it('POSTs to /auth/google with the idToken from GoogleSignin', async () => {
    const idToken = 'google-token-xyz';
    jest.mocked(GoogleSignin.signIn).mockResolvedValueOnce({ data: { idToken } } as any);
    jest.mocked(apiClient.post).mockResolvedValueOnce({
      data: { accessToken: 'at', refreshToken: 'rt', user: MOCK_USER },
    });

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(jest.mocked(apiClient.post)).toHaveBeenCalledWith('/auth/google', { idToken });
  });

  it('throws and does not call the API when signIn returns no idToken', async () => {
    jest.mocked(GoogleSignin.signIn).mockResolvedValueOnce({ data: {} } as any); // no idToken field

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    let caughtError: Error | null = null;
    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch (err) {
        caughtError = err as Error;
      }
    });

    expect(caughtError).not.toBeNull();
    expect(caughtError!.message).toBe('Google Sign-In did not return an idToken');
    expect(jest.mocked(apiClient.post)).not.toHaveBeenCalled();
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('does not call setAuth when hasPlayServices rejects', async () => {
    jest.mocked(GoogleSignin.hasPlayServices).mockRejectedValueOnce(new Error('Play Services unavailable'));

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch {
        // expected
      }
    });

    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(jest.mocked(apiClient.post)).not.toHaveBeenCalled();
  });

  it('does not call setAuth when the backend POST fails', async () => {
    jest.mocked(GoogleSignin.signIn).mockResolvedValueOnce({ data: { idToken: 'tok' } } as any);
    jest.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync();
      } catch {
        // expected
      }
    });

    expect(mockSetAuth).not.toHaveBeenCalled();
  });
});
