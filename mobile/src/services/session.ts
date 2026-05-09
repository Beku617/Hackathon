import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from './auth';

const AUTH_USER_STORAGE_KEY = 'auth_user';
const PROFILE_AVATAR_STORAGE_KEY = 'profile_avatar_uri';
const AUTH_TOKEN_STORAGE_KEY = 'auth_token';
const SESSION_STORAGE_KEYS = [
  AUTH_USER_STORAGE_KEY,
  PROFILE_AVATAR_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
] as const;

export const saveCurrentUser = async (user: AuthUser): Promise<void> => {
  await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const stored = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

export const clearCurrentUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export const saveAuthToken = async (token: string): Promise<void> => {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken);
};

export const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const clearAuthToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

export const saveProfileAvatarUri = async (uri: string): Promise<void> => {
  await AsyncStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, uri);
};

export const getProfileAvatarUri = async (): Promise<string | null> => {
  return AsyncStorage.getItem(PROFILE_AVATAR_STORAGE_KEY);
};

export const clearProfileAvatarUri = async (): Promise<void> => {
  await AsyncStorage.removeItem(PROFILE_AVATAR_STORAGE_KEY);
};

export const clearSessionData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([...SESSION_STORAGE_KEYS]);
};
