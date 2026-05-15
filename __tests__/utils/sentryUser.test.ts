const mockSetUser = jest.fn();
const mockSetTag = jest.fn();

jest.mock('@sentry/react-native', () => ({
  __esModule: true,
  setUser: (...args: any[]) => mockSetUser(...args),
  setTag: (...args: any[]) => mockSetTag(...args),
}));

import { clearSentryUser, identifySentryUser } from '@/utils/sentryUser';

describe('sentryUser utils', () => {
  beforeEach(() => {
    mockSetUser.mockClear();
    mockSetTag.mockClear();
  });

  it('identifySentryUser sets user context and role tag', () => {
    const user = {
      id: 'user-1',
      email: 'user@example.com',
      username: 'gitfit-user',
    };

    identifySentryUser(user as any);

    expect(mockSetUser).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'user@example.com',
      username: 'gitfit-user',
    });
    expect(mockSetTag).toHaveBeenCalledWith('user_role', 'app-member');
  });

  it('clearSentryUser clears sentry identity', () => {
    clearSentryUser();

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});
