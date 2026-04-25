/**
 * __tests__/screens/MiscScreens.test.tsx
 *
 * Tests for:
 *   - app/modal.tsx          (0% coverage)
 *   - app/+not-found.tsx     (0% coverage)
 */

import { render } from '@testing-library/react-native';

// expo-router mock: Stack.Screen renders nothing, Link renders children
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    Stack: {
      Screen: () => null,
    },
    Link: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

// expo-status-bar mock
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

import Modal from '@/app/modal';
import NotFound from '@/app/+not-found';

// =============================================================================
// app/modal.tsx
// =============================================================================
describe('Modal screen (app/modal.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<Modal />)).not.toThrow();
  });

  it('renders the "Modal" title text', () => {
    const { getByText } = render(<Modal />);
    expect(getByText('Modal')).toBeTruthy();
  });

  it('renders the file path "app/modal.tsx"', () => {
    const { getByText } = render(<Modal />);
    expect(getByText('app/modal.tsx')).toBeTruthy();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<Modal />);
    expect(() => rerender(<Modal />)).not.toThrow();
  });
});

// =============================================================================
// app/+not-found.tsx
// =============================================================================
describe('NotFound screen (app/+not-found.tsx)', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<NotFound />)).not.toThrow();
  });

  it('renders the "This screen doesn\'t exist." message', () => {
    const { getByText } = render(<NotFound />);
    expect(getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it('renders the "Go to home screen!" link', () => {
    const { getByText } = render(<NotFound />);
    expect(getByText('Go to home screen!')).toBeTruthy();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<NotFound />);
    expect(() => rerender(<NotFound />)).not.toThrow();
  });
});
