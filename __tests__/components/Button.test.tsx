import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders its title', () => {
    const { getByText } = render(<Button title="Save" />);

    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Save" onPress={onPress} />);

    fireEvent.press(getByText('Save'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});