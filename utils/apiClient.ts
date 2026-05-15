import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { clearSentryUser } from '@/utils/sentryUser';

/**
 * Base URL is read from the Expo public environment variable.
 * Set PUBLIC_EXPO_BACKEND_URL in your .env file.
 * e.g.  PUBLIC_EXPO_BACKEND_URL=https://api.gitfit.app
 */
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
//console.log(`API Client configured with base URL: ${BASE_URL}`);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor — attach access token ───────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 and attempt token refresh ─────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

      if (!refreshToken) {
        clearSentryUser();
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          `${BASE_URL}/auth/refresh`,
          null,
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        const nextAccessToken = data.data.accessToken;
        setTokens({ accessToken: nextAccessToken, refreshToken });
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return apiClient(originalRequest);
      } catch {
        clearSentryUser();
        clearAuth();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
