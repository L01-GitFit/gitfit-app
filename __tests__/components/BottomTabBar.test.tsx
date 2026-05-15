import { fireEvent, render } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockRestore = jest.fn();
const mockResetSession = jest.fn();

let mockWorkoutSessionState: any = {};

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

  const insets = { top: 0, right: 0, bottom: 10, left: 0 };

  return { state, descriptors, navigation, insets };
}

// ── Mock MaterialIcons so the SVG/font icon doesn't blow up in Jest ────────
jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/store/workoutSession.store', () => ({
  useWorkoutSessionStore: (selector: (state: any) => any) => selector(mockWorkoutSessionState),
}));

jest.mock('@/components/workout/FloatingWorkoutBanner', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return ({ workout, onExpand, onDiscard }: any) => (
    <View>
      <Text>{workout.duration}</Text>
      <Text>{workout.exercise}</Text>
      <TouchableOpacity onPress={onExpand}><Text>Expand workout</Text></TouchableOpacity>
      <TouchableOpacity onPress={onDiscard}><Text>Discard workout banner</Text></TouchableOpacity>
    </View>
  );
});

jest.mock('@/components/workout/DiscardWorkoutDialog', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return ({ visible, onConfirm, onCancel }: any) =>
    visible ? (
      <View>
        <TouchableOpacity onPress={onConfirm}><Text>Confirm discard</Text></TouchableOpacity>
        <TouchableOpacity onPress={onCancel}><Text>Cancel discard</Text></TouchableOpacity>
      </View>
    ) : null;
});

// ───────────────────────────────────────────────────────────────────────────

function resetWorkoutSessionState() {
  mockWorkoutSessionState = {
    sessionId: null,
    isMinimized: false,
    startedAt: null,
    exercises: [],
    restore: mockRestore,
    resetSession: mockResetSession,
  };
}

describe('BottomTabBar', () => {
  beforeEach(() => {
    resetWorkoutSessionState();
    mockPush.mockClear();
    mockRestore.mockClear();
    mockResetSession.mockClear();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // ── Test 1: renders without crashing ─────────────────────────────────────
  it('does not crash on initial render', () => {
    const props = makeProps();
    expect(() => render(<BottomTabBar {...(props as any)} />)).not.toThrow();
  });

  // ── Test 2: renders all three tab labels ─────────────────────────────────
  it('renders HOME, WORKOUT, and PROFILE labels', () => {
    const { getByText } = render(<BottomTabBar {...(makeProps() as any)} />);
    expect(getByText('HOME')).toBeTruthy();
    expect(getByText('WORKOUT')).toBeTruthy();
    expect(getByText('PROFILE')).toBeTruthy();
  });

  // ── Test 3: focused tab has selected accessibilityState ──────────────────
  it('marks the focused tab with accessibilityState selected=true', () => {
    const { getByRole } = render(<BottomTabBar {...(makeProps(0) as any)} />);
    const homeTab = getByRole('button', { name: 'index' });
    // React Native Testing Library exposes accessibilityState via props
    expect(homeTab.props.accessibilityState).toEqual({ selected: true });
  });

  // ── Test 4: pressing an unfocused tab calls navigation.navigate ──────────
  it('calls navigation.navigate when an unfocused tab is pressed', () => {
    const props = makeProps(0); // "home" is focused (index 0)
    const { getByText } = render(<BottomTabBar {...(props as any)} />);

    fireEvent.press(getByText('WORKOUT'));

    expect(props.navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress' }),
    );
    expect(props.navigation.navigate).toHaveBeenCalledWith('two');
  });

  // ── Test 5: pressing the already-focused tab does NOT call navigate ───────
  it('does NOT call navigation.navigate when the focused tab is pressed', () => {
    const props = makeProps(0); // "home" already focused
    const { getByText } = render(<BottomTabBar {...(props as any)} />);

    fireEvent.press(getByText('HOME'));

    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it('does NOT navigate when tabPress is prevented', () => {
    const props = makeProps(0);
    props.navigation.emit.mockReturnValue({ defaultPrevented: true });

    const { getByText } = render(<BottomTabBar {...(props as any)} />);

    fireEvent.press(getByText('WORKOUT'));

    expect(props.navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'workout-key' }),
    );
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  it('renders minimized workout banner, restores session, and navigates to workout log', () => {
    mockWorkoutSessionState = {
      ...mockWorkoutSessionState,
      sessionId: 'session-1',
      isMinimized: true,
      startedAt: '2026-05-15T09:59:55.000Z',
      exercises: [
        {
          externalExercise: {
            name: 'Deadlift',
          },
        },
      ],
    };
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T10:00:00.000Z').getTime());

    const { getByText, unmount } = render(<BottomTabBar {...(makeProps() as any)} />);

    expect(getByText('5s')).toBeTruthy();
    expect(getByText('Deadlift')).toBeTruthy();

    fireEvent.press(getByText('Expand workout'));

    expect(mockRestore).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/workout-log');

    unmount();
  });

  it('formats banner duration in minutes and hours', () => {
    jest.useFakeTimers();

    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T10:00:00.000Z').getTime());
    mockWorkoutSessionState = {
      ...mockWorkoutSessionState,
      sessionId: 'session-2',
      isMinimized: true,
      startedAt: '2026-05-15T09:58:55.000Z',
    };

    const minutesRender = render(<BottomTabBar {...(makeProps() as any)} />);
    expect(minutesRender.getByText('1m 5s')).toBeTruthy();
    minutesRender.unmount();

    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T11:02:03.000Z').getTime());
    mockWorkoutSessionState = {
      ...mockWorkoutSessionState,
      sessionId: 'session-3',
      isMinimized: true,
      startedAt: '2026-05-15T10:00:00.000Z',
    };

    const hoursRender = render(<BottomTabBar {...(makeProps() as any)} />);
    expect(hoursRender.getByText('1h 2m 3s')).toBeTruthy();
    hoursRender.unmount();
  });

  it('opens discard dialog and confirms or cancels reset', () => {
    mockWorkoutSessionState = {
      ...mockWorkoutSessionState,
      sessionId: 'session-4',
      isMinimized: true,
      startedAt: '2026-05-15T10:00:00.000Z',
    };
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T10:00:05.000Z').getTime());

    const screen = render(<BottomTabBar {...(makeProps() as any)} />);

    fireEvent.press(screen.getByText('Discard workout banner'));
    expect(screen.getByText('Confirm discard')).toBeTruthy();

    fireEvent.press(screen.getByText('Cancel discard'));
    expect(screen.queryByText('Confirm discard')).toBeNull();

    fireEvent.press(screen.getByText('Discard workout banner'));
    fireEvent.press(screen.getByText('Confirm discard'));

    expect(mockResetSession).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Confirm discard')).toBeNull();
  });

  // ── Test 6: re-renders without crashing ──────────────────────────────────
  it('re-renders without crashing when focus changes', () => {
    const props = makeProps(0);
    const { rerender } = render(<BottomTabBar {...(props as any)} />);
    const newProps = makeProps(2);
    expect(() => rerender(<BottomTabBar {...(newProps as any)} />)).not.toThrow();
  });
});
