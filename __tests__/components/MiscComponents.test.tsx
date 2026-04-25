/**
 * __tests__/components/MiscComponents.test.tsx
 *
 * Tests for:
 *   - components/HeaderButton.tsx   (0% coverage)
 *   - components/TabBarIcon.tsx     (0% coverage)
 */

import { fireEvent, render } from '@testing-library/react-native';

// Mock FontAwesome icons so the native font doesn't need to load
jest.mock('@expo/vector-icons/FontAwesome', () => {
  const { Text } = require('react-native');
  return ({ name, ...props }: { name: string; [key: string]: any }) => (
    <Text {...props}>{name}</Text>
  );
});

import { HeaderButton } from '@/components/HeaderButton';
import { TabBarIcon } from '@/components/TabBarIcon';

// =============================================================================
// HeaderButton
// =============================================================================
describe('HeaderButton component', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<HeaderButton />)).not.toThrow();
  });

  it('renders the "info-circle" icon name', () => {
    const { getByText } = render(<HeaderButton />);
    expect(getByText('info-circle')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<HeaderButton onPress={onPress} />);
    fireEvent.press(getByText('info-circle'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without onPress prop (no crash)', () => {
    expect(() => render(<HeaderButton />)).not.toThrow();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<HeaderButton />);
    expect(() => rerender(<HeaderButton />)).not.toThrow();
  });
});

// =============================================================================
// TabBarIcon
// =============================================================================
describe('TabBarIcon component', () => {
  it('does not crash on initial render', () => {
    expect(() => render(<TabBarIcon name="home" color="#fff" />)).not.toThrow();
  });

  it('renders the correct icon name', () => {
    const { getByText } = render(<TabBarIcon name="home" color="#fff" />);
    expect(getByText('home')).toBeTruthy();
  });

  it('renders different icon names without crashing', () => {
    const { getByText } = render(<TabBarIcon name="star" color="#ee9033" />);
    expect(getByText('star')).toBeTruthy();
  });

  it('re-renders without crashing', () => {
    const { rerender } = render(<TabBarIcon name="home" color="#fff" />);
    expect(() => rerender(<TabBarIcon name="cog" color="#aaa" />)).not.toThrow();
  });
});
