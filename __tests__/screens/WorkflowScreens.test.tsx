import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

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
let mockMode: 'routine' | 'workout' = 'routine';
let mockExercisesCatalog: Array<{ exerciseId: string; name: string; gifUrl?: string | null }> = [];

let mockRoutineState: any = {};
let mockWorkoutState: any = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => ({ mode: mockMode, sessionId: 'session-1' }),
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
      return { data: { username: 'tay' }, isLoading: false };
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

    if (key[0] === 'exercise-previous') {
      return { data: {}, isLoading: false };
    }

    return { data: undefined, isLoading: false };
  }),
  useInfiniteQuery: jest.fn(() => ({
    data: { pages: [{ data: mockExercisesCatalog }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
  })),
  useMutation: jest.fn((options: { mutationFn: (...args: any[]) => Promise<any> | any }) => ({
    mutateAsync: jest.fn((...args: any[]) => options.mutationFn(...args)),
    isPending: false,
  })),
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
  useEquipments: () => ({ data: { data: ['dumbbell'] } }),
}));

jest.mock('@/hooks/useMuscles', () => ({
  useMuscles: () => ({ data: { data: ['chest'] } }),
}));

jest.mock('@/hooks/useLogSet', () => ({
  useLogSet: () => mockLogSet,
}));

jest.mock('@/components/workout/ExerciseSelectCard', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return ({ exercise, selected, onPress }: any) => (
    <TouchableOpacity onPress={onPress}>
      <View>
        <Text>{exercise.name}</Text>
        <Text>{selected ? 'selected' : 'not-selected'}</Text>
      </View>
    </TouchableOpacity>
  );
});

jest.mock('@/components/workout/ExerciseLogCard', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return ({ exercise, onAddSet, onToggleSet, onUpdateSet, onRemoveSet, onRemoveExercise }: any) => (
    <View>
      <Text>{exercise.externalExercise.name}</Text>
      <TouchableOpacity onPress={onAddSet}><Text>Add set action</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => onToggleSet(1)}><Text>Toggle set action</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => onUpdateSet(1, { reps: 10 })}><Text>Update set action</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => onRemoveSet(1)}><Text>Remove set action</Text></TouchableOpacity>
      <TouchableOpacity onPress={onRemoveExercise}><Text>Remove exercise action</Text></TouchableOpacity>
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

jest.mock('@/components/workout/RoutineSetRow', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return ({ setNumber, onKgChange, onRepsChange, onDelete }: any) => (
    <View>
      <Text>{`Set ${setNumber}`}</Text>
      <TouchableOpacity onPress={() => onKgChange('80')}><Text>Change kg</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => onRepsChange('10')}><Text>Change reps</Text></TouchableOpacity>
      <TouchableOpacity onPress={onDelete}><Text>Delete set</Text></TouchableOpacity>
    </View>
  );
});

jest.mock('@/store/routine.store', () => ({
  useRoutineStore: (selector: any) => selector((globalThis as any).__mockRoutineState),
}));

jest.mock('@/store/workoutSession.store', () => ({
  useWorkoutSessionStore: Object.assign(
    (selector: any) => selector((globalThis as any).__mockWorkoutState),
    {
      getState: () => (globalThis as any).__mockWorkoutState,
    },
  ),
}));

jest.mock('@/services/exercisedb.service', () => ({
  __esModule: true,
  default: {
    getExercises: jest.fn(),
    getExercisesByEquipment: jest.fn(),
    getExercisesByMuscle: jest.fn(),
  },
}));

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: {
    createRoutine: jest.fn(),
    addExerciseToRoutine: jest.fn(),
    getWorkoutSessions: jest.fn().mockResolvedValue({ data: [] }),
    getWorkoutSessionById: jest.fn(),
    finishWorkoutSession: jest.fn(),
    cancelWorkoutSession: jest.fn(),
  },
}));

jest.mock('@/utils/sentryAnalytics', () => ({
  trackWorkoutSessionStarted: jest.fn(),
  trackWorkoutLogged: (...args: any[]) => mockTrackWorkoutLogged(...args),
  trackProgressChartViewed: (...args: any[]) => mockTrackProgressChartViewed(...args),
}));

import CreateRoutineScreen from '@/app/create-routine';
import AddExerciseScreen from '@/app/add-exercise';
import WorkoutLogScreen from '@/app/workout-log';
import WorkoutDetailScreen from '@/app/workout-detail';
import gitfitService from '@/services/gitfit.service';

function resetState() {
  mockRoutineState = {
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
  };
  (globalThis as any).__mockRoutineState = mockRoutineState;

  mockWorkoutState = {
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
  };
  (globalThis as any).__mockWorkoutState = mockWorkoutState;
}

beforeEach(() => {
  resetState();
  mockMode = 'routine';
  mockExercisesCatalog = [];

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
  mockLogSet.mutateAsync.mockResolvedValue(undefined);

  jest.mocked(gitfitService.createRoutine).mockReset();
  jest.mocked(gitfitService.addExerciseToRoutine).mockReset();
  jest.mocked(gitfitService.finishWorkoutSession).mockReset();
  jest.mocked(gitfitService.cancelWorkoutSession).mockReset();

  jest.mocked(gitfitService.createRoutine).mockResolvedValue({ id: 'routine-1' } as any);
  jest.mocked(gitfitService.addExerciseToRoutine).mockResolvedValue(undefined as any);
  jest.mocked(gitfitService.finishWorkoutSession).mockResolvedValue(undefined as any);
  jest.mocked(gitfitService.cancelWorkoutSession).mockResolvedValue(undefined as any);
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

  it('saves routine and sends exercises to backend', async () => {
    mockRoutineState.draftName = 'Push Day';
    mockRoutineState.draftExercises = [
      {
        id: 'draft-1',
        notes: 'chest focus',
        sets: [{ id: 'set-1', setNumber: 1, reps: 8, weightKg: 60 }],
        exercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          targetMuscles: ['chest'],
          bodyParts: ['upper body'],
          equipments: ['barbell'],
          secondaryMuscles: ['triceps'],
          instructions: ['press up'],
        },
      },
    ];

    const { getByText } = render(<CreateRoutineScreen />);

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(jest.mocked(gitfitService.createRoutine)).toHaveBeenCalledWith({ name: 'Push Day' });
    });
    expect(jest.mocked(gitfitService.addExerciseToRoutine)).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['routines'] });
    expect(mockRoutineState.discardDraft).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows alert when save fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockRoutineState.draftExercises = [
      {
        id: 'draft-1',
        notes: '',
        sets: [{ id: 'set-1', setNumber: 1, reps: 8, weightKg: 60 }],
        exercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          targetMuscles: [],
          bodyParts: [],
          equipments: [],
          secondaryMuscles: [],
          instructions: [],
        },
      },
    ];
    jest.mocked(gitfitService.createRoutine).mockRejectedValue(new Error('Cannot create routine'));

    const { getByText } = render(<CreateRoutineScreen />);

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Create routine failed', 'Cannot create routine');
    });

    alertSpy.mockRestore();
  });
});

describe('Add exercise screen', () => {
  it('renders search screen and cancels back', () => {
    const { getByText, getByPlaceholderText } = render(<AddExerciseScreen />);

    expect(getByText('Add exercise')).toBeTruthy();
    expect(getByPlaceholderText('Search exercise')).toBeTruthy();

    fireEvent.press(getByText('Cancel'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('selects exercise and adds to routine draft', () => {
    mockExercisesCatalog = [{ exerciseId: 'ex-1', name: 'Push Up' }];

    const { getByText } = render(<AddExerciseScreen />);

    fireEvent.press(getByText('Push Up'));
    fireEvent.press(getByText('ADD 1 EXERCISE'));

    expect(mockAddExerciseToDraft).toHaveBeenCalledWith({ exerciseId: 'ex-1', name: 'Push Up' });
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('selects exercise and adds to workout when mode is workout', () => {
    mockMode = 'workout';
    mockExercisesCatalog = [{ exerciseId: 'ex-2', name: 'Squat' }];

    const { getByText } = render(<AddExerciseScreen />);

    fireEvent.press(getByText('Squat'));
    fireEvent.press(getByText('ADD 1 EXERCISE'));

    expect(mockAddExercise).toHaveBeenCalledWith({ exerciseId: 'ex-2', name: 'Squat' });
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});

describe('Workout log screen', () => {
  it('renders empty state and can finish safely without a session', () => {
    const { getByText } = render(<WorkoutLogScreen />);

    expect(getByText('Log Workout')).toBeTruthy();
    expect(getByText('Get started')).toBeTruthy();
    expect(getByText('Add an exercise to start your workout.')).toBeTruthy();

    fireEvent.press(getByText('Finish'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('logs completed sets and finishes workout', async () => {
    mockWorkoutState.sessionId = 'session-1';
    mockWorkoutState.startedAt = '2026-05-14T03:00:00.000Z';
    mockWorkoutState.exercises = [
      {
        id: 'active-1',
        externalExercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          targetMuscles: ['chest'],
          bodyParts: ['upper body'],
          equipments: ['barbell'],
          secondaryMuscles: ['triceps'],
          instructions: ['press up'],
        },
        sets: [
          {
            setNumber: 1,
            reps: 8,
            weightKg: 70,
            rpe: null,
            isWarmup: false,
            isCompleted: true,
            isPr: false,
            exerciseName: 'Bench Press',
            exerciseDbId: 'ex-1',
            gifUrl: 'https://example.com/bench.gif',
            previous: '65kg x 8',
          },
        ],
      },
    ];

    const { getByText } = render(<WorkoutLogScreen />);

    fireEvent.press(getByText('Finish'));

    await waitFor(() => {
      expect(mockLogSet.mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(jest.mocked(gitfitService.finishWorkoutSession)).toHaveBeenCalledWith('session-1');
    expect(mockTrackWorkoutLogged).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['sessions', 'completed'] });
    expect(mockResetSession).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('auto-fills values from previous set when toggling an empty set', () => {
    const updateSet = jest.fn();
    const toggleSet = jest.fn();
    mockWorkoutState.sessionId = 'session-1';
    mockWorkoutState.exercises = [
      {
        id: 'active-1',
        externalExercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
        },
        sets: [
          {
            setNumber: 1,
            reps: 0,
            weightKg: 0,
            rpe: null,
            isWarmup: false,
            isCompleted: false,
            isPr: false,
            exerciseName: 'Bench Press',
            exerciseDbId: 'ex-1',
            gifUrl: 'https://example.com/bench.gif',
            previous: '50.5 kg x 10',
          },
        ],
      },
    ];
    mockWorkoutState.updateSet = updateSet;
    mockWorkoutState.toggleSet = toggleSet;

    const { getByText } = render(<WorkoutLogScreen />);

    fireEvent.press(getByText('Toggle set action'));

    expect(updateSet).toHaveBeenCalledWith('active-1', 1, { weightKg: 50.5, reps: 10 });
    expect(toggleSet).toHaveBeenCalledWith('active-1', 1);
  });

  it('opens discard dialog and confirms cancellation', async () => {
    mockWorkoutState.sessionId = 'session-1';

    const { getByText } = render(<WorkoutLogScreen />);

    fireEvent.press(getByText('Discard Workout'));
    fireEvent.press(getByText('Confirm discard'));

    await waitFor(() => {
      expect(jest.mocked(gitfitService.cancelWorkoutSession)).toHaveBeenCalledWith('session-1');
    });
    expect(mockResetSession).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('minimizes workout and navigates back', () => {
    const { getByText } = render(<WorkoutLogScreen />);

    fireEvent.press(getByText('keyboard-arrow-down'));

    expect(mockMinimize).toHaveBeenCalledTimes(1);
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
