import { http } from './http';
import type { ApiResponse, User, LoginPayload, RegisterPayload } from '@types';

// =============================================================================
// DevSync AI — Auth API Service
// Typed wrappers around auth-related HTTP calls.
// =============================================================================

/** Shape of the token data returned by login/register/refresh endpoints. */
export interface AuthResponseData {
  user: User;
  accessToken: string;
  expiresAt: number;
}

/**
 * Register a new user account.
 * Sends credentials; receives user profile + access token + sets HttpOnly refresh cookie.
 */
export async function register(payload: RegisterPayload): Promise<AuthResponseData> {
  const response = await http.post<ApiResponse<AuthResponseData>>('/v1/auth/register', payload);
  return response.data.data;
}

/**
 * Log in with email and password.
 * Returns user profile + access token; HttpOnly refresh cookie is set by the server.
 */
export async function login(payload: LoginPayload): Promise<AuthResponseData> {
  const response = await http.post<ApiResponse<AuthResponseData>>('/v1/auth/login', payload);
  return response.data.data;
}

/**
 * Silently refresh the access token using the HttpOnly refresh cookie.
 * Called automatically by the Axios interceptor on 401 responses.
 */
export async function refreshTokens(): Promise<AuthResponseData> {
  const response = await http.post<ApiResponse<AuthResponseData>>('/v1/auth/refresh');
  return response.data.data;
}

/**
 * Log out the current session (clears the refresh token in the DB and cookie).
 */
export async function logout(): Promise<void> {
  await http.post('/v1/auth/logout');
}

/**
 * Fetch the currently authenticated user's profile.
 * Requires a valid access token (attached automatically by the Axios interceptor).
 */
export async function getMe(): Promise<User> {
  const response = await http.get<ApiResponse<{ user: User }>>('/v1/auth/me');
  return response.data.data.user;
}
