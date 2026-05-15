import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => {
  const { Text, View } = require('react-native');

  const StackComponent = ({ screenOptions }: { screenOptions?: { headerShown?: boolean } }) => (
    <Text>{`stack-header:${String(screenOptions?.headerShown)}`}</Text>
  );

  const TabsComponent = ({ children, tabBar }: { children: React.ReactNode; tabBar?: (props: any) => React.ReactNode }) => (
    <View>
      <Text>tabs-root</Text>
      {tabBar ? tabBar({ state: { routes: [] }, descriptors: {}, navigation: {} }) : null}
      {children}
    </View>
  );

  (TabsComponent as any).Screen = ({ name, options }: { name: string; options?: { title?: string } }) => (
    <Text>{`tab:${name}:${options?.title ?? ''}`}</Text>
  );

  return {
    Stack: StackComponent,
    Tabs: TabsComponent,
  };
});

jest.mock('@/components/BottomTabBar', () => {
  const { Text } = require('react-native');
  return function MockBottomTabBar() {
    return <Text>bottom-tab-bar</Text>;
  };
});

import HomeLayout from '@/app/(tabs)/home/_layout';
import ProfileLayout from '@/app/(tabs)/profile/_layout';
import WorkoutLayout from '@/app/(tabs)/workout/_layout';
import TabsLayout from '@/app/(tabs)/_layout';

describe('Tab child layouts', () => {
  it('renders home stack layout with hidden header', () => {
    const { getByText } = render(<HomeLayout />);

    expect(getByText('stack-header:false')).toBeTruthy();
  });

  it('renders profile stack layout with hidden header', () => {
    const { getByText } = render(<ProfileLayout />);

    expect(getByText('stack-header:false')).toBeTruthy();
  });

  it('renders workout stack layout with hidden header', () => {
    const { getByText } = render(<WorkoutLayout />);

    expect(getByText('stack-header:false')).toBeTruthy();
  });
});

describe('Main tabs layout', () => {
  it('renders custom tab bar and three tab screens', () => {
    const { getByText } = render(<TabsLayout />);

    expect(getByText('tabs-root')).toBeTruthy();
    expect(getByText('bottom-tab-bar')).toBeTruthy();
    expect(getByText('tab:home:Home')).toBeTruthy();
    expect(getByText('tab:workout:Workout')).toBeTruthy();
    expect(getByText('tab:profile:Profile')).toBeTruthy();
  });
});
