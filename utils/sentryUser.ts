import * as Sentry from '@sentry/react-native';
import type { AuthUser } from '@/store/authStore';

export function identifySentryUser(user: AuthUser): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  // Role can be segmented in dashboards; default to app-member for this app.
  Sentry.setTag('user_role', 'app-member');
}

export function clearSentryUser(): void {
  Sentry.setUser(null);
}
