/**
 * __tests__/hooks/useGoogleLogin.test.tsx
 *
 * Tests for hooks/useGoogleLogin.ts
 *
 * Covers:
 *   - configureGoogleSignIn remains a safe no-op for backward compatibility
 *   - useGoogleLogin: initial state (isPending=false)
 *   - Successful flow: env test account → login service → setAuth called
 *   - Missing env credentials throws before calling the service
 *   - Backend/login errors are surfaced and do not set auth
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthResult } from '@/services/gitfit.service';

const queryClients: QueryClient[] = [];

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: { login: jest.fn() },
}));

jest.mock('@/utils/sentryUser', () => ({
  identifySentryUser: jest.fn(),
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
import gitfitService from '@/services/gitfit.service';
import { identifySentryUser } from '@/utils/sentryUser';

// ── Helpers ───────────────────────────────────────────────────────────────────

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false, gcTime: Infinity },
      queries: { gcTime: Infinity },
    },
  });
  queryClients.push(client);

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

const MOCK_USER = {
  id: 'u1',
  email: 'test@gmail.com',
  username: 'testuser',
  fullName: 'Test User',
  avatarUrl: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  process.env.EXPO_PUBLIC_TEST_EMAIL = 'test@gmail.com';
  process.env.EXPO_PUBLIC_TEST_PASSWORD = 'test123';
  jest.mocked(gitfitService.login).mockReset();
  jest.mocked(identifySentryUser).mockClear();
  mockSetAuth.mockClear();
});

afterEach(() => {
  while (queryClients.length > 0) {
    queryClients.pop()?.clear();
  }
});

// ── configureGoogleSignIn ──────────────────────────────────────────────────────
describe('configureGoogleSignIn', () => {
  it('does not throw when called from app startup', () => {
    configureGoogleSignIn();
    expect(true).toBe(true);
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
    const fakeResponse: AuthResult = { accessToken: 'at-1', refreshToken: 'rt-1', user: MOCK_USER };
    jest.mocked(gitfitService.login).mockResolvedValueOnce(fakeResponse);

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockSetAuth).toHaveBeenCalledTimes(1);
    expect(mockSetAuth).toHaveBeenCalledWith(fakeResponse);
    expect(jest.mocked(identifySentryUser)).toHaveBeenCalledWith(MOCK_USER);
  });

  it('logs in with the seeded account from env', async () => {
    jest.mocked(gitfitService.login).mockResolvedValueOnce({
      accessToken: 'at',
      refreshToken: 'rt',
      user: MOCK_USER,
    });

    const { result } = renderHook(() => useGoogleLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(jest.mocked(gitfitService.login)).toHaveBeenCalledWith({
      email: 'test@gmail.com',
      password: 'test123',
    });
  });

  it('throws when the seeded credentials are missing', async () => {
    delete process.env.EXPO_PUBLIC_TEST_EMAIL;
    delete process.env.EXPO_PUBLIC_TEST_PASSWORD;

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
    expect(caughtError!.message).toBe('Test account credentials are not configured.');
    expect(jest.mocked(gitfitService.login)).not.toHaveBeenCalled();
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('does not call setAuth when the backend login fails', async () => {
    jest.mocked(gitfitService.login).mockRejectedValueOnce(new Error('Invalid seeded account credentials'));

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
    await waitFor(() => {
      expect(result.current.error?.message).toBe('Invalid seeded account credentials');
    });
  });
});
