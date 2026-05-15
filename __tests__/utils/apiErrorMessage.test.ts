import { toApiErrorMessage } from '@/utils/apiErrorMessage';

describe('toApiErrorMessage', () => {
  const fallback = 'Unable to connect to the server. Please check your internet and try again.';

  it('returns fallback when message is missing', () => {
    expect(toApiErrorMessage()).toBe(fallback);
    expect(toApiErrorMessage('')).toBe(fallback);
    expect(toApiErrorMessage('   ')).toBe(fallback);
  });

  it('returns fallback for network-style errors (case-insensitive)', () => {
    expect(toApiErrorMessage('Network Error')).toBe(fallback);
    expect(toApiErrorMessage('Request TIMED OUT while connecting')).toBe(fallback);
    expect(toApiErrorMessage('failed to fetch resource')).toBe(fallback);
    expect(toApiErrorMessage('socket hang up')).toBe(fallback);
    expect(toApiErrorMessage('offline mode')).toBe(fallback);
  });

  it('returns the original message for non-network errors', () => {
    expect(toApiErrorMessage('Invalid credentials')).toBe('Invalid credentials');
    expect(toApiErrorMessage('Email already exists')).toBe('Email already exists');
  });
});