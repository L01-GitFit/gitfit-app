import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import { ExerciseCard } from '@/components/workout/ExerciseCard';

describe('ExerciseCard', () => {
  const baseProps = {
    title: 'Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
  };

  it('renders title, metadata and icon', () => {
    const { getByText } = render(<ExerciseCard {...baseProps} />);

    expect(getByText('Bench Press')).toBeTruthy();
    expect(getByText('Chest - Barbell')).toBeTruthy();
    expect(getByText('fitness-center')).toBeTruthy();
  });

  it('calls onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ExerciseCard {...baseProps} onPress={onPress} />);

    fireEvent.press(getByText('Bench Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <ExerciseCard {...baseProps} disabled onPress={jest.fn()} />,
    );

    expect(getByText('check')).toBeTruthy();
  });

  it('renders selected and disabled indicators', () => {
    const { getByText, rerender } = render(
      <ExerciseCard {...baseProps} selected />,
    );
    expect(getByText('done')).toBeTruthy();

    rerender(<ExerciseCard {...baseProps} disabled />);
    expect(getByText('check')).toBeTruthy();
  });
});
