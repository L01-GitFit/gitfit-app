/**
 * __tests__/screens/OnboardingScreens.test.tsx
 *
 * Tests for the three onboarding screens (onboarding.tsx, onboarding2.tsx, onboarding3.tsx).
 *
 * Shared mocks
 * ─────────────────────────────────────────────────────────────────────────────
 * - expo-router: Link wraps children in a plain View; useRouter returns spies
 * - react-native-safe-area-context: useSafeAreaInsets returns zero insets
 *
 * NOTE: TouchableOpacity without an explicit `accessibilityRole` is NOT found
 * by getAllByRole('button') in RNTL. We use UNSAFE_getAllByType(TouchableOpacity)
 * to query indicator dots, and text-based queries for the sign-up buttons.
 */

import { fireEvent, render } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';

// Shared router spy
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
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

// Import screens AFTER mocks are declared
import Onboarding1 from '@/app/onboarding';
import Onboarding2 from '@/app/onboarding2';
import Onboarding3 from '@/app/onboarding3';

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
});

// =============================================================================
// ONBOARDING SCREEN 1
// =============================================================================
describe('Onboarding screen 1 (onboarding.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<Onboarding1 />)).not.toThrow();
  });

  it('renders the "GitFit" logo text', () => {
    const { getByText } = render(<Onboarding1 />);
    expect(getByText('GitFit')).toBeTruthy();
  });

  it('renders the description text', () => {
    const { getByText } = render(<Onboarding1 />);
    expect(getByText('Log your workouts easily, all in one place.')).toBeTruthy();
  });

  it('renders "Sign up with Google" and "Sign up with Email" buttons', () => {
    const { getByText } = render(<Onboarding1 />);
    expect(getByText('Sign up with Google')).toBeTruthy();
    expect(getByText('Sign up with Email')).toBeTruthy();
  });

  it('renders the "Log in" link and helper text', () => {
    const { getByText } = render(<Onboarding1 />);
    expect(getByText('Log in')).toBeTruthy();
    expect(getByText('Already have an account? ')).toBeTruthy();
  });

  it('renders at least 3 page-indicator touchables (dots)', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding1 />);
    // 3 indicator dots + 2 sign-up TouchableOpacity = >= 3
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(touchables.length).toBeGreaterThanOrEqual(3);
  });

  it('pressing dot 1 calls router.push("/onboarding")', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding1 />);
    // PageIndicator is rendered before sign-up buttons -> dots are indices 0,1,2
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('pressing dot 2 calls router.push("/onboarding2")', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding1 />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[1]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding2');
  });

  it('pressing dot 3 calls router.push("/onboarding3")', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding1 />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[2]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding3');
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<Onboarding1 />);
    expect(() => rerender(<Onboarding1 />)).not.toThrow();
  });
});

// =============================================================================
// ONBOARDING SCREEN 2
// =============================================================================
describe('Onboarding screen 2 (onboarding2.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<Onboarding2 />)).not.toThrow();
  });

  it('renders the "GitFit" logo text', () => {
    const { getByText } = render(<Onboarding2 />);
    expect(getByText('GitFit')).toBeTruthy();
  });

  it('renders the description text', () => {
    const { getByText } = render(<Onboarding2 />);
    expect(getByText('Log your workouts easily, all in one place.')).toBeTruthy();
  });

  it('renders both sign-up buttons', () => {
    const { getByText } = render(<Onboarding2 />);
    expect(getByText('Sign up with Google')).toBeTruthy();
    expect(getByText('Sign up with Email')).toBeTruthy();
  });

  it('renders the "Log in" link', () => {
    const { getByText } = render(<Onboarding2 />);
    expect(getByText('Log in')).toBeTruthy();
  });

  it('pressing dot 1 calls router.push("/onboarding")', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding2 />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('pressing dot 3 calls router.push("/onboarding3")', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding2 />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[2]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding3');
  });

  it('"Sign up with Email" button press does not crash', () => {
    const { getByText } = render(<Onboarding2 />);
    expect(() => fireEvent.press(getByText('Sign up with Email'))).not.toThrow();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<Onboarding2 />);
    expect(() => rerender(<Onboarding2 />)).not.toThrow();
  });
});

// =============================================================================
// ONBOARDING SCREEN 3
// =============================================================================
describe('Onboarding screen 3 (onboarding3.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<Onboarding3 />)).not.toThrow();
  });

  it('renders the "GitFit" logo text', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(getByText('GitFit')).toBeTruthy();
  });

  it('renders the description text', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(getByText('Log your workouts easily, all in one place.')).toBeTruthy();
  });

  it('renders both sign-up buttons', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(getByText('Sign up with Google')).toBeTruthy();
    expect(getByText('Sign up with Email')).toBeTruthy();
  });

  it('renders the "Log in" link', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(getByText('Log in')).toBeTruthy();
  });

  it('pressing dot 1 navigates to "/onboarding"', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding3 />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  it('pressing dot 2 navigates to "/onboarding2"', () => {
    const { UNSAFE_getAllByType } = render(<Onboarding3 />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[1]);
    expect(mockPush).toHaveBeenCalledWith('/onboarding2');
  });

  it('"Sign up with Google" button press does not crash', () => {
    const { getByText } = render(<Onboarding3 />);
    expect(() => fireEvent.press(getByText('Sign up with Google'))).not.toThrow();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<Onboarding3 />);
    expect(() => rerender(<Onboarding3 />)).not.toThrow();
  });
});
