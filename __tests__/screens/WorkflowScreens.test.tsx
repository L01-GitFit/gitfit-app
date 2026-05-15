import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockStartDraft = jest.fn();
const mockAddExerciseToDraft = jest.fn();
const mockAddExercise = jest.fn();
const mockMinimize = jest.fn();
const mockResetSession = jest.fn();
const mockTrackWorkoutLogged = jest.fn();
const mockTrackProgressChartViewed = jest.fn();
const mockLogSet = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
const mockFinishSession = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
const mockCancelSession = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
const mockCreateRoutine = { mutateAsync: jest.fn().mockResolvedValue({ id: 'routine-1' }), isPending: false };
const mockAddExerciseToRoutine = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
let mockMutationIndex = 0;

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: {
    createRoutine: jest.fn(),
    addExerciseToRoutine: jest.fn(),
    getWorkoutSessions: jest.fn(),
    getWorkoutSessionById: jest.fn(),
    finishWorkoutSession: jest.fn(),
    cancelWorkoutSession: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => ({ mode: 'routine', sessionId: 'session-1' }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((options: { queryKey: unknown[] }) => {
    const key = options.queryKey;

    if (key[0] === 'profile') {
      return {
        data: {
          username: 'tay',
        },
        isLoading: false,
      };
    }

    if (key[0] === 'session-detail') {
      return {
        data: {
          id: 'session-1',
          name: 'Upper Body Day',
          startedAt: '2026-05-14T03:00:00.000Z',
          durationSeconds: 1200,
          totalVolumeKg: 4000,
          workoutSets: [
            {
              id: 'set-1',
              exerciseId: 'exercise-1',
              setNumber: 1,
              reps: 8,
              weightKg: 70,
              durationSeconds: null,
              distanceMeters: null,
              rpe: null,
              isWarmup: false,
              isPr: true,
              loggedAt: '2026-05-14T03:00:00.000Z',
              exercise: { id: 'exercise-1', name: 'Bench Press', gifUrl: null },
            },
          ],
        },
        isLoading: false,
      };
    }

    if (key[0] === 'sessions') {
      return { data: { data: [] }, isLoading: false };
    }

    return { data: undefined, isLoading: false };
  }),
  useInfiniteQuery: jest.fn(() => ({
    data: { pages: [{ data: [] }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
  })),
  useMutation: jest.fn(() => {
    mockMutationIndex += 1;
    if (mockMutationIndex === 1) return mockCreateRoutine;
    if (mockMutationIndex === 2) return mockAddExerciseToRoutine;
    if (mockMutationIndex === 3) return mockLogSet;
    if (mockMutationIndex === 4) return mockFinishSession;
    return mockCancelSession;
  }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('@/hooks/useExerciseSearch', () => ({
  useExerciseSearch: () => ({
    data: undefined,
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
  }),
}));

jest.mock('@/hooks/useEquipments', () => ({
  useEquipments: () => ({ data: { data: [] } }),
}));

jest.mock('@/hooks/useMuscles', () => ({
  useMuscles: () => ({ data: { data: [] } }),
}));

jest.mock('@/hooks/useLogSet', () => ({
  useLogSet: () => mockLogSet,
}));

jest.mock('@/store/routine.store', () => ({
  useRoutineStore: (selector: any) =>
    selector({
      draftName: 'Upper Routine',
      draftExercises: [],
      setDraftName: jest.fn(),
      removeExerciseFromDraft: jest.fn(),
      updateDraftExerciseNotes: jest.fn(),
      addSetToDraftExercise: jest.fn(),
      updateDraftSet: jest.fn(),
      removeDraftSet: jest.fn(),
      discardDraft: jest.fn(),
      startDraft: mockStartDraft,
      addExerciseToDraft: mockAddExerciseToDraft,
    }),
}));

jest.mock('@/store/workoutSession.store', () => ({
  useWorkoutSessionStore: (selector: any) =>
    selector({
      sessionId: null,
      startedAt: null,
      minimize: mockMinimize,
      resetSession: mockResetSession,
      exercises: [],
      addSet: jest.fn(),
      updateSet: jest.fn(),
      toggleSet: jest.fn(),
      removeSet: jest.fn(),
      removeExercise: jest.fn(),
      addExercise: mockAddExercise,
      startSession: jest.fn(),
      startSessionFromRoutine: jest.fn(),
      getState: () => ({ exercises: [] }),
    }),
}));

jest.mock('@/services/exercisedb.service', () => ({}));
jest.mock('@/services/gitfit.service', () => ({}));

jest.mock('@/utils/sentryAnalytics', () => ({
  trackWorkoutSessionStarted: jest.fn(),
  trackWorkoutLogged: jest.fn(),
  trackProgressChartViewed: jest.fn(),
}));

import CreateRoutineScreen from '@/app/create-routine';
import AddExerciseScreen from '@/app/add-exercise';
import WorkoutLogScreen from '@/app/workout-log';
import WorkoutDetailScreen from '@/app/workout-detail';

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockReplace.mockClear();
  mockInvalidateQueries.mockClear();
  mockStartDraft.mockClear();
  mockAddExerciseToDraft.mockClear();
  mockAddExercise.mockClear();
  mockMinimize.mockClear();
  mockResetSession.mockClear();
  mockTrackWorkoutLogged.mockClear();
  mockTrackProgressChartViewed.mockClear();
  mockLogSet.mutateAsync.mockClear();
  mockFinishSession.mutateAsync.mockClear();
  mockCancelSession.mutateAsync.mockClear();
  mockCreateRoutine.mutateAsync.mockClear();
  mockAddExerciseToRoutine.mutateAsync.mockClear();
  mockMutationIndex = 0;
});

describe('Create routine screen', () => {
  it('renders the empty state and add-exercise action', () => {
    const { getByText } = render(<CreateRoutineScreen />);

    expect(getByText('Create Routine')).toBeTruthy();
    expect(getByText('Get started by adding an exercise to your routine.')).toBeTruthy();
    expect(getByText('Add Exercise')).toBeTruthy();
  });

  it('opens the add exercise flow', () => {
    const { getByText } = render(<CreateRoutineScreen />);

    fireEvent.press(getByText('Add Exercise'));

    expect(mockPush).toHaveBeenCalledWith('/add-exercise?mode=routine');
  });
});

describe('Add exercise screen', () => {
  it('renders the search screen and cancels back', () => {
    const { getByText, getByPlaceholderText } = render(<AddExerciseScreen />);

    expect(getByText('Add exercise')).toBeTruthy();
    expect(getByPlaceholderText('Search exercise')).toBeTruthy();

    fireEvent.press(getByText('Cancel'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe('Workout log screen', () => {
  it('renders the empty state and can finish safely without a session', () => {
    const { getByText } = render(<WorkoutLogScreen />);

    expect(getByText('Log Workout')).toBeTruthy();
    expect(getByText('Get started')).toBeTruthy();
    expect(getByText('Add an exercise to start your workout.')).toBeTruthy();

    fireEvent.press(getByText('Finish'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe('Workout detail screen', () => {
  it('renders workout detail data', () => {
    const { getByText } = render(<WorkoutDetailScreen />);

    expect(getByText('Workout Detail')).toBeTruthy();
    expect(getByText('Upper Body Day')).toBeTruthy();
    expect(getByText('Bench Press')).toBeTruthy();
    expect(getByText('70 kg x 8')).toBeTruthy();
  });
});
