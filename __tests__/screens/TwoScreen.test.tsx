import { render } from '@testing-library/react-native';

import TwoScreen from '@/app/(tabs)/two';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

describe('Two (Workout) screen', () => {
  // ── Test 1: renders without crashing ─────────────────────────────────────
  it('does not crash on initial render', () => {
    expect(() => render(<TwoScreen />)).not.toThrow();
  });

  // ── Test 2: renders the correct title ────────────────────────────────────
  it('renders "Tab Two" as the screen title', () => {
    const { getByText } = render(<TwoScreen />);
    expect(getByText('Tab Two')).toBeTruthy();
  });

  // ── Test 3: renders the correct file path ────────────────────────────────
  it('renders the file path "app/(tabs)/two.tsx"', () => {
    const { getByText } = render(<TwoScreen />);
    expect(getByText('app/(tabs)/two.tsx')).toBeTruthy();
  });

  // ── Test 4: re-renders without crashing ──────────────────────────────────
  it('re-renders without crashing', () => {
    const { rerender } = render(<TwoScreen />);
    expect(() => rerender(<TwoScreen />)).not.toThrow();
  });
});
