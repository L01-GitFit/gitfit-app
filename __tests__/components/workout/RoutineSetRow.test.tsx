import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Animated, PanResponder } from 'react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import RoutineSetRow from '@/components/workout/RoutineSetRow';

describe('RoutineSetRow', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('renders placeholders for empty kg and reps', () => {
    const { getAllByPlaceholderText } = render(
      <RoutineSetRow
        setNumber={3}
        kg=""
        reps=""
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(getAllByPlaceholderText('-')).toHaveLength(2);
  });

  it('handles swipe delete when release passes the default threshold', () => {
    const createdConfigs: Array<Record<string, any>> = [];
    const onDelete = jest.fn();
    const setValueSpy = jest
      .spyOn(Animated.Value.prototype, 'setValue')
      .mockImplementation(() => undefined);
    const stopAnimationSpy = jest
      .spyOn(Animated.Value.prototype, 'stopAnimation')
      .mockImplementation(() => undefined);
    const timingStart = jest.fn((callback?: () => void) => callback?.());

    jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
      createdConfigs.push(config as Record<string, any>);
      return { panHandlers: {} } as any;
    });
    jest.spyOn(Animated, 'timing').mockReturnValue({ start: timingStart } as any);
    jest.spyOn(Animated, 'spring').mockReturnValue({ start: jest.fn() } as any);

    render(
      <RoutineSetRow
        setNumber={4}
        kg="40"
        reps="12"
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
        onDelete={onDelete}
      />,
    );

    const config = createdConfigs[0];

    expect(config.onStartShouldSetPanResponder()).toBe(false);
    expect(config.onMoveShouldSetPanResponder({}, { dx: -20, dy: 2 })).toBe(true);
    expect(config.onMoveShouldSetPanResponder({}, { dx: -6, dy: 1 })).toBe(false);
    expect(config.onMoveShouldSetPanResponder({}, { dx: -20, dy: 30 })).toBe(false);
    expect(config.onPanResponderTerminationRequest()).toBe(false);
    expect(config.onShouldBlockNativeResponder()).toBe(true);

    config.onPanResponderGrant();
    expect(stopAnimationSpy).toHaveBeenCalled();

    config.onPanResponderMove({}, { dx: -25 });
    config.onPanResponderMove({}, { dx: -200 });
    config.onPanResponderMove({}, { dx: 18 });

    expect(setValueSpy).toHaveBeenCalledWith(-25);
    expect(setValueSpy).toHaveBeenCalledWith(-110);

    config.onPanResponderRelease({}, { dx: -81 });

    expect(timingStart).toHaveBeenCalledTimes(1);
    expect(setValueSpy).toHaveBeenCalledWith(0);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('springs back when release does not pass the threshold or the gesture terminates', () => {
    const createdConfigs: Array<Record<string, any>> = [];
    const springStart = jest.fn();

    jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
      createdConfigs.push(config as Record<string, any>);
      return { panHandlers: {} } as any;
    });
    jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn() } as any);
    const springSpy = jest.spyOn(Animated, 'spring').mockReturnValue({ start: springStart } as any);

    render(
      <RoutineSetRow
        setNumber={5}
        kg=""
        reps=""
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const config = createdConfigs[0];

    config.onPanResponderRelease({}, { dx: -40 });
    config.onPanResponderTerminate();

    expect(springSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0, useNativeDriver: true }),
    );
    expect(springStart).toHaveBeenCalledTimes(2);
  });
});
