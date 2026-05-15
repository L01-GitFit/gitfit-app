const NETWORK_KEYWORDS = [
  'network error',
  'failed to fetch',
  'timeout',
  'timed out',
  'connection',
  'socket',
  'offline',
];

export function toApiErrorMessage(rawMessage?: string): string {
  const message = rawMessage?.trim();

  if (!message) {
    return 'Unable to connect to the server. Please check your internet and try again.';
  }

  const normalized = message.toLowerCase();
  const isNetworkError = NETWORK_KEYWORDS.some((keyword) => normalized.includes(keyword));

  if (isNetworkError) {
    return 'Unable to connect to the server. Please check your internet and try again.';
  }

  return message;
}