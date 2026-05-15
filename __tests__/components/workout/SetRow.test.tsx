import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import { SetRow } from '@/components/workout/SetRow';

describe('SetRow', () => {
  it('renders default variant and triggers input/toggle callbacks', () => {
    const onKgChange = jest.fn();
    const onRepsChange = jest.fn();
    const onToggle = jest.fn();

    const { getByDisplayValue, getByText } = render(
      <SetRow
        setNumber={1}
        previous="70kg x 8"
        kg="70"
        reps="8"
        rpe="RPE"
        onKgChange={onKgChange}
        onRepsChange={onRepsChange}
        onToggle={onToggle}
      />,
    );

    fireEvent.changeText(getByDisplayValue('70'), '72.5');
    fireEvent.changeText(getByDisplayValue('8'), '10');
    fireEvent.press(getByText('check'));

    expect(onKgChange).toHaveBeenCalledWith('72.5');
    expect(onRepsChange).toHaveBeenCalledWith('10');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('uses parsed placeholders from decimal previous values', () => {
    const { getByPlaceholderText } = render(
      <SetRow
        setNumber={2}
        previous="50.5 kg x 10"
        kg=""
        reps=""
        rpe="8"
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
      />,
    );

    expect(getByPlaceholderText('50.5')).toBeTruthy();
    expect(getByPlaceholderText('10')).toBeTruthy();
  });

  it('uses fallback placeholders when previous cannot be parsed', () => {
    const { getAllByPlaceholderText } = render(
      <SetRow
        setNumber={3}
        previous="previous unavailable"
        kg=""
        reps=""
        rpe="RPE"
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
      />,
    );

    expect(getAllByPlaceholderText('-')).toHaveLength(2);
  });

  it('renders achievement variant label and icon', () => {
    const { getByText } = render(
      <SetRow
        setNumber={4}
        previous="80kg x 5"
        kg="80"
        reps="5"
        rpe="9"
        variant="achievement"
        achievementLabel="PR"
      />,
    );

    expect(getByText('workspace-premium')).toBeTruthy();
    expect(getByText('PR')).toBeTruthy();
  });
});
