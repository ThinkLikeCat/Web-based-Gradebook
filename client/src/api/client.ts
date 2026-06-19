import type { AuthTokens } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const STORAGE_KEY = 'gradebook_auth';

export function getTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  mock?: () => unknown | Promise<unknown>;
};

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens({ token: data.token, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL && options.mock) {
    return Promise.resolve(options.mock()) as Promise<T>;
  }

  if (!API_BASE_URL) {
    throw new Error('API server is not configured');
  }

  const tokens = getTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (tokens?.token) {
    headers['Authorization'] = `Bearer ${tokens.token}`;
  }

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && tokens?.refreshToken) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      const newTokens = getTokens()!;
      headers['Authorization'] = `Bearer ${newTokens.token}`;
      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Ошибка при обращении к серверу');
  }

  return res.json() as Promise<T>;
}
