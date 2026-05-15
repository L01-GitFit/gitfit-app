import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Animated, PanResponder } from 'react-native';

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

import { SetRow } from '@/components/workout/SetRow';

describe('SetRow', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('renders static kg and reps text when input callbacks are not provided', () => {
    const { getByText, queryByDisplayValue } = render(
      <SetRow
        setNumber={5}
        previous="90kg x 3"
        kg="90"
        reps="3"
        rpe="8.5"
        variant="completed"
        checked
      />,
    );

    expect(getByText('90')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('8.5')).toBeTruthy();
    expect(queryByDisplayValue('90')).toBeNull();
    expect(queryByDisplayValue('3')).toBeNull();
  });

  it('deletes on swipe when release passes a layout-based threshold', () => {
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

    const screen = render(
      <SetRow
        setNumber={6}
        previous="75kg x 6"
        kg="75"
        reps="6"
        rpe="RPE"
        onKgChange={jest.fn()}
        onRepsChange={jest.fn()}
        onDelete={onDelete}
      />,
    );

    const config = createdConfigs[0];
    const layoutNode = screen.UNSAFE_root.find((node) => typeof node.props.onLayout === 'function');
    layoutNode.props.onLayout({ nativeEvent: { layout: { width: 100 } } });

    expect(config.onStartShouldSetPanResponder()).toBe(false);
    expect(config.onMoveShouldSetPanResponder({}, { dx: -30, dy: 3 })).toBe(true);
    expect(config.onMoveShouldSetPanResponder({}, { dx: 10, dy: 0 })).toBe(false);
    expect(config.onPanResponderTerminationRequest()).toBe(false);
    expect(config.onShouldBlockNativeResponder()).toBe(true);

    config.onPanResponderGrant();
    expect(stopAnimationSpy).toHaveBeenCalled();

    config.onPanResponderMove({}, { dx: -30 });
    config.onPanResponderMove({}, { dx: -200 });

    expect(setValueSpy).toHaveBeenCalledWith(-30);
    expect(setValueSpy).toHaveBeenCalledWith(-110);

    config.onPanResponderRelease({}, { dx: -50 });

    expect(timingStart).toHaveBeenCalledTimes(1);
    expect(setValueSpy).toHaveBeenCalledWith(0);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('springs back when swipe release does not meet threshold and on terminate', () => {
    const createdConfigs: Array<Record<string, any>> = [];
    const springStart = jest.fn();

    jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
      createdConfigs.push(config as Record<string, any>);
      return { panHandlers: {} } as any;
    });
    jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn() } as any);
    const springSpy = jest.spyOn(Animated, 'spring').mockReturnValue({ start: springStart } as any);

    render(
      <SetRow
        setNumber={7}
        previous="60kg x 10"
        kg="60"
        reps="10"
        rpe="7"
      />,
    );

    const config = createdConfigs[0];

    config.onPanResponderRelease({}, { dx: -20 });
    config.onPanResponderTerminate();

    expect(springSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0, useNativeDriver: true }),
    );
    expect(springStart).toHaveBeenCalledTimes(2);
  });
});
