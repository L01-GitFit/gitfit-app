/**
 * __tests__/store/authStore.test.ts
 *
 * Tests for store/authStore.ts
 *
 * The Zustand store is tested directly via getState() / setState().
 * expo-secure-store is mocked to prevent real device-storage calls.
 */

// ── expo-secure-store mock ────────────────────────────────────────────────────
// Must be declared before the store is imported so the persist middleware
// never touches real storage.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import { useAuthStore, AuthUser } from '@/store/authStore';

// ── Fixture ───────────────────────────────────────────────────────────────────
const MOCK_USER: AuthUser = {
  id: 'u1',
  email: 'user@example.com',
  username: 'testuser',
  fullName: 'Test User',
  avatarUrl: null,
};

// Snapshot the default state once (before any test mutates it) for resetting
const defaultState = useAuthStore.getState();

// ── Suite ─────────────────────────────────────────────────────────────────────
describe('useAuthStore', () => {
  // Reset to default state before every test so tests are fully independent
  beforeEach(() => {
    useAuthStore.setState(defaultState, true);
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('starts with null accessToken', () => {
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('starts with null refreshToken', () => {
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('starts with null user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('starts with _hasHydrated = false', () => {
    expect(useAuthStore.getState()._hasHydrated).toBe(false);
  });

  // ── setAuth ────────────────────────────────────────────────────────────────

  it('setAuth stores accessToken, refreshToken, and user together', () => {
    useAuthStore.getState().setAuth({
      accessToken: 'at-abc',
      refreshToken: 'rt-xyz',
      user: MOCK_USER,
    });

    const { accessToken, refreshToken, user } = useAuthStore.getState();
    expect(accessToken).toBe('at-abc');
    expect(refreshToken).toBe('rt-xyz');
    expect(user).toEqual(MOCK_USER);
  });

  it('setAuth overwrites previously stored tokens', () => {
    useAuthStore.getState().setAuth({
      accessToken: 'old-at',
      refreshToken: 'old-rt',
      user: MOCK_USER,
    });
    useAuthStore.getState().setAuth({
      accessToken: 'new-at',
      refreshToken: 'new-rt',
      user: MOCK_USER,
    });

    expect(useAuthStore.getState().accessToken).toBe('new-at');
    expect(useAuthStore.getState().refreshToken).toBe('new-rt');
  });

  // ── clearAuth ──────────────────────────────────────────────────────────────

  it('clearAuth resets accessToken, refreshToken, and user to null', () => {
    useAuthStore.getState().setAuth({
      accessToken: 'at',
      refreshToken: 'rt',
      user: MOCK_USER,
    });

    useAuthStore.getState().clearAuth();

    const { accessToken, refreshToken, user } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(user).toBeNull();
  });

  // ── setTokens ──────────────────────────────────────────────────────────────

  it('setTokens updates only accessToken and refreshToken, leaves user unchanged', () => {
    useAuthStore.getState().setUser(MOCK_USER);
    useAuthStore.getState().setTokens({ accessToken: 'new-at', refreshToken: 'new-rt' });

    const { accessToken, refreshToken, user } = useAuthStore.getState();
    expect(accessToken).toBe('new-at');
    expect(refreshToken).toBe('new-rt');
    expect(user).toEqual(MOCK_USER);
  });

  // ── setUser ────────────────────────────────────────────────────────────────

  it('setUser updates only user, leaves tokens unchanged', () => {
    useAuthStore.getState().setTokens({ accessToken: 'at', refreshToken: 'rt' });
    useAuthStore.getState().setUser(MOCK_USER);

    const { accessToken, refreshToken, user } = useAuthStore.getState();
    expect(user).toEqual(MOCK_USER);
    expect(accessToken).toBe('at');
    expect(refreshToken).toBe('rt');
  });

  it('setUser(null) clears the user without affecting tokens', () => {
    useAuthStore.getState().setAuth({
      accessToken: 'at',
      refreshToken: 'rt',
      user: MOCK_USER,
    });
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBe('at');
  });

  // ── setHasHydrated ─────────────────────────────────────────────────────────

  it('setHasHydrated(true) sets _hasHydrated to true', () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });

  it('setHasHydrated(false) sets _hasHydrated back to false', () => {
    useAuthStore.getState().setHasHydrated(true);
    useAuthStore.getState().setHasHydrated(false);
    expect(useAuthStore.getState()._hasHydrated).toBe(false);
  });
});
