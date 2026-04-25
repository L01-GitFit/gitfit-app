/**
 * __tests__/screens/TabScreens.test.tsx
 *
 * Tests for app/(tabs)/on2.tsx and app/(tabs)/on3.tsx
 * Both are onboarding-variant screens with same structure as onboarding1-3
 * but live under (tabs)/ route and use remote image URIs instead of local assets.
 */

import { fireEvent, render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    useRouter: () => ({ push: mockPush }),
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

import On2Screen from '@/app/(tabs)/on2';
import On3Screen from '@/app/(tabs)/on3';

beforeEach(() => {
  mockPush.mockClear();
});

// =============================================================================
// app/(tabs)/on2.tsx
// =============================================================================
describe('Tab on2 screen (app/(tabs)/on2.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<On2Screen />)).not.toThrow();
  });

  it('renders the "GitFit" logo text', () => {
    const { getByText } = render(<On2Screen />);
    expect(getByText('GitFit')).toBeTruthy();
  });

  it('renders the description text', () => {
    const { getByText } = render(<On2Screen />);
    expect(getByText('Track your progress with detailed analytics.')).toBeTruthy();
  });

  it('renders the status bar time "9:41"', () => {
    const { getByText } = render(<On2Screen />);
    expect(getByText('9:41')).toBeTruthy();
  });

  it('renders both sign-up buttons', () => {
    const { getByText } = render(<On2Screen />);
    expect(getByText('Sign up with Google')).toBeTruthy();
    expect(getByText('Sign up with Email')).toBeTruthy();
  });

  it('renders the "Log in" link', () => {
    const { getByText } = render(<On2Screen />);
    expect(getByText('Log in')).toBeTruthy();
  });

  it('pressing dot 1 calls router.push("/onboarding")', () => {
    const { UNSAFE_getAllByType } = render(<On2Screen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('pressing dot 2 calls router.push("/onboarding2")', () => {
    const { UNSAFE_getAllByType } = render(<On2Screen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[1]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding2');
  });

  it('pressing dot 3 calls router.push("/onboarding3")', () => {
    const { UNSAFE_getAllByType } = render(<On2Screen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[2]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding3');
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<On2Screen />);
    expect(() => rerender(<On2Screen />)).not.toThrow();
  });
});

// =============================================================================
// app/(tabs)/on3.tsx
// =============================================================================
describe('Tab on3 screen (app/(tabs)/on3.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<On3Screen />)).not.toThrow();
  });

  it('renders the "GitFit" logo text', () => {
    const { getByText } = render(<On3Screen />);
    expect(getByText('GitFit')).toBeTruthy();
  });

  it('renders the description text', () => {
    const { getByText } = render(<On3Screen />);
    expect(getByText('Achieve your fitness goals with personalized plans.')).toBeTruthy();
  });

  it('renders the status bar time "9:41"', () => {
    const { getByText } = render(<On3Screen />);
    expect(getByText('9:41')).toBeTruthy();
  });

  it('renders both sign-up buttons', () => {
    const { getByText } = render(<On3Screen />);
    expect(getByText('Sign up with Google')).toBeTruthy();
    expect(getByText('Sign up with Email')).toBeTruthy();
  });

  it('renders the "Log in" link', () => {
    const { getByText } = render(<On3Screen />);
    expect(getByText('Log in')).toBeTruthy();
  });

  it('pressing dot 1 calls router.push("/onboarding")', () => {
    const { UNSAFE_getAllByType } = render(<On3Screen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('pressing dot 3 calls router.push("/onboarding3")', () => {
    const { UNSAFE_getAllByType } = render(<On3Screen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[2]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding3');
  });

  it('"Sign up with Google" press does not crash', () => {
    const { getByText } = render(<On3Screen />);
    expect(() => fireEvent.press(getByText('Sign up with Google'))).not.toThrow();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<On3Screen />);
    expect(() => rerender(<On3Screen />)).not.toThrow();
  });
});
