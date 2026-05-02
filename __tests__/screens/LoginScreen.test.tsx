/**
 * __tests__/screens/LoginScreen.test.tsx
 *
 * Tests for app/(auth)/login.tsx
 *
 * The screen is tested in isolation by mocking useGoogleLogin entirely.
 * This verifies:
 *   - Correct UI rendering (title, subtitle, button)
 *   - Button triggers the mutate function with correct arguments
 *   - Loading state: ActivityIndicator shown, button text hidden, button disabled
 *   - Error callbacks invoke Alert.alert with the right messages
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert, ActivityIndicator } from 'react-native';

// ── Hook mock ─────────────────────────────────────────────────────────────────
// Using module-level variables so individual tests can override isPending.
let mockIsPending = false;
const mockMutate = jest.fn();

jest.mock('@/hooks/useGoogleLogin', () => ({
  useGoogleLogin: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

// Import AFTER mocks are declared (Jest hoists jest.mock automatically)
import LoginScreen from '@/app/(auth)/login';

// ── Suite ─────────────────────────────────────────────────────────────────────
describe('LoginScreen (app/(auth)/login.tsx)', () => {
  beforeEach(() => {
    mockIsPending = false;
    mockMutate.mockClear();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('does not crash on initial render', () => {
    expect(() => render(<LoginScreen />)).not.toThrow();
  });

  it('renders the "Welcome to GitFit" title', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Welcome to GitFit')).toBeTruthy();
  });

  it('renders the subtitle text', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign in to start your fitness journey.')).toBeTruthy();
  });

  it('renders "Continue with Google" button text when not loading', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<LoginScreen />);
    expect(() => rerender(<LoginScreen />)).not.toThrow();
  });

  // ── Button interaction ────────────────────────────────────────────────────

  it('calls signInWithGoogle when the button is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Continue with Google'));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('shows Alert.alert with the error message when onError is invoked', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Continue with Google'));

    // Extract and invoke the onError callback that the component passed to mutate
    const [, options] = mockMutate.mock.calls[0] as [unknown, { onError: (e: Error) => void }];
    options.onError(new Error('Google error'));

    expect(alertSpy).toHaveBeenCalledWith('Sign-in failed', 'Google error');
    alertSpy.mockRestore();
  });

  it('shows fallback Alert message when the error has no message', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Continue with Google'));

    const [, options] = mockMutate.mock.calls[0] as [unknown, { onError: (e: unknown) => void }];
    options.onError({}); // no .message property

    expect(alertSpy).toHaveBeenCalledWith('Sign-in failed', 'An unexpected error occurred.');
    alertSpy.mockRestore();
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows ActivityIndicator and hides button text when isPending is true', () => {
    mockIsPending = true;
    const { queryByText, UNSAFE_getByType } = render(<LoginScreen />);

    expect(queryByText('Continue with Google')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders the button with disabled=true when isPending is true', () => {
    mockIsPending = true;
    const { UNSAFE_getAllByType } = render(<LoginScreen />);
    const { TouchableOpacity } = require('react-native');

    // The Google button is the only TouchableOpacity; it must have disabled={true}
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    expect(buttons[0].props.disabled).toBe(true);
  });
});
