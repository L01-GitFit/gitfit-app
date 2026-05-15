import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ActivityIndicator, Alert, Animated, FlatList } from 'react-native';
import { AxiosError } from 'axios';

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

const mockAllFetchNextPage = jest.fn();
const mockEquipmentFetchNextPage = jest.fn();
const mockMuscleFetchNextPage = jest.fn();
const mockSearchFetchNextPage = jest.fn();

const mockLogSet = { mutateAsync: jest.fn().mockResolvedValue(undefined), isPending: false };
let mockMode: 'routine' | 'workout' = 'routine';
let mockExercisesCatalog: Array<{ exerciseId: string; name: string; gifUrl?: string | null }> = [];
let mockSearchExercises: Array<{ exerciseId: string; name: string; gifUrl?: string | null }> = [];
let mockEquipmentExercises: Array<{ exerciseId: string; name: string; gifUrl?: string | null }> = [];
let mockMuscleExercises: Array<{ exerciseId: string; name: string; gifUrl?: string | null }> = [];
let mockAllIsLoading = false;
let mockAllIsFetchingNextPage = false;
let mockAllHasNextPage = false;
let mockEquipmentIsLoading = false;
let mockEquipmentIsFetchingNextPage = false;
let mockEquipmentHasNextPage = false;
let mockMuscleIsLoading = false;
let mockMuscleIsFetchingNextPage = false;
let mockMuscleHasNextPage = false;
let mockSearchIsLoading = false;
let mockSearchIsFetchingNextPage = false;
let mockSearchHasNextPage = false;
let mockExercisePreviousData: any = {};

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
      return { data: mockExercisePreviousData, isLoading: false };
    }

    return { data: undefined, isLoading: false };
  }),
  useInfiniteQuery: jest.fn((options: { queryKey: unknown[] }) => {
    const key = options.queryKey;

    if (key[1] === 'equipment') {
      return {
        data: { pages: [{ data: mockEquipmentExercises }] },
        isLoading: mockEquipmentIsLoading,
        isFetchingNextPage: mockEquipmentIsFetchingNextPage,
        hasNextPage: mockEquipmentHasNextPage,
        fetchNextPage: mockEquipmentFetchNextPage,
      };
    }

    if (key[1] === 'muscle') {
      return {
        data: { pages: [{ data: mockMuscleExercises }] },
        isLoading: mockMuscleIsLoading,
        isFetchingNextPage: mockMuscleIsFetchingNextPage,
        hasNextPage: mockMuscleHasNextPage,
        fetchNextPage: mockMuscleFetchNextPage,
      };
    }

    return {
      data: { pages: [{ data: mockExercisesCatalog }] },
      isLoading: mockAllIsLoading,
      isFetchingNextPage: mockAllIsFetchingNextPage,
      hasNextPage: mockAllHasNextPage,
      fetchNextPage: mockAllFetchNextPage,
    };
  }),
  useMutation: jest.fn((options: { mutationFn: (...args: any[]) => Promise<any> | any }) => ({
    mutateAsync: jest.fn((...args: any[]) => options.mutationFn(...args)),
    isPending: false,
  })),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('@/hooks/useExerciseSearch', () => ({
  useExerciseSearch: () => ({
    data: { pages: [{ data: mockSearchExercises }] },
    isLoading: mockSearchIsLoading,
    isFetchingNextPage: mockSearchIsFetchingNextPage,
    hasNextPage: mockSearchHasNextPage,
    fetchNextPage: mockSearchFetchNextPage,
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
  jest.useRealTimers();
  mockMode = 'routine';
  mockExercisesCatalog = [];
  mockSearchExercises = [];
  mockEquipmentExercises = [];
  mockMuscleExercises = [];
  mockAllIsLoading = false;
  mockAllIsFetchingNextPage = false;
  mockAllHasNextPage = false;
  mockEquipmentIsLoading = false;
  mockEquipmentIsFetchingNextPage = false;
  mockEquipmentHasNextPage = false;
  mockMuscleIsLoading = false;
  mockMuscleIsFetchingNextPage = false;
  mockMuscleHasNextPage = false;
  mockSearchIsLoading = false;
  mockSearchIsFetchingNextPage = false;
  mockSearchHasNextPage = false;
  mockExercisePreviousData = {};

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
  mockAllFetchNextPage.mockClear();
  mockEquipmentFetchNextPage.mockClear();
  mockMuscleFetchNextPage.mockClear();
  mockSearchFetchNextPage.mockClear();
  mockLogSet.mutateAsync.mockClear();
  mockLogSet.mutateAsync.mockResolvedValue(undefined);

  jest.restoreAllMocks();

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

  it('cancels creation, discards draft, and goes back', () => {
    const { getByText } = render(<CreateRoutineScreen />);

    fireEvent.press(getByText('Cancel'));

    expect(mockRoutineState.discardDraft).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
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

  it('normalizes invalid exercise fields before sending them to backend', async () => {
    mockRoutineState.draftName = '  Pull Day  ';
    mockRoutineState.draftExercises = [
      {
        id: 'draft-2',
        notes: '',
        sets: [{ id: 'set-1', setNumber: 1, reps: null, weightKg: null }],
        exercise: {
          exerciseId: '  ex-2  ',
          name: '  Lat Pulldown  ',
          gifUrl: '',
          targetMuscles: null,
          bodyParts: undefined,
          equipments: 'cable',
          secondaryMuscles: null,
          instructions: 'pull down',
        },
      },
    ];

    const { getByText } = render(<CreateRoutineScreen />);

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(jest.mocked(gitfitService.addExerciseToRoutine)).toHaveBeenCalledWith(
        'routine-1',
        {
          exercise: {
            exerciseDbId: 'ex-2',
            name: 'Lat Pulldown',
            gifUrl: undefined,
            targetMuscles: [],
            bodyParts: [],
            equipments: [],
            secondaryMuscles: [],
            instructions: [],
          },
          sets: 1,
          repsTarget: undefined,
          weightTarget: undefined,
          orderIndex: 0,
        },
      );
    });
  });

  it('updates draft fields and invokes row actions for populated exercises', () => {
    mockRoutineState.draftExercises = [
      {
        id: 'draft-1',
        notes: 'initial notes',
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

    const { getByPlaceholderText, getByText } = render(<CreateRoutineScreen />);

    fireEvent.changeText(getByPlaceholderText('Routine title'), 'Leg Day');
    fireEvent.changeText(getByPlaceholderText('Add notes here...'), 'tempo work');
    fireEvent.press(getByText('Change kg'));
    fireEvent.press(getByText('Change reps'));
    fireEvent.press(getByText('Delete set'));
    fireEvent.press(getByText('Add set'));
    fireEvent.press(getByText('more-vert'));

    expect(mockRoutineState.setDraftName).toHaveBeenCalledWith('Leg Day');
    expect(mockRoutineState.updateDraftExerciseNotes).toHaveBeenCalledWith('draft-1', 'tempo work');
    expect(mockRoutineState.updateDraftSet).toHaveBeenCalledWith('draft-1', 1, { weightKg: 80 });
    expect(mockRoutineState.updateDraftSet).toHaveBeenCalledWith('draft-1', 1, { reps: 10 });
    expect(mockRoutineState.removeDraftSet).toHaveBeenCalledWith('draft-1', 1);
    expect(mockRoutineState.addSetToDraftExercise).toHaveBeenCalledWith('draft-1');
    expect(mockRoutineState.removeExerciseFromDraft).toHaveBeenCalledWith('draft-1');
  });

  it('shows the first API validation message when axios returns an array', async () => {
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
    jest.mocked(gitfitService.createRoutine).mockRejectedValue(
      new AxiosError(
        'Request failed',
        '400',
        undefined,
        undefined,
        { data: { message: ['Routine name already exists', 'Other error'] } } as any,
      ),
    );

    const { getByText } = render(<CreateRoutineScreen />);

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Create routine failed',
        'Routine name already exists',
      );
    });

    alertSpy.mockRestore();
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

  it('toggles selection count, plural label, and deselection', () => {
    mockExercisesCatalog = [
      { exerciseId: 'ex-1', name: 'Push Up' },
      { exerciseId: 'ex-2', name: 'Squat' },
    ];

    const { getByText, queryByText } = render(<AddExerciseScreen />);

    fireEvent.press(getByText('Push Up'));
    expect(getByText('ADD 1 EXERCISE')).toBeTruthy();

    fireEvent.press(getByText('Squat'));
    expect(getByText('ADD 2 EXERCISES')).toBeTruthy();

    fireEvent.press(getByText('Push Up'));
    expect(getByText('ADD 1 EXERCISE')).toBeTruthy();

    fireEvent.press(getByText('Squat'));
    expect(queryByText('ADD 1 EXERCISE')).toBeNull();
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

  it('switches to search results and clears back to the default list', () => {
    mockExercisesCatalog = [{ exerciseId: 'ex-1', name: 'Push Up' }];
    mockSearchExercises = [{ exerciseId: 'ex-3', name: 'Row' }];

    const { getByPlaceholderText, getByText, queryByText } = render(<AddExerciseScreen />);

    fireEvent.changeText(getByPlaceholderText('Search exercise'), 'row');
    expect(getByText('Row')).toBeTruthy();
    expect(queryByText('Push Up')).toBeNull();

    fireEvent.press(getByText('close'));
    expect(getByText('Push Up')).toBeTruthy();
  });

  it('applies and clears equipment filter from the modal', () => {
    mockExercisesCatalog = [{ exerciseId: 'ex-1', name: 'Push Up' }];
    mockEquipmentExercises = [{ exerciseId: 'ex-4', name: 'Dumbbell Curl' }];

    const { getByText, queryByText } = render(<AddExerciseScreen />);

    fireEvent.press(getByText('All Equipments'));
    expect(getByText('Equipment')).toBeTruthy();

    fireEvent.press(getByText('dumbbell'));
    expect(getByText('Dumbbell Curl')).toBeTruthy();
    expect(queryByText('Push Up')).toBeNull();

    fireEvent.press(getByText('dumbbell'));
    fireEvent.press(getByText('All Equipments'));
    expect(getByText('Push Up')).toBeTruthy();
  });

  it('applies muscle filter and fetches next page for all, search, equipment, and muscle sources', () => {
    mockExercisesCatalog = [{ exerciseId: 'ex-1', name: 'Push Up' }];
    mockSearchExercises = [{ exerciseId: 'ex-3', name: 'Row' }];
    mockEquipmentExercises = [{ exerciseId: 'ex-4', name: 'Dumbbell Curl' }];
    mockMuscleExercises = [{ exerciseId: 'ex-5', name: 'Fly' }];
    mockAllHasNextPage = true;
    mockSearchHasNextPage = true;
    mockEquipmentHasNextPage = true;
    mockMuscleHasNextPage = true;

    const screen = render(<AddExerciseScreen />);
    const list = () => screen.UNSAFE_getByType(FlatList);

    list().props.onEndReached();
    expect(mockAllFetchNextPage).toHaveBeenCalledTimes(1);

    fireEvent.changeText(screen.getByPlaceholderText('Search exercise'), 'row');
    list().props.onEndReached();
    expect(mockSearchFetchNextPage).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('close'));
    fireEvent.press(screen.getByText('All Equipments'));
    fireEvent.press(screen.getByText('dumbbell'));
    list().props.onEndReached();
    expect(mockEquipmentFetchNextPage).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('All Muscles'));
    fireEvent.press(screen.getByText('chest'));
    list().props.onEndReached();
    expect(mockMuscleFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicators for both default and search states', () => {
    mockAllIsLoading = true;
    const defaultScreen = render(<AddExerciseScreen />);
    expect(defaultScreen.UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    defaultScreen.unmount();

    mockAllIsLoading = false;
    mockSearchIsLoading = true;
    const searchScreen = render(<AddExerciseScreen />);
    fireEvent.changeText(searchScreen.getByPlaceholderText('Search exercise'), 'row');
    expect(searchScreen.UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
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

  it('auto-adds baseline sets for newly added exercises with no sets yet', async () => {
    const addSet = jest.fn();
    mockExercisePreviousData = {
      'ex-1': {
        previous: '55kg x 5',
        maxWeight: 55,
        maxReps: 5,
        setCount: 2,
      },
    };
    mockWorkoutState.exercises = [
      {
        id: 'active-1',
        externalExercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          targetMuscles: [],
          bodyParts: [],
          equipments: [],
          secondaryMuscles: [],
          instructions: [],
        },
        sets: [],
      },
    ];
    mockWorkoutState.addSet = addSet;

    render(<WorkoutLogScreen />);

    await waitFor(() => {
      expect(addSet).toHaveBeenCalledTimes(2);
    });
    expect(addSet).toHaveBeenNthCalledWith(
      1,
      'active-1',
      expect.objectContaining({ previous: '55kg x 5', setNumber: 1 }),
    );
    expect(addSet).toHaveBeenNthCalledWith(
      2,
      'active-1',
      expect.objectContaining({ previous: '55kg x 5', setNumber: 2 }),
    );
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

  it('renders stats, adds an exercise, and forwards exercise row actions', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-15T10:01:05.000Z').getTime());

    const addSet = jest.fn();
    const updateSet = jest.fn();
    const removeSet = jest.fn();
    const removeExercise = jest.fn();
    mockExercisePreviousData = {
      'ex-1': {
        previous: '60kg x 8',
        maxWeight: 60,
        maxReps: 8,
        setCount: 1,
      },
    };
    mockWorkoutState.sessionId = 'session-1';
    mockWorkoutState.startedAt = '2026-05-15T10:00:00.000Z';
    mockWorkoutState.addSet = addSet;
    mockWorkoutState.updateSet = updateSet;
    mockWorkoutState.removeSet = removeSet;
    mockWorkoutState.removeExercise = removeExercise;
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
            id: 'set-1',
            setNumber: 1,
            reps: 8,
            weightKg: 70,
            rpe: 8,
            isWarmup: false,
            isCompleted: true,
            isPr: false,
            exerciseName: 'Bench Press',
            exerciseDbId: 'ex-1',
            gifUrl: 'https://example.com/bench.gif',
            previous: '60kg x 8',
          },
        ],
      },
    ];

    const { getByText } = render(<WorkoutLogScreen />);

    expect(getByText('1m 5s')).toBeTruthy();
    expect(getByText('560 Kg')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();

    fireEvent.press(getByText('Add Exercise'));
    fireEvent.press(getByText('Add set action'));
    fireEvent.press(getByText('Update set action'));
    fireEvent.press(getByText('Remove set action'));
    fireEvent.press(getByText('Remove exercise action'));

    expect(mockPush).toHaveBeenCalledWith('/add-exercise?mode=workout');
    expect(addSet).toHaveBeenCalledWith(
      'active-1',
      expect.objectContaining({ previous: '60kg x 8', setNumber: 2 }),
    );
    expect(updateSet).toHaveBeenCalledWith('active-1', 1, { reps: 10 });
    expect(removeSet).toHaveBeenCalledWith('active-1', 1);
    expect(removeExercise).toHaveBeenCalledWith('active-1');
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

  it('shows achievement banner for new personal records', async () => {
    jest.spyOn(Animated, 'timing').mockReturnValue({
      start: (callback?: () => void) => callback?.(),
    } as any);
    jest.spyOn(global, 'setTimeout').mockImplementation(() => 0 as any);
    jest.spyOn(global, 'clearTimeout').mockImplementation(() => undefined);

    const updateSet = jest.fn();
    mockExercisePreviousData = {
      'ex-1': {
        previous: '60kg x 7',
        maxWeight: 60,
        maxReps: 7,
        setCount: 1,
      },
    };
    mockWorkoutState.updateSet = updateSet;
    mockWorkoutState.exercises = [
      {
        id: 'active-1',
        externalExercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          targetMuscles: [],
          bodyParts: [],
          equipments: [],
          secondaryMuscles: [],
          instructions: [],
        },
        sets: [
          {
            id: 'set-1',
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
            previous: '60kg x 7',
          },
        ],
      },
    ];

    const { getByText, unmount } = render(<WorkoutLogScreen />);

    await waitFor(() => {
      expect(updateSet).toHaveBeenCalledWith('active-1', 1, { isPr: true });
    });
    expect(getByText('New Max Weight & Reps - 70kg x 8')).toBeTruthy();

    unmount();
  });

  it('shows alert when finish fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockWorkoutState.sessionId = 'session-1';
    mockWorkoutState.exercises = [
      {
        id: 'active-1',
        externalExercise: {
          exerciseId: 'ex-1',
          name: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          targetMuscles: [],
          bodyParts: [],
          equipments: [],
          secondaryMuscles: [],
          instructions: [],
        },
        sets: [
          {
            id: 'set-1',
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
            previous: '-',
          },
        ],
      },
    ];
    jest.mocked(gitfitService.finishWorkoutSession).mockRejectedValue(new Error('Cannot finish workout'));

    const { getByText } = render(<WorkoutLogScreen />);

    fireEvent.press(getByText('Finish'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Finish failed', 'Cannot finish workout');
    });

    alertSpy.mockRestore();
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

  it('still resets locally when backend cancellation fails', async () => {
    mockWorkoutState.sessionId = 'session-1';
    jest.mocked(gitfitService.cancelWorkoutSession).mockRejectedValue(new Error('Cannot cancel'));

    const { getByText } = render(<WorkoutLogScreen />);

    fireEvent.press(getByText('Discard Workout'));
    fireEvent.press(getByText('Confirm discard'));

    await waitFor(() => {
      expect(mockResetSession).toHaveBeenCalledTimes(1);
    });
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
