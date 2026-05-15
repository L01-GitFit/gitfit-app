import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert, Pressable, TextInput, TouchableOpacity } from 'react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import DiscardWorkoutDialog from '@/components/workout/DiscardWorkoutDialog';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import ExerciseLogCard from '@/components/workout/ExerciseLogCard';
import ExerciseSelectCard from '@/components/workout/ExerciseSelectCard';
import FloatingWorkoutBanner from '@/components/workout/FloatingWorkoutBanner';
import RoutineSetRow from '@/components/workout/RoutineSetRow';
import { SetRow } from '@/components/workout/SetRow';

describe('Workout components', () => {
  it('renders and handles the discard workout dialog actions', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = render(
      <DiscardWorkoutDialog visible onConfirm={onConfirm} onCancel={onCancel} />,
    );

    fireEvent.press(getByText('Discard Workout'));
    fireEvent.press(getByText('Cancel'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders the floating workout banner and fires callbacks', () => {
    const onExpand = jest.fn();
    const onDiscard = jest.fn();
    const { getByText, UNSAFE_getAllByType } = render(
      <FloatingWorkoutBanner
        workout={{ duration: '12m', exercise: 'upper body day' }}
        onExpand={onExpand}
        onDiscard={onDiscard}
      />,
    );

    expect(getByText('Workout')).toBeTruthy();
    expect(getByText('12m')).toBeTruthy();
    expect(getByText('upper body day')).toBeTruthy();

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    fireEvent.press(touchables[1]);

    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('renders exercise cards and selection cards', () => {
    const onPress = jest.fn();
    const onInfo = jest.fn();

    const exercise = {
      name: 'Bench Press',
      gifUrl: 'https://example.com/bench.gif',
      targetMuscles: ['chest'],
      bodyParts: ['upper body'],
      equipments: ['barbell'],
      secondaryMuscles: [],
      instructions: [],
    } as any;

    const firstRender = render(
      <ExerciseCard title="Bench Press" muscleGroup="Chest" equipment="Barbell" onPress={onPress} />,
    );

    expect(firstRender.getByText('Bench Press')).toBeTruthy();
    expect(firstRender.getByText('Chest - Barbell')).toBeTruthy();

    fireEvent.press(firstRender.getByText('Bench Press'));
    expect(onPress).toHaveBeenCalledTimes(1);

    const selectedCard = render(<ExerciseSelectCard exercise={exercise} selected onPress={onPress} onInfo={onInfo} />);
    expect(selectedCard.getByText('Bench Press')).toBeTruthy();
    expect(selectedCard.getByText('chest')).toBeTruthy();

    const touchables = selectedCard.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    fireEvent.press(touchables[1]);

    expect(onPress).toHaveBeenCalledTimes(2);
    expect(onInfo).toHaveBeenCalledTimes(1);
  });

  it('renders set rows and handles value changes', () => {
    const onToggle = jest.fn();
    const onKgChange = jest.fn();
    const onRepsChange = jest.fn();

    const { getByDisplayValue, getByText } = render(
      <SetRow
        setNumber={1}
        previous="70kg x 8"
        kg="70"
        reps="8"
        rpe="RPE"
        onToggle={onToggle}
        onKgChange={onKgChange}
        onRepsChange={onRepsChange}
      />,
    );

    expect(getByText('70kg x 8')).toBeTruthy();
    fireEvent.changeText(getByDisplayValue('70'), '72.5');
    fireEvent.changeText(getByDisplayValue('8'), '10');
    fireEvent.press(getByText('check'));

    expect(onKgChange).toHaveBeenCalledWith('72.5');
    expect(onRepsChange).toHaveBeenCalledWith('10');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('parses decimal previous values for set rows', () => {
    const { getByText } = render(
      <SetRow
        setNumber={2}
        previous="50.5 kg x 10"
        kg=""
        reps=""
        rpe="RPE"
      />,
    );

    expect(getByText('50.5 kg x 10')).toBeTruthy();
  });

  it('renders routine set rows and delete handler', () => {
    const onKgChange = jest.fn();
    const onRepsChange = jest.fn();
    const onDelete = jest.fn();

    const { getByDisplayValue } = render(
      <RoutineSetRow
        setNumber={1}
        kg="50"
        reps="5"
        onKgChange={onKgChange}
        onRepsChange={onRepsChange}
        onDelete={onDelete}
      />,
    );

    fireEvent.changeText(getByDisplayValue('50'), '55');
    fireEvent.changeText(getByDisplayValue('5'), '6');

    expect(onKgChange).toHaveBeenCalledWith('55');
    expect(onRepsChange).toHaveBeenCalledWith('6');
  });

  it('renders exercise log cards and shows delete confirmation', () => {
    const onAddSet = jest.fn();
    const onToggleSet = jest.fn();
    const onUpdateSet = jest.fn();
    const onRemoveSet = jest.fn();
    const onRemoveExercise = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const removeButton = (buttons as any[]).find((button) => button.style === 'destructive');
      removeButton?.onPress?.();
    });

    const { getByText, UNSAFE_getAllByType } = render(
      <ExerciseLogCard
        exercise={{
          externalExercise: {
            exerciseId: 'exercise-1',
            name: 'Bench Press',
            gifUrl: 'https://example.com/bench.gif',
          },
          sets: [
            {
              id: 'set-1',
              exerciseDbId: 'exercise-1',
              exerciseName: 'Bench Press',
              gifUrl: 'https://example.com/bench.gif',
              previous: '70kg x 8',
              setNumber: 1,
              reps: 8,
              weightKg: 70,
              rpe: 7,
              isWarmup: false,
              isCompleted: false,
              isPr: false,
            },
          ],
        } as any}
        onAddSet={onAddSet}
        onToggleSet={onToggleSet}
        onUpdateSet={onUpdateSet}
        onRemoveSet={onRemoveSet}
        onRemoveExercise={onRemoveExercise}
      />,
    );

    expect(getByText('Add set')).toBeTruthy();
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(onRemoveExercise).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });
});
