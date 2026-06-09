type RequestOptions<T> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  mock?: () => T | Promise<T>;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<T> {
  if (!API_BASE_URL && options.mock) {
    return options.mock();
  }

  if (!API_BASE_URL) {
    throw new Error('API server is not configured');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error('Ошибка при обращении к серверу');
  }

  return response.json() as Promise<T>;
}
