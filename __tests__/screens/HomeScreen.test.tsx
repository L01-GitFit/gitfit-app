import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('@/services/gitfit.service', () => ({
  __esModule: true,
  default: {
    getMyProfile: jest.fn(),
    getWorkoutSessions: jest.fn(),
    getWorkoutSessionById: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@react-native-vector-icons/material-icons', () => {
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

const profileData = { username: 'tay' };
const sessionSummary = {
  id: 'session-1',
  name: 'Upper Body Day',
  durationSeconds: 3600,
  totalVolumeKg: 4250,
  startedAt: '2026-05-14T03:00:00.000Z',
};
const sessionDetail = {
  id: 'session-1',
  workoutSets: [
    {
      id: 'set-1',
      exerciseId: 'exercise-1',
      setNumber: 1,
      reps: 8,
      weightKg: 70,
      durationSeconds: null,
      distanceMeters: null,
      rpe: null,
      isWarmup: false,
      isPr: true,
      loggedAt: '2026-05-14T03:00:00.000Z',
      exercise: { id: 'exercise-1', name: 'Bench Press', gifUrl: null },
    },
    {
      id: 'set-2',
      exerciseId: 'exercise-1',
      setNumber: 2,
      reps: 6,
      weightKg: 72.5,
      durationSeconds: null,
      distanceMeters: null,
      rpe: null,
      isWarmup: false,
      isPr: false,
      loggedAt: '2026-05-14T03:05:00.000Z',
      exercise: { id: 'exercise-1', name: 'Bench Press', gifUrl: null },
    },
  ],
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((options: { queryKey: unknown[] }) => {
    const key = options.queryKey;

    if (key[0] === 'profile') {
      return { data: profileData, isLoading: false };
    }

    if (key[0] === 'sessions') {
      return { data: { data: [sessionSummary] }, isLoading: false };
    }

    if (key[0] === 'home-session-details') {
      return { data: { 'session-1': sessionDetail }, isLoading: false };
    }

    return { data: undefined, isLoading: false };
  }),
}));

import Home from '@/app/(tabs)/home';

beforeEach(() => {
  mockPush.mockClear();
});

describe('Home screen', () => {
  it('renders a completed workout card', () => {
    const { getByText } = render(<Home />);

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('tay')).toBeTruthy();
    expect(getByText('Upper Body Day')).toBeTruthy();
    expect(getByText('2 sets Bench Press')).toBeTruthy();
  });

  it('opens workout detail when a session card is pressed', () => {
    const { getByText } = render(<Home />);

    fireEvent.press(getByText('Upper Body Day'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/workout-detail',
      params: { sessionId: 'session-1' },
    });
  });
});