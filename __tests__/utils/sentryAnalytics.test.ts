const mockSetLevel = jest.fn();
const mockSetTag = jest.fn();
const mockSetContext = jest.fn();
const mockCaptureMessage = jest.fn();

jest.mock('@sentry/react-native', () => ({
  __esModule: true,
  withScope: (callback: (scope: any) => void) => {
    callback({
      setLevel: mockSetLevel,
      setTag: mockSetTag,
      setContext: mockSetContext,
    });
  },
  captureMessage: (...args: any[]) => mockCaptureMessage(...args),
}));

import {
  trackProgressChartViewed,
  trackWorkoutLogged,
  trackWorkoutSessionStarted,
} from '@/utils/sentryAnalytics';

describe('sentryAnalytics', () => {
  beforeEach(() => {
    mockSetLevel.mockClear();
    mockSetTag.mockClear();
    mockSetContext.mockClear();
    mockCaptureMessage.mockClear();
  });

  it('tracks workout_session_started payload', () => {
    const payload = {
      sessionId: 'session-1',
      source: 'routine' as const,
      routineId: 'routine-1',
      routineName: 'Push Day',
    };

    trackWorkoutSessionStarted(payload);

    expect(mockSetLevel).toHaveBeenCalledWith('info');
    expect(mockSetTag).toHaveBeenCalledWith('metric_category', 'user_engagement');
    expect(mockSetTag).toHaveBeenCalledWith('engagement_event', 'workout_session_started');
    expect(mockSetContext).toHaveBeenCalledWith('event_payload', payload);
    expect(mockCaptureMessage).toHaveBeenCalledWith('engagement:workout_session_started');
  });

  it('tracks workout_logged payload', () => {
    const payload = {
      sessionId: 'session-2',
      completedSets: 12,
      totalVolumeKg: 3200,
      durationSeconds: 1800,
      exerciseCount: 5,
    };

    trackWorkoutLogged(payload);

    expect(mockSetTag).toHaveBeenCalledWith('engagement_event', 'workout_logged');
    expect(mockSetContext).toHaveBeenCalledWith('event_payload', payload);
    expect(mockCaptureMessage).toHaveBeenCalledWith('engagement:workout_logged');
  });

  it('tracks progress_chart_viewed payload', () => {
    const payload = {
      chartType: 'history_detail' as const,
      sessionId: 'session-3',
    };

    trackProgressChartViewed(payload);

    expect(mockSetTag).toHaveBeenCalledWith('engagement_event', 'progress_chart_viewed');
    expect(mockSetContext).toHaveBeenCalledWith('event_payload', payload);
    expect(mockCaptureMessage).toHaveBeenCalledWith('engagement:progress_chart_viewed');
  });
});
