import { env } from '@/config/env';
import { logger } from '@/lib/logger';

/**
 * Cliente HTTP base del proyecto.
 *
 * Wrapper sobre fetch nativo. Si en el futuro se necesita axios (interceptors
 * complejos, cancelación, etc.), reemplazar la implementación interna sin
 * cambiar la API pública.
 */

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type RequestBody = Record<string, unknown> | unknown[] | FormData;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token holder — el feature de auth lo actualiza al hacer login/logout.
// No exportar — usar `apiClient.setAuthToken()`.
let authToken: string | null = null;

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(path, env.EXPO_PUBLIC_API_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  body?: RequestBody,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.params);
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    logger.error('API request failed', { url, status: response.status, errorBody });
    throw new ApiError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      errorBody,
    );
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: RequestBody, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: RequestBody, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: RequestBody, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
  setAuthToken: (token: string | null) => {
    authToken = token;
  },
};
