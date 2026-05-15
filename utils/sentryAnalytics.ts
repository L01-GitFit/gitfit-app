import * as Sentry from '@sentry/react-native';

type EventPayload = Record<string, string | number | boolean | null | undefined>;

function trackEngagementEvent(eventName: string, payload: EventPayload): void {
  Sentry.withScope((scope) => {
    scope.setLevel('info');
    scope.setTag('metric_category', 'user_engagement');
    scope.setTag('engagement_event', eventName);
    scope.setContext('event_payload', payload);

    Sentry.captureMessage(`engagement:${eventName}`);
  });
}

export function trackWorkoutSessionStarted(payload: {
  sessionId: string;
  source: 'empty' | 'routine' | 'resume';
  routineId?: string;
  routineName?: string;
}): void {
  trackEngagementEvent('workout_session_started', payload);
}

export function trackWorkoutLogged(payload: {
  sessionId: string;
  completedSets: number;
  totalVolumeKg: number;
  durationSeconds: number;
  exerciseCount: number;
}): void {
  trackEngagementEvent('workout_logged', payload);
}

export function trackProgressChartViewed(payload: {
  chartType: 'history_detail';
  sessionId: string;
}): void {
  trackEngagementEvent('progress_chart_viewed', payload);
}
