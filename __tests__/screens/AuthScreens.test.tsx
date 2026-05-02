/**
 * __tests__/screens/AuthScreens.test.tsx
 *
 * Unit tests for the auth screens:
 *   - app/(auth)/onboarding.tsx  (carousel onboarding)
 *   - app/(auth)/signin.tsx
 *   - app/(auth)/signup.tsx
 *   - app/(auth)/forgot-password.tsx
 *   - app/(auth)/reset-password.tsx
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';

// ── Shared router spies ───────────────────────────────────────────────────────
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
    Link: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// ── Onboarding carousel mock (useGoogleLogin) ─────────────────────────────────
let mockIsPending = false;
const mockMutate = jest.fn();

jest.mock('@/hooks/useGoogleLogin', () => ({
  useGoogleLogin: () => ({ mutate: mockMutate, isPending: mockIsPending }),
}));

// ── Screen imports (after mocks) ──────────────────────────────────────────────
import OnboardingScreen from '@/app/(auth)/onboarding';
import SignInScreen from '@/app/(auth)/signin';
import SignUpScreen from '@/app/(auth)/signup';
import ForgotPasswordScreen from '@/app/(auth)/forgot-password';
import ResetPasswordScreen from '@/app/(auth)/reset-password';

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
  mockMutate.mockClear();
  mockIsPending = false;
});

// =============================================================================
// ONBOARDING SCREEN (carousel)
// =============================================================================
describe('OnboardingScreen (app/(auth)/onboarding.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<OnboardingScreen />)).not.toThrow();
  });

  it('renders "GitFit" brand text', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('GitFit')).toBeTruthy();
  });

  it('renders the "Sign up with Google" button when not loading', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Sign up with Google')).toBeTruthy();
  });

  it('pressing "Sign up with Google" calls mutate', () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Sign up with Google'));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('shows ActivityIndicator while isPending is true', () => {
    mockIsPending = true;
    const { UNSAFE_getAllByType } = render(<OnboardingScreen />);
    const { ActivityIndicator } = require('react-native');
    const indicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  });

  it('button is disabled while isPending is true', () => {
    mockIsPending = true;
    const { UNSAFE_getAllByType } = render(<OnboardingScreen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    const googleBtn = touchables.find((t: any) => t.props.disabled === true);
    expect(googleBtn).toBeTruthy();
  });

  it('shows error Alert when onError callback is invoked', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText('Sign up with Google'));

    // mutate is called as signInWithGoogle(undefined, { onError })
    const [, callbackOptions] = mockMutate.mock.calls[0];
    callbackOptions.onError(new Error('auth failed'));

    expect(alertSpy).toHaveBeenCalledWith('Sign-in failed', 'auth failed');
    alertSpy.mockRestore();
  });
});

// =============================================================================
// SIGN IN SCREEN
// =============================================================================
describe('SignInScreen (app/(auth)/signin.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<SignInScreen />)).not.toThrow();
  });

  it('renders "Sign in" header', () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('renders Email/Username and Password labels', () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText('Email or Username')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
  });

  it('renders "SIGN IN" button', () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText('SIGN IN')).toBeTruthy();
  });

  it('renders "Forgot password?" link', () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText('Forgot password?')).toBeTruthy();
  });

  it('renders "Sign in with Google" button', () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('pressing "SIGN IN" calls router.replace with /(tabs)', () => {
    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('SIGN IN'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('pressing "Sign in with Google" calls router.replace with /(tabs)', () => {
    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('Sign in with Google'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('pressing "Forgot password?" navigates to /(auth)/forgot-password', () => {
    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('Forgot password?'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
  });

  it('pressing back button calls router.back()', () => {
    const { UNSAFE_getAllByType } = render(<SignInScreen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('email TextInput updates value on change', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);
    const emailInput = getByPlaceholderText('email or username');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('password TextInput is secureTextEntry', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);
    const passInput = getByPlaceholderText('minimum 6 characters');
    expect(passInput.props.secureTextEntry).toBe(true);
  });
});

// =============================================================================
// SIGN UP SCREEN
// =============================================================================
describe('SignUpScreen (app/(auth)/signup.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<SignUpScreen />)).not.toThrow();
  });

  it('renders "Sign up" header', () => {
    const { getByText } = render(<SignUpScreen />);
    expect(getByText('Sign up')).toBeTruthy();
  });

  it('renders Email, Password and Username labels', () => {
    const { getByText } = render(<SignUpScreen />);
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
  });

  it('renders "SIGN UP" button', () => {
    const { getByText } = render(<SignUpScreen />);
    expect(getByText('SIGN UP')).toBeTruthy();
  });

  it('renders "Sign up with Google" button', () => {
    const { getByText } = render(<SignUpScreen />);
    expect(getByText('Sign up with Google')).toBeTruthy();
  });

  it('pressing "SIGN UP" calls router.replace with /(tabs)', () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('SIGN UP'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('pressing "Sign up with Google" calls router.replace with /(tabs)', () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('Sign up with Google'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('pressing back button calls router.back()', () => {
    const { UNSAFE_getAllByType } = render(<SignUpScreen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('email TextInput updates value on change', () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);
    const emailInput = getByPlaceholderText('example@gmail.com');
    fireEvent.changeText(emailInput, 'user@test.com');
    expect(emailInput.props.value).toBe('user@test.com');
  });

  it('password TextInput is secureTextEntry', () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);
    const passInput = getByPlaceholderText('minimum 6 characters');
    expect(passInput.props.secureTextEntry).toBe(true);
  });

  it('username TextInput updates value on change', () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);
    const usernameInput = getByPlaceholderText('username');
    fireEvent.changeText(usernameInput, 'johndoe');
    expect(usernameInput.props.value).toBe('johndoe');
  });
});

// =============================================================================
// FORGOT PASSWORD SCREEN
// =============================================================================
describe('ForgotPasswordScreen (app/(auth)/forgot-password.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<ForgotPasswordScreen />)).not.toThrow();
  });

  it('renders "Forgot password?" header', () => {
    const { getAllByText } = render(<ForgotPasswordScreen />);
    expect(getAllByText('Forgot password?').length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Email" label', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders "SEND PASSWORD RECOVERY" button', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('SEND PASSWORD RECOVERY')).toBeTruthy();
  });

  it('pressing "SEND PASSWORD RECOVERY" navigates to /(auth)/reset-password', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText('SEND PASSWORD RECOVERY'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/reset-password');
  });

  it('pressing back button calls router.back()', () => {
    const { UNSAFE_getAllByType } = render(<ForgotPasswordScreen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('email TextInput updates value on change', () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    const emailInput = getByPlaceholderText('example@gmail.com');
    fireEvent.changeText(emailInput, 'forgot@example.com');
    expect(emailInput.props.value).toBe('forgot@example.com');
  });
});

// =============================================================================
// RESET PASSWORD SCREEN
// =============================================================================
describe('ResetPasswordScreen (app/(auth)/reset-password.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<ResetPasswordScreen />)).not.toThrow();
  });

  it('renders "Forgot password?" header', () => {
    const { getAllByText } = render(<ResetPasswordScreen />);
    expect(getAllByText('Forgot password?').length).toBeGreaterThanOrEqual(1);
  });

  it('renders "New password" label', () => {
    const { getByText } = render(<ResetPasswordScreen />);
    expect(getByText('New password')).toBeTruthy();
  });

  it('renders "Confirm your new password" label', () => {
    const { getByText } = render(<ResetPasswordScreen />);
    expect(getByText('Confirm your new password')).toBeTruthy();
  });

  it('renders "SUBMIT" button', () => {
    const { getByText } = render(<ResetPasswordScreen />);
    expect(getByText('SUBMIT')).toBeTruthy();
  });

  it('pressing "SUBMIT" calls router.replace with /(auth)/signin', () => {
    const { getByText } = render(<ResetPasswordScreen />);
    fireEvent.press(getByText('SUBMIT'));
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/signin');
  });

  it('pressing back button calls router.back()', () => {
    const { UNSAFE_getAllByType } = render(<ResetPasswordScreen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('new password TextInput is secureTextEntry', () => {
    const { UNSAFE_getAllByType } = render(<ResetPasswordScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    expect(inputs[0].props.secureTextEntry).toBe(true);
  });

  it('confirm password TextInput is secureTextEntry', () => {
    const { UNSAFE_getAllByType } = render(<ResetPasswordScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    expect(inputs[1].props.secureTextEntry).toBe(true);
  });

  it('new password TextInput updates value on change', () => {
    const { UNSAFE_getAllByType } = render(<ResetPasswordScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'newpass123');
    expect(inputs[0].props.value).toBe('newpass123');
  });

  it('confirm password TextInput updates value on change', () => {
    const { UNSAFE_getAllByType } = render(<ResetPasswordScreen />);
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[1], 'newpass123');
    expect(inputs[1].props.value).toBe('newpass123');
  });
});
