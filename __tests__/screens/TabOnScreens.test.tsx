import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockStartSession = jest.fn();
const mockStartSessionFromRoutine = jest.fn();
const mockStartDraft = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockCreateSessionMutation = { mutateAsync: jest.fn().mockResolvedValue({ id: 'session-1', name: 'Empty Workout' }), isPending: false };
const mockDeleteRoutineMutation = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
let mockMutationIndex = 0;

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: {
    listRoutines: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('@/store/workoutSession.store', () => ({
  useWorkoutSessionStore: (selector: any) =>
    selector({
      sessionId: null,
      startSession: mockStartSession,
      startSessionFromRoutine: mockStartSessionFromRoutine,
      exercises: [],
    }),
}));

jest.mock('@/store/routine.store', () => ({
  useRoutineStore: (selector: any) => selector({ startDraft: mockStartDraft }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isFetching: false })),
  useMutation: jest.fn(() => {
    mockMutationIndex += 1;
    return mockMutationIndex === 1 ? mockCreateSessionMutation : mockDeleteRoutineMutation;
  }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('@/utils/sentryAnalytics', () => ({
  trackWorkoutSessionStarted: jest.fn(),
}));

import WorkoutScreen from '@/app/(tabs)/workout';

beforeEach(() => {
  mockPush.mockClear();
  mockStartSession.mockClear();
  mockStartSessionFromRoutine.mockClear();
  mockStartDraft.mockClear();
  mockInvalidateQueries.mockClear();
  mockCreateSessionMutation.mutateAsync.mockClear();
  mockDeleteRoutineMutation.mutateAsync.mockClear();
  mockMutationIndex = 0;
});

describe('Workout tab screen', () => {
  it('renders the core actions', () => {
    const { getByText } = render(<WorkoutScreen />);

    expect(getByText('Workout')).toBeTruthy();
    expect(getByText('Start Empty Workout')).toBeTruthy();
    expect(getByText('New Routines')).toBeTruthy();
    expect(getByText('Explore Routines')).toBeTruthy();
  });

  it('starts a new empty workout session', async () => {
    const { getByText } = render(<WorkoutScreen />);

    fireEvent.press(getByText('Start Empty Workout'));

    await waitFor(() => {
      expect(mockCreateSessionMutation.mutateAsync).toHaveBeenCalledWith({});
      expect(mockStartSession).toHaveBeenCalledWith('session-1', 'Empty Workout');
      expect(mockPush).toHaveBeenCalledWith('/workout-log');
    });
  });

  it('opens the create routine screen', () => {
    const { getByText } = render(<WorkoutScreen />);

    fireEvent.press(getByText('New Routines'));

    expect(mockStartDraft).toHaveBeenCalledWith('New Routine');
    expect(mockPush).toHaveBeenCalledWith('/create-routine');
  });
});
