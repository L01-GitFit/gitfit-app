import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const { Text, View } = require('react-native');

  const StackComponent = ({
    children,
    screenOptions,
  }: {
    children?: React.ReactNode;
    screenOptions?: { headerShown?: boolean; animation?: string };
  }) => (
    <View>
      <Text>{`stack-header:${String(screenOptions?.headerShown)}`}</Text>
      <Text>{`stack-animation:${String(screenOptions?.animation)}`}</Text>
      {children}
    </View>
  );

  (StackComponent as any).Screen = ({ name }: { name: string }) => <Text>{`screen:${name}`}</Text>;

  return {
    Stack: StackComponent,
  };
});

import AuthLayout from '@/app/(auth)/_layout';

describe('AuthLayout', () => {
  it('renders auth stack with hidden header and fade animation', () => {
    const { getByText } = render(<AuthLayout />);

    expect(getByText('stack-header:false')).toBeTruthy();
    expect(getByText('stack-animation:fade')).toBeTruthy();
  });

  it('registers expected auth screens', () => {
    const { getByText, queryByText } = render(<AuthLayout />);

    expect(getByText('screen:onboarding')).toBeTruthy();
    expect(getByText('screen:signin')).toBeTruthy();
    expect(getByText('screen:signup')).toBeTruthy();
    expect(getByText('screen:forgot-password')).toBeTruthy();
    expect(getByText('screen:reset-password')).toBeTruthy();

    // login screen is currently commented out in layout.
    expect(queryByText('screen:login')).toBeNull();
  });
});
