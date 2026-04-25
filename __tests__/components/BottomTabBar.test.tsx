import { fireEvent, render } from '@testing-library/react-native';

import BottomTabBar from '@/components/BottomTabBar';

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Build a minimal BottomTabBarProps-compatible object so we can control
 * which tab is "focused" and spy on navigation calls.
 */
function makeProps(focusedIndex = 0) {
  const routes = [
    { key: 'home-key', name: 'index' },
    { key: 'workout-key', name: 'two' },
    { key: 'profile-key', name: 'profile' },
  ];

  const descriptors: Record<string, any> = {};
  routes.forEach((r) => {
    descriptors[r.key] = {
      options: { tabBarAccessibilityLabel: r.name },
    };
  });

  const navigation = {
    emit: jest.fn().mockReturnValue({ defaultPrevented: false }),
    navigate: jest.fn(),
  };

  const state = {
    index: focusedIndex,
    routes,
  } as any;

  return { state, descriptors, navigation };
}

// ── Mock MaterialIcons so the SVG/font icon doesn't blow up in Jest ────────
jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

// ───────────────────────────────────────────────────────────────────────────

describe('BottomTabBar', () => {
  // ── Test 1: renders without crashing ─────────────────────────────────────
  it('does not crash on initial render', () => {
    const props = makeProps();
    expect(() => render(<BottomTabBar {...props} />)).not.toThrow();
  });

  // ── Test 2: renders all three tab labels ─────────────────────────────────
  it('renders HOME, WORKOUT, and PROFILE labels', () => {
    const { getByText } = render(<BottomTabBar {...makeProps()} />);
    expect(getByText('HOME')).toBeTruthy();
    expect(getByText('WORKOUT')).toBeTruthy();
    expect(getByText('PROFILE')).toBeTruthy();
  });

  // ── Test 3: focused tab has selected accessibilityState ──────────────────
  it('marks the focused tab with accessibilityState selected=true', () => {
    const { getByRole } = render(<BottomTabBar {...makeProps(0)} />);
    const homeTab = getByRole('button', { name: 'index' });
    // React Native Testing Library exposes accessibilityState via props
    expect(homeTab.props.accessibilityState).toEqual({ selected: true });
  });

  // ── Test 4: pressing an unfocused tab calls navigation.navigate ──────────
  it('calls navigation.navigate when an unfocused tab is pressed', () => {
    const props = makeProps(0); // "home" is focused (index 0)
    const { getByText } = render(<BottomTabBar {...props} />);

    fireEvent.press(getByText('WORKOUT'));

    expect(props.navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress' }),
    );
    expect(props.navigation.navigate).toHaveBeenCalledWith('two');
  });

  // ── Test 5: pressing the already-focused tab does NOT call navigate ───────
  it('does NOT call navigation.navigate when the focused tab is pressed', () => {
    const props = makeProps(0); // "home" already focused
    const { getByText } = render(<BottomTabBar {...props} />);

    fireEvent.press(getByText('HOME'));

    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  // ── Test 6: re-renders without crashing ──────────────────────────────────
  it('re-renders without crashing when focus changes', () => {
    const props = makeProps(0);
    const { rerender } = render(<BottomTabBar {...props} />);
    const newProps = makeProps(2);
    expect(() => rerender(<BottomTabBar {...newProps} />)).not.toThrow();
  });
});
