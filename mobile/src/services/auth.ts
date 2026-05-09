import axios from 'axios';
import api from './api';
import { clearAuthToken, saveAuthToken, saveCurrentUser } from './session';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token?: string;
  user: AuthUser;
}

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Network Error: backend is unreachable. Start server and set EXPO_PUBLIC_API_URL to your PC IP (example: http://192.168.1.10:3000).';
    }
    const responseError =
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ||
      (error.response?.data as { message?: string; error?: string } | undefined)?.error;
    if (responseError) return responseError;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const loginUser = async (
  identifier: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email: identifier.trim().toLowerCase(),
      password,
    });
    await Promise.all([
      saveCurrentUser(response.data.user),
      response.data.token ? saveAuthToken(response.data.token) : clearAuthToken(),
    ]);
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Login failed'));
  }
};

export const registerUser = async (
  username: string,
  fullName: string,
  phone: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Registration failed'));
  }
};
