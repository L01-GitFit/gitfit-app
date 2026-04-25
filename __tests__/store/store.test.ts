import { useStore } from '@/store/store';

const initialState = useStore.getState();

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState(initialState, true);
  });

  it('starts with zero bears', () => {
    expect(useStore.getState().bears).toBe(0);
  });

  it('increments the bear count', () => {
    useStore.getState().increasePopulation();

    expect(useStore.getState().bears).toBe(1);
  });

  it('updates and clears the bear count', () => {
    useStore.getState().updateBears(5);
    expect(useStore.getState().bears).toBe(5);

    useStore.getState().removeAllBears();
    expect(useStore.getState().bears).toBe(0);
  });
});