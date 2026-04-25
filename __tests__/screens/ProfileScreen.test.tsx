import { fireEvent, render } from '@testing-library/react-native';

import ProfileScreen from '@/app/(tabs)/profile';

// Profile screen uses SafeAreaView from react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
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
});
