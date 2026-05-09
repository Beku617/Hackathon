import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const normalizeUrl = (value: string): string => value.replace(/\/+$/, '');

const getExpoHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
};

const resolveBaseUrl = (): string => {
  const explicit = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicit) return normalizeUrl(explicit);

  const expoHost = getExpoHost();
  if (expoHost) return `http://${expoHost}:3000`;

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
