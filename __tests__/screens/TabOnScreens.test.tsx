import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockStartSession = jest.fn();
const mockStartSessionFromRoutine = jest.fn();
const mockStartDraft = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockTrackWorkoutSessionStarted = jest.fn();
const mockCreateSessionMutation = { mutateAsync: jest.fn().mockResolvedValue({ id: 'session-1', name: 'Empty Workout' }), isPending: false };
const mockDeleteRoutineMutation = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
let mockMutationIndex = 0;
let mockSessionId: string | null = null;
let mockRoutines: Array<{ id: string; name: string; programId?: string | null }> = [];

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: {
    listRoutines: jest.fn(),
    getRoutineById: jest.fn(),
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
      sessionId: mockSessionId,
      startSession: mockStartSession,
      startSessionFromRoutine: mockStartSessionFromRoutine,
      exercises: [],
    }),
}));

jest.mock('@/store/routine.store', () => ({
  useRoutineStore: (selector: any) => selector({ startDraft: mockStartDraft }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: mockRoutines, isFetching: false })),
  useMutation: jest.fn(() => {
    mockMutationIndex += 1;
    return mockMutationIndex === 1 ? mockCreateSessionMutation : mockDeleteRoutineMutation;
  }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('@/utils/sentryAnalytics', () => ({
  trackWorkoutSessionStarted: (...args: any[]) => mockTrackWorkoutSessionStarted(...args),
}));

import WorkoutScreen from '@/app/(tabs)/workout';
import gitfitService from '@/services/gitfit.service';

beforeEach(() => {
  mockPush.mockClear();
  mockStartSession.mockClear();
  mockStartSessionFromRoutine.mockClear();
  mockStartDraft.mockClear();
  mockInvalidateQueries.mockClear();
  mockCreateSessionMutation.mutateAsync.mockClear();
  mockDeleteRoutineMutation.mutateAsync.mockClear();
  mockTrackWorkoutSessionStarted.mockClear();
  mockSessionId = null;
  mockRoutines = [];

  jest.mocked(gitfitService.getRoutineById).mockReset();
  jest.mocked(gitfitService.getRoutineById).mockResolvedValue({
    id: 'routine-1',
    routineExercises: [
      {
        id: 're-1',
        exerciseId: 'ex-1',
        sets: 2,
        repsTarget: '8 reps',
        weightTarget: 60,
        exercise: {
          id: 'ex-1',
          name: 'Bench Press',
          gifUrl: null,
          targetMuscles: ['chest'],
          bodyParts: ['upper arms'],
        },
      },
    ],
  } as any);

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

  it('resumes active workout session without creating a new session', async () => {
    mockSessionId = 'session-active-1';

    const { getByText } = render(<WorkoutScreen />);

    fireEvent.press(getByText('Resume Workout'));

    await waitFor(() => {
      expect(mockCreateSessionMutation.mutateAsync).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/workout-log');
      expect(mockTrackWorkoutSessionStarted).toHaveBeenCalledWith({
        sessionId: 'session-active-1',
        source: 'resume',
      });
    });
  });

  it('starts workout from a routine card', async () => {
    mockRoutines = [{ id: 'routine-1', name: 'Push Day', programId: null }];
    mockCreateSessionMutation.mutateAsync.mockResolvedValueOnce({
      id: 'session-routine-1',
      name: 'Push Day Session',
    });

    const { getByText } = render(<WorkoutScreen />);

    fireEvent.press(getByText('Start Routine'));

    await waitFor(() => {
      expect(jest.mocked(gitfitService.getRoutineById)).toHaveBeenCalledWith('routine-1');
      expect(mockCreateSessionMutation.mutateAsync).toHaveBeenCalledWith({ routineId: 'routine-1' });
      expect(mockStartSessionFromRoutine).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/workout-log');
      expect(mockTrackWorkoutSessionStarted).toHaveBeenCalledWith({
        sessionId: 'session-routine-1',
        source: 'routine',
        routineId: 'routine-1',
        routineName: 'Push Day',
      });
    });
  });
});
