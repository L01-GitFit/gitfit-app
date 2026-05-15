import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@/components/EditScreenInfo', () => {
  const { Text } = require('react-native');
  return {
    EditScreenInfo: ({ path }: { path: string }) => <Text>{`Path: ${path}`}</Text>,
  };
});

import { ScreenContent } from '@/components/ScreenContent';

describe('ScreenContent', () => {
  it('renders title and path info', () => {
    const { getByText } = render(<ScreenContent title="Dashboard" path="app/home.tsx" />);

    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Path: app/home.tsx')).toBeTruthy();
  });

  it('renders optional children', () => {
    const { getByText } = render(
      <ScreenContent title="Profile" path="app/profile.tsx">
        <Text>Child content</Text>
      </ScreenContent>,
    );

    expect(getByText('Child content')).toBeTruthy();
  });
});
