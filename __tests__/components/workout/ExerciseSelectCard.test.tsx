import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import ExerciseSelectCard from '@/components/workout/ExerciseSelectCard';
import type { ExternalExercise } from '@/types/exercise.types';

const exercise: ExternalExercise = {
  exerciseId: 'ex-1',
  name: 'Dumbbell Curl',
  gifUrl: 'https://example.com/curl.gif',
  targetMuscles: ['biceps'],
  bodyParts: ['upper arms'],
  equipments: ['dumbbell'],
  secondaryMuscles: [],
  instructions: [],
};

describe('ExerciseSelectCard', () => {
  it('renders exercise and primary muscle from targetMuscles', () => {
    const { getByText } = render(
      <ExerciseSelectCard exercise={exercise} selected={false} onPress={jest.fn()} />,
    );

    expect(getByText('Dumbbell Curl')).toBeTruthy();
    expect(getByText('biceps')).toBeTruthy();
    expect(getByText('info-outline')).toBeTruthy();
  });

  it('falls back to bodyParts when targetMuscles is empty', () => {
    const { getByText } = render(
      <ExerciseSelectCard
        exercise={{ ...exercise, targetMuscles: [], bodyParts: ['forearms'] }}
        selected
        onPress={jest.fn()}
      />,
    );

    expect(getByText('forearms')).toBeTruthy();
  });

  it('calls onPress and onInfo callbacks from the two touchables', () => {
    const onPress = jest.fn();
    const onInfo = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <ExerciseSelectCard
        exercise={exercise}
        selected
        onPress={onPress}
        onInfo={onInfo}
      />,
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    fireEvent.press(touchables[1]);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onInfo).toHaveBeenCalledTimes(1);
  });

  it('does not throw when info handler is missing', () => {
    const { UNSAFE_getAllByType } = render(
      <ExerciseSelectCard exercise={exercise} selected={false} onPress={jest.fn()} />,
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    expect(() => fireEvent.press(touchables[1])).not.toThrow();
  });
});
