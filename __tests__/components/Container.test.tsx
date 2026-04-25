import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Container } from '@/components/Container';

describe('Container', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <Container>
        <Text>Wrapped content</Text>
      </Container>
    );

    expect(getByText('Wrapped content')).toBeTruthy();
  });
});