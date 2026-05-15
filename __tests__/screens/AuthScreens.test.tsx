import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';

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

jest.mock('@/components/ApiErrorDialog', () => {
  const { Text } = require('react-native');

  return ({ visible, message, onClose }: any) => {
    if (!visible) {
      return null;
    }

    return (
      <Text testID="api-error-dialog" onPress={onClose}>
        {message}
      </Text>
    );
  };
});

const mockGoogleMutate = jest.fn();
const mockSignInMutate = jest.fn();
const mockSignUpMutate = jest.fn();
let mockGooglePending = false;
let mockSignInPending = false;
let mockSignUpPending = false;

jest.mock('@/hooks/useGoogleLogin', () => ({
  useGoogleLogin: () => ({ mutate: mockGoogleMutate, isPending: mockGooglePending }),
}));

jest.mock('@/hooks/useSignIn', () => ({
  useSignIn: () => ({ mutate: mockSignInMutate, isPending: mockSignInPending }),
}));

jest.mock('@/hooks/useSignUp', () => ({
  useSignUp: () => ({ mutate: mockSignUpMutate, isPending: mockSignUpPending }),
}));

import OnboardingScreen from '@/app/(auth)/onboarding';
import { SignInScreen, SignUpScreen, ForgotPasswordScreen } from '@/components/AuthScreens';
import ResetPasswordScreen from '@/app/(auth)/reset-password';

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
  mockGoogleMutate.mockClear();
  mockSignInMutate.mockClear();
  mockSignUpMutate.mockClear();
  mockGooglePending = false;
  mockSignInPending = false;
  mockSignUpPending = false;
});

describe('Auth screens', () => {
  it('renders onboarding actions and routes correctly', () => {
    const { getByText } = render(<OnboardingScreen />);

    fireEvent.press(getByText('Sign up with Google'));
    fireEvent.press(getByText('Sign up with Email'));
    fireEvent.press(getByText('Log in'));

    expect(getByText('GitFit')).toBeTruthy();
    expect(mockGoogleMutate).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/(auth)/signup');
    expect(mockPush).toHaveBeenCalledWith('/(auth)/signin');
  });

  it('validates and submits the sign in form', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    fireEvent.press(getByText('SIGN IN'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Missing information',
      'Please enter both email and password.',
    );

    fireEvent.changeText(getByPlaceholderText('email or username'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('minimum 6 characters'), 'password123');
    fireEvent.press(getByText('SIGN IN'));
    fireEvent.press(getByText('Sign in with Google'));

    expect(mockSignInMutate).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'password123' },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
    expect(mockGoogleMutate).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('shows and closes API error dialog on sign-in error', async () => {
    const fallback = 'Unable to connect to the server. Please check your internet and try again.';
    const { getByPlaceholderText, getByText, getByTestId, queryByTestId } = render(<SignInScreen />);

    fireEvent.changeText(getByPlaceholderText('email or username'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('minimum 6 characters'), 'password123');
    fireEvent.press(getByText('SIGN IN'));

    const signInOptions = mockSignInMutate.mock.calls[0][1];
    await act(async () => {
      signInOptions.onError({ message: 'Network error' });
    });

    const dialog = await waitFor(() => getByTestId('api-error-dialog'));
    expect(dialog.props.children).toBe(fallback);

    fireEvent.press(dialog);
    await waitFor(() => {
      expect(queryByTestId('api-error-dialog')).toBeNull();
    });
  });

  it('shows API error dialog on google sign-in error with fallback text', async () => {
    const { getByText, getByTestId } = render(<SignInScreen />);

    fireEvent.press(getByText('Sign in with Google'));

    const googleOptions = mockGoogleMutate.mock.calls[0][1];
    await act(async () => {
      googleOptions.onError({ message: undefined });
    });

    await waitFor(() => {
      expect(getByTestId('api-error-dialog').props.children).toBe('An unexpected error occurred.');
    });
  });

  it('validates and submits the sign up form', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.press(getByText('SIGN UP'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Missing information',
      'Please enter email, password, and username.',
    );

    fireEvent.changeText(getByPlaceholderText('example@gmail.com'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('minimum 6 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('username'), 'newuser');
    fireEvent.press(getByText('SIGN UP'));
    fireEvent.press(getByText('Sign up with Google'));

    expect(mockSignUpMutate).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'password123',
      username: 'newuser',
    }, expect.objectContaining({ onError: expect.any(Function) }));
    expect(mockGoogleMutate).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('shows API error dialog on sign-up error', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('example@gmail.com'), 'new@test.com');
    fireEvent.changeText(getByPlaceholderText('minimum 6 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('username'), 'newuser');
    fireEvent.press(getByText('SIGN UP'));

    const signUpOptions = mockSignUpMutate.mock.calls[0][1];
    await act(async () => {
      signUpOptions.onError({ message: 'Email already exists' });
    });

    await waitFor(() => {
      expect(getByTestId('api-error-dialog').props.children).toBe('Email already exists');
    });
  });

  it('renders loading indicators for pending states', () => {
    mockSignInPending = true;
    const signIn = render(<SignInScreen />);
    expect(signIn.UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);

    mockSignInPending = false;
    mockGooglePending = true;
    const signUp = render(<SignUpScreen />);
    expect(signUp.UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('handles forgot-password and reset-password flows', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const forgot = render(<ForgotPasswordScreen />);

    expect(forgot.getByText('Forgot Password')).toBeTruthy();
    fireEvent.press(forgot.getByText('SEND PASSWORD RECOVERY'));
    expect(alertSpy).toHaveBeenCalledWith('Missing email', 'Please enter your email first.');

    fireEvent.changeText(forgot.getByPlaceholderText('example@gmail.com'), 'user@test.com');
    fireEvent.press(forgot.getByText('SEND PASSWORD RECOVERY'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/reset-password');
    alertSpy.mockRestore();

    const reset = render(<ResetPasswordScreen />);
    const inputs = reset.UNSAFE_getAllByType(TextInput);

    fireEvent.press(reset.getByText('SUBMIT'));
    fireEvent.changeText(inputs[0], 'secret1');
    fireEvent.changeText(inputs[1], 'secret2');
    fireEvent.press(reset.getByText('SUBMIT'));
    fireEvent.changeText(inputs[1], 'secret1');
    fireEvent.press(reset.getByText('SUBMIT'));

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/signin');
    expect(reset.getByText('Forgot password?')).toBeTruthy();
    expect(reset.UNSAFE_getAllByType(TouchableOpacity).length).toBeGreaterThan(0);
  });
});
