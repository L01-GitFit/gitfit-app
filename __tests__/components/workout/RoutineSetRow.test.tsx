import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import RoutineSetRow from '@/components/workout/RoutineSetRow';

describe('RoutineSetRow', () => {
  it('renders set number and supports kg/reps changes', () => {
    const onKgChange = jest.fn();
    const onRepsChange = jest.fn();

    const { getByDisplayValue, getByText } = render(
      <RoutineSetRow
        setNumber={1}
        kg="50"
        reps="8"
        onKgChange={onKgChange}
        onRepsChange={onRepsChange}
        onDelete={jest.fn()}
      />,
    );

    expect(getByText('1')).toBeTruthy();

    fireEvent.changeText(getByDisplayValue('50'), '55');
    fireEvent.changeText(getByDisplayValue('8'), '10');

    expect(onKgChange).toHaveBeenCalledWith('55');
    expect(onRepsChange).toHaveBeenCalledWith('10');
  });

  it('renders delete icon background', () => {
    const { getByText } = render(
      <RoutineSetRow
        setNumber={2}
        kg=""
        reps=""
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(getByText('delete')).toBeTruthy();
  });
});
