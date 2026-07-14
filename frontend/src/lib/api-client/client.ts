import { getAccessToken } from "../auth/tokens";
import type { ApiClient, ApiClientConfig, ApiRequestOptions } from "./types";
import { ApiErrorClass } from "./errors";

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([408, 429, 502, 503, 504]);

function buildUrl(baseUrl: string, path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${baseUrl}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.pathname + url.search;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: { error?: string; message?: string; code?: string } = {};
    try {
      body = await response.json();
    } catch {
      // non-json body
    }
    throw new ApiErrorClass(
      response.status,
      body.error ?? body.message ?? response.statusText,
      body.code,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, init);

      if (attempt < retries && RETRYABLE_STATUSES.has(response.status)) {
        const delay = Math.min(1000 * 2 ** attempt, 4000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 4000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw new ApiErrorClass(0, "Max retries exceeded");
}

function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  const cfg: ApiClientConfig = {
    baseUrl: config?.baseUrl ?? "/api/v1",
    getAccessToken: config?.getAccessToken ?? getAccessToken,
    onTokenRefresh: config?.onTokenRefresh,
    onAuthFailure: config?.onAuthFailure,
  };

  async function request<T>(method: string, path: string, options?: ApiRequestOptions): Promise<T> {
    const headers: Record<string, string> = {
      ...(options?.headers ?? {}),
    };

    if (!options?.skipAuth) {
      const token = cfg.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    if (options?.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const url = buildUrl(cfg.baseUrl, path, options?.params);

    const init: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (options?.body) {
      init.body = JSON.stringify(options.body);
    }

    const response = await fetchWithRetry(url, init);

    if (response.status === 401 && !options?.skipAuth && cfg.onTokenRefresh) {
      try {
        await cfg.onTokenRefresh();
        const token = cfg.getAccessToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
          const retryInit: RequestInit = { ...init, headers };
          const retryResponse = await fetchWithRetry(url, retryInit);
          return handleResponse<T>(retryResponse);
        }
      } catch {
        cfg.onAuthFailure?.();
        throw new ApiErrorClass(401, "Session expired");
      }
    }

    return handleResponse<T>(response);
  }

  return {
    get: <T>(path: string, options?: ApiRequestOptions) => request<T>("GET", path, options),
    post: <T>(path: string, options?: ApiRequestOptions) => request<T>("POST", path, options),
    put: <T>(path: string, options?: ApiRequestOptions) => request<T>("PUT", path, options),
    patch: <T>(path: string, options?: ApiRequestOptions) => request<T>("PATCH", path, options),
    delete: <T>(path: string, options?: ApiRequestOptions) => request<T>("DELETE", path, options),
  };
}

export const apiClient = createApiClient();
export { createApiClient };
