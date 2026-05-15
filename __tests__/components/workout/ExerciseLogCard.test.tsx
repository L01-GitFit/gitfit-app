import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert, Text, TouchableOpacity } from 'react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text: NativeText } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <NativeText>{name}</NativeText>,
  };
});

jest.mock('@/components/workout/SetRow', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    SetRow: ({
      setNumber,
      kg,
      reps,
      rpe,
      variant,
      onToggle,
      onKgChange,
      onRepsChange,
      onDelete,
    }: any) => (
      <View>
        <Text>{`set-${setNumber}`}</Text>
        <Text>{`variant-${variant}`}</Text>
        <Text>{`kg-${kg}`}</Text>
        <Text>{`reps-${reps}`}</Text>
        <Text>{`rpe-${rpe}`}</Text>
        <Pressable onPress={() => onToggle?.()}>
          <Text>{`toggle-${setNumber}`}</Text>
        </Pressable>
        <Pressable onPress={() => onKgChange?.('77.5')}>
          <Text>{`kg-change-${setNumber}`}</Text>
        </Pressable>
        <Pressable onPress={() => onRepsChange?.('12')}>
          <Text>{`reps-change-${setNumber}`}</Text>
        </Pressable>
        <Pressable onPress={() => onDelete?.()}>
          <Text>{`delete-${setNumber}`}</Text>
        </Pressable>
      </View>
    ),
  };
});

import ExerciseLogCard from '@/components/workout/ExerciseLogCard';
import type { ActiveExercise } from '@/store/workoutSession.store';

function buildExercise(): ActiveExercise {
  return {
    id: 'entry-1',
    externalExercise: {
      exerciseId: 'ex-1',
      name: 'Bench Press',
      gifUrl: 'https://example.com/bench.gif',
      targetMuscles: ['chest'],
      bodyParts: ['upper body'],
      equipments: ['barbell'],
      secondaryMuscles: [],
      instructions: [],
    },
    sets: [
      {
        id: 'set-1',
        exerciseDbId: 'ex-1',
        exerciseName: 'Bench Press',
        gifUrl: 'https://example.com/bench.gif',
        previous: '70kg x 8',
        setNumber: 1,
        reps: 8,
        weightKg: 70,
        rpe: 7,
        isWarmup: false,
        isPr: false,
        isCompleted: false,
      },
      {
        id: 'set-2',
        exerciseDbId: 'ex-1',
        exerciseName: 'Bench Press',
        gifUrl: 'https://example.com/bench.gif',
        previous: '-',
        setNumber: 2,
        reps: 0,
        weightKg: 0,
        rpe: undefined,
        isWarmup: false,
        isPr: false,
        isCompleted: true,
      },
      {
        id: 'set-3',
        exerciseDbId: 'ex-1',
        exerciseName: 'Bench Press',
        gifUrl: 'https://example.com/bench.gif',
        previous: '80kg x 5',
        setNumber: 3,
        reps: 5,
        weightKg: 80,
        rpe: 9,
        isWarmup: false,
        isPr: true,
        isCompleted: false,
      },
    ],
  };
}

describe('ExerciseLogCard', () => {
  it('renders set rows and maps variant/value props correctly', () => {
    const { getByText } = render(
      <ExerciseLogCard
        exercise={buildExercise()}
        onAddSet={jest.fn()}
        onToggleSet={jest.fn()}
        onUpdateSet={jest.fn()}
        onRemoveSet={jest.fn()}
      />,
    );

    expect(getByText('Bench Press')).toBeTruthy();
    expect(getByText('Add set')).toBeTruthy();

    expect(getByText('variant-default')).toBeTruthy();
    expect(getByText('variant-completed')).toBeTruthy();
    expect(getByText('variant-achievement')).toBeTruthy();

    expect(getByText('kg-')).toBeTruthy();
    expect(getByText('reps-')).toBeTruthy();
    expect(getByText('rpe-RPE')).toBeTruthy();
  });

  it('calls handlers from SetRow and add set button', () => {
    const onAddSet = jest.fn();
    const onToggleSet = jest.fn();
    const onUpdateSet = jest.fn();
    const onRemoveSet = jest.fn();

    const { getByText } = render(
      <ExerciseLogCard
        exercise={buildExercise()}
        onAddSet={onAddSet}
        onToggleSet={onToggleSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
      />,
    );

    fireEvent.press(getByText('toggle-1'));
    fireEvent.press(getByText('kg-change-1'));
    fireEvent.press(getByText('reps-change-1'));
    fireEvent.press(getByText('delete-1'));
    fireEvent.press(getByText('Add set'));

    expect(onToggleSet).toHaveBeenCalledWith(1);
    expect(onUpdateSet).toHaveBeenCalledWith(1, { weightKg: 77.5 });
    expect(onUpdateSet).toHaveBeenCalledWith(1, { reps: 12 });
    expect(onRemoveSet).toHaveBeenCalledWith(1);
    expect(onAddSet).toHaveBeenCalledTimes(1);
  });

  it('opens remove exercise alert and executes destructive action', () => {
    const onRemoveExercise = jest.fn();
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        const remove = (buttons as any[]).find((b) => b.style === 'destructive');
        remove?.onPress?.();
      });

    const { UNSAFE_getAllByType } = render(
      <ExerciseLogCard
        exercise={buildExercise()}
        onAddSet={jest.fn()}
        onToggleSet={jest.fn()}
        onUpdateSet={jest.fn()}
        onRemoveSet={jest.fn()}
        onRemoveExercise={onRemoveExercise}
      />,
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(onRemoveExercise).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });

  it('does not render set table when no sets exist', () => {
    const exercise = buildExercise();
    exercise.sets = [];

    const { queryByText } = render(
      <ExerciseLogCard
        exercise={exercise}
        onAddSet={jest.fn()}
        onToggleSet={jest.fn()}
        onUpdateSet={jest.fn()}
        onRemoveSet={jest.fn()}
      />,
    );

    expect(queryByText('SET')).toBeNull();
  });
});
