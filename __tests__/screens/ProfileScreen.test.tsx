import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ProfileScreen from '@/app/(tabs)/profile';

// Profile screen uses SafeAreaView from react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockClearAuth = jest.fn();
jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) => selector({ clearAuth: mockClearAuth }),
}));

beforeEach(() => {
  mockReplace.mockClear();
  mockClearAuth.mockClear();
});

describe('Profile screen', () => {
  // ── Test 1: renders without crashing ─────────────────────────────────────
  it('does not crash on initial render', () => {
    expect(() => render(<ProfileScreen />)).not.toThrow();
  });

  // ── Test 2: renders the "Profile" heading ────────────────────────────────
  it('renders the "Profile" heading', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Profile')).toBeTruthy();
  });

  // ── Test 3: renders form field labels ────────────────────────────────────
  it('renders the Name and Bio field labels', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Bio')).toBeTruthy();
  });

  // ── Test 4: renders private data section and placeholder values ──────────
  it('renders Sex and Birthday fields with placeholder values', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Sex')).toBeTruthy();
    expect(getByText('Male')).toBeTruthy();
    expect(getByText('Birthday')).toBeTruthy();
    expect(getByText('Jan 01, 2004')).toBeTruthy();
  });

  // ── Test 5: "Change profile photo" button is pressable without crashing ──
  it('"Change profile photo" button press does not crash', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(() => fireEvent.press(getByText('Change profile photo'))).not.toThrow();
  });

  // ── Test 6: re-renders without crashing ──────────────────────────────────
  it('re-renders without crashing', () => {
    const { rerender } = render(<ProfileScreen />);
    expect(() => rerender(<ProfileScreen />)).not.toThrow();
  });

  // ── Logout button ─────────────────────────────────────────────────────────
  it('renders the "Log out" button', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('Log out')).toBeTruthy();
  });

  it('pressing "Log out" shows a confirmation Alert', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText('Log out'));
    expect(alertSpy).toHaveBeenCalledWith('Log out', expect.any(String), expect.any(Array));
    alertSpy.mockRestore();
  });

  it('confirming logout calls clearAuth and navigates to onboarding', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const confirm = (buttons as any[]).find((b) => b.style === 'destructive');
      confirm?.onPress();
    });
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText('Log out'));
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/onboarding');
    alertSpy.mockRestore();
  });

  it('cancelling logout does NOT call clearAuth', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const cancel = (buttons as any[]).find((b) => b.style === 'cancel');
      cancel?.onPress?.();
    });
    const { getByText } = render(<ProfileScreen />);
    fireEvent.press(getByText('Log out'));
    expect(mockClearAuth).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
