import { render } from '@testing-library/react-native';

import Home from '@/app/(tabs)/index';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

describe('Home screen', () => {
  // ── Test 1: renders without crashing ─────────────────────────────────────
  it('does not crash on initial render', () => {
    expect(() => render(<Home />)).not.toThrow();
  });

  // ── Test 2: renders the correct title and file path ──────────────────────
  it('renders the title and file path', () => {
    const { getByText } = render(<Home />);

    expect(getByText('Tab One')).toBeTruthy();
    expect(getByText('app/(tabs)/index.tsx')).toBeTruthy();
  });

  // ── Test 3: title text is present in the rendered output ─────────────────
  it('displays "Tab One" as heading text', () => {
    const { getAllByText } = render(<Home />);
    // getByText ensures at least one node with exact text exists
    const headings = getAllByText('Tab One');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  // ── Test 4: re-rendering does not throw ───────────────────────────────────
  it('re-renders without crashing', () => {
    const { rerender } = render(<Home />);
    expect(() => rerender(<Home />)).not.toThrow();
  });
});