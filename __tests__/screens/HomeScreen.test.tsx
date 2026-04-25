import { render } from '@testing-library/react-native';

import Home from '@/app/(tabs)/index';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

describe('Home screen', () => {
  it('renders the title and file path', () => {
    const { getByText } = render(<Home />);

    expect(getByText('Tab One')).toBeTruthy();
    expect(getByText('app/(tabs)/index.tsx')).toBeTruthy();
  });
});