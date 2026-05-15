type AuthStateSnapshot = {
  accessToken?: string | null;
  refreshToken?: string | null;
  setTokens?: jest.Mock;
  clearAuth?: jest.Mock;
};

let mockState: AuthStateSnapshot = {};
const mockClearSentryUser = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  __mockApiClient: Object.assign(jest.fn(), {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }),
  __mockPost: jest.fn(),
  default: {
    create: jest.fn(function create() {
      return (require('axios') as any).__mockApiClient;
    }),
    post: jest.fn(function post(...args: unknown[]) {
      return (require('axios') as any).__mockPost(...args);
    }),
  },
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: () => mockState,
  },
}));

jest.mock('@/utils/sentryUser', () => ({
  clearSentryUser: () => mockClearSentryUser(),
}));

function loadApiClientModule() {
  jest.resetModules();
  process.env.EXPO_PUBLIC_BACKEND_URL = 'https://api.test.local';

  const { apiClient } = require('@/utils/apiClient') as { apiClient: any };
  const axiosModule = require('axios') as {
    __mockApiClient: any;
    __mockPost: jest.Mock;
  };

  const requestInterceptor =
    (axiosModule.__mockApiClient.interceptors.request.use as jest.Mock).mock.calls[0][0];
  const responseSuccessInterceptor =
    (axiosModule.__mockApiClient.interceptors.response.use as jest.Mock).mock.calls[0][0];
  const responseErrorInterceptor =
    (axiosModule.__mockApiClient.interceptors.response.use as jest.Mock).mock.calls[0][1];

  return {
    apiClient,
    mockApiClient: axiosModule.__mockApiClient,
    mockAxiosPost: axiosModule.__mockPost,
    requestInterceptor,
    responseSuccessInterceptor,
    responseErrorInterceptor,
  };
}

describe('apiClient interceptors', () => {
  beforeEach(() => {
    mockState = {};
    mockClearSentryUser.mockReset();
  });

  it('attaches access token in request interceptor when token exists', () => {
    const { requestInterceptor } = loadApiClientModule();
    mockState = { accessToken: 'access-1' };
    const config = { headers: {} as Record<string, string> };

    const result = requestInterceptor(config);

    expect(result).toBe(config);
    expect(config.headers.Authorization).toBe('Bearer access-1');
  });

  it('does not attach token when access token is missing', () => {
    const { requestInterceptor } = loadApiClientModule();
    mockState = { accessToken: null };
    const config = { headers: {} as Record<string, string> };

    requestInterceptor(config);

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('passes successful responses through unchanged', () => {
    const { responseSuccessInterceptor } = loadApiClientModule();
    const response = { data: { hello: 'world' } };

    expect(responseSuccessInterceptor(response)).toBe(response);
  });

  it('clears auth and rejects when 401 occurs without refresh token', async () => {
    const { responseErrorInterceptor, mockAxiosPost } = loadApiClientModule();
    const clearAuth = jest.fn();
    mockState = {
      refreshToken: null,
      setTokens: jest.fn(),
      clearAuth,
    };
    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(mockClearSentryUser).toHaveBeenCalledTimes(1);
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it('refreshes token and retries original request on 401', async () => {
    const { responseErrorInterceptor, mockApiClient, mockAxiosPost } = loadApiClientModule();
    const setTokens = jest.fn();
    const clearAuth = jest.fn();
    mockState = {
      refreshToken: 'refresh-1',
      setTokens,
      clearAuth,
    };
    mockAxiosPost.mockResolvedValue({
      data: { success: true, data: { accessToken: 'access-next' } },
    });
    mockApiClient.mockResolvedValueOnce({ data: { retried: true } });
    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    const result = await responseErrorInterceptor(error);

    expect(mockAxiosPost).toHaveBeenCalledWith(
      'https://api.test.local/auth/refresh',
      null,
      { headers: { Authorization: 'Bearer refresh-1' } },
    );
    expect(setTokens).toHaveBeenCalledWith({
      accessToken: 'access-next',
      refreshToken: 'refresh-1',
    });
    expect(error.config.headers.Authorization).toBe('Bearer access-next');
    expect(mockApiClient).toHaveBeenCalledWith(error.config);
    expect(clearAuth).not.toHaveBeenCalled();
    expect(result).toEqual({ data: { retried: true } });
  });

  it('clears auth when token refresh fails', async () => {
    const { responseErrorInterceptor, mockApiClient, mockAxiosPost } = loadApiClientModule();
    const clearAuth = jest.fn();
    mockState = {
      refreshToken: 'refresh-1',
      setTokens: jest.fn(),
      clearAuth,
    };
    mockAxiosPost.mockRejectedValue(new Error('refresh failed'));
    const error = {
      response: { status: 401 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(mockClearSentryUser).toHaveBeenCalledTimes(1);
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('rejects non-401 errors without refresh flow', async () => {
    const { responseErrorInterceptor, mockAxiosPost } = loadApiClientModule();
    mockState = {
      refreshToken: 'refresh-1',
      setTokens: jest.fn(),
      clearAuth: jest.fn(),
    };
    const error = {
      response: { status: 500 },
      config: { headers: {} as Record<string, string> },
    };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it('does not retry when request already has _retry flag', async () => {
    const { responseErrorInterceptor, mockAxiosPost } = loadApiClientModule();
    mockState = {
      refreshToken: 'refresh-1',
      setTokens: jest.fn(),
      clearAuth: jest.fn(),
    };
    const error = {
      response: { status: 401 },
      config: { _retry: true, headers: {} as Record<string, string> },
    };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });
});
