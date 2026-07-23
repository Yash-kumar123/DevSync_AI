import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/auth-store';
import type { User } from '@types';

// =============================================================================
// DevSync AI — Axios HTTP Client
// Singleton Axios instance with:
//   1. Request interceptor — attaches Authorization Bearer header
//   2. Response interceptor — handles 401s with silent token refresh + retry
// =============================================================================

/** Base URL for all API calls. Uses VITE_GATEWAY_HTTP_URL or VITE_API_URL if configured, defaulting to /api for dev proxy. */
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_GATEWAY_HTTP_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const BASE_URL = getApiBaseUrl();

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send cookies (refresh token) on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token
// ---------------------------------------------------------------------------

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — silent refresh on 401
// ---------------------------------------------------------------------------

/** Flag to prevent multiple simultaneous refresh calls. */
let isRefreshing = false;

/** Queue of failed requests waiting for the token to be refreshed. */
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

http.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh for 401 errors that haven't been retried yet,
    // and not for the refresh/logout endpoints themselves (avoids infinite loops)
    const isAuthEndpoint =
      originalRequest.url?.includes('/v1/auth/refresh') ||
      originalRequest.url?.includes('/v1/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            }
            return http(originalRequest);
          })
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh — refresh token is sent automatically via cookie
        const response = await http.post<{
          data: { accessToken: string; expiresAt: number; user: User };
        }>('/v1/auth/refresh');

        const { accessToken, expiresAt, user } = response.data.data;
        useAuthStore.getState().setAuth(user, accessToken, expiresAt);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
        }

        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear auth and let the caller handle it
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
