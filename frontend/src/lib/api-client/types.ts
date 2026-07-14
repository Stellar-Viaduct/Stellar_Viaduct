export interface ApiRequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  onTokenRefresh?: () => Promise<string>;
  onAuthFailure?: () => void;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiClient {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  put<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  patch<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}
