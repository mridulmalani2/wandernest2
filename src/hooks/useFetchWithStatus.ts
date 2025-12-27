'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Unified Data Fetching Hook
 *
 * This hook consolidates the scattered useEffect + fetch patterns across the codebase
 * into a single, reusable hook with:
 * - Loading, error, and success states
 * - Automatic request abortion on unmount
 * - Retry mechanism with exponential backoff
 * - Request deduplication
 * - Cache support
 *
 * @example
 * const { data, loading, error, refetch } = useFetchWithStatus<Student[]>({
 *   url: '/api/students',
 *   params: { page: 1, status: 'APPROVED' },
 * });
 */

// ============================================
// TYPES
// ============================================

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FetchState<T> {
  data: T | null;
  status: FetchStatus;
  loading: boolean;
  error: string | null;
  isValidating: boolean;
}

export interface FetchOptions<T> {
  /** API endpoint URL */
  url: string;

  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Request body for POST/PUT/PATCH */
  body?: unknown;

  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;

  /** Request headers */
  headers?: Record<string, string>;

  /** Whether to fetch immediately (default: true) */
  immediate?: boolean;

  /** Dependencies that trigger a refetch when changed */
  deps?: unknown[];

  /** Retry count on failure (default: 0) */
  retryCount?: number;

  /** Retry delay in ms (default: 1000) */
  retryDelay?: number;

  /** Cache TTL in ms (0 = no cache, default: 0) */
  cacheTtl?: number;

  /** Transform response data */
  transform?: (data: unknown) => T;

  /** Called on successful fetch */
  onSuccess?: (data: T) => void;

  /** Called on fetch error */
  onError?: (error: string) => void;
}

export interface FetchResult<T> extends FetchState<T> {
  /** Manually trigger a refetch */
  refetch: (overrides?: FetchOverrides) => Promise<void>;

  /** Reset state to initial */
  reset: () => void;

  /** Mutate data locally without refetching */
  mutate: (data: T | ((prev: T | null) => T | null)) => void;
}

// ============================================
// CACHE
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

type FetchOverrides = {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

const cache = new Map<string, CacheEntry<unknown>>();
const MAX_CACHE_ENTRIES = 100;
const MAX_SLEEP_MS = 60_000;
const DEFAULT_RETRY_DELAY_MS = 1_000;

const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_KEY_PATTERN =
  /(password|token|secret|authorization|cookie|session|api[_-]?key|access[_-]?key|refresh[_-]?token)/i;

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitizeValue = (value: unknown, key?: string, seen?: WeakSet<object>): unknown => {
    if (key && isSensitiveKey(key)) {
      return REDACTED_VALUE;
    }

    if (value && typeof value === 'object') {
      if (!seen) {
        seen = new WeakSet<object>();
      }
      if (seen.has(value as object)) {
        return '[Circular]';
      }
      seen.add(value as object);

      if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item, undefined, seen));
      }

      const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([entryKey, entryValue]) => [entryKey, sanitizeValue(entryValue, entryKey, seen)]);

      return Object.fromEntries(entries);
    }

    return value;
  };

  return sanitizeValue(params) as Record<string, unknown>;
}

function stableStringify(value: unknown): string {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return '"[Unserializable]"';
  }
}

function normalizeUrl(value: string): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeParams(
  params?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean | undefined> | undefined {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return undefined;
  }

  const normalizedEntries = Object.entries(params).filter(([, value]) =>
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  );

  if (normalizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(normalizedEntries);
}

function safeClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      return value;
    }
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

function pruneCache(now: number): void {
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  }

  if (cache.size > MAX_CACHE_ENTRIES) {
    const entries = Array.from(cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );
    const toRemove = cache.size - MAX_CACHE_ENTRIES;
    for (let i = 0; i < toRemove; i += 1) {
      cache.delete(entries[i][0]);
    }
  }
}

function getCacheKey(url: string, params?: Record<string, unknown>): string {
  const paramStr = params ? stableStringify(sanitizeParams(params)) : '';
  return `${url}:${paramStr}`;
}

function getFromCache<T>(key: string): { hit: boolean; data: T | null } {
  pruneCache(Date.now());
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return { hit: false, data: null };

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return { hit: false, data: null };
  }

  return { hit: true, data: safeClone(entry.data) };
}

function setCache<T>(key: string, data: T, ttl: number): void {
  if (ttl <= 0) return;

  cache.set(key, {
    data: safeClone(data),
    timestamp: Date.now(),
    ttl,
  });

  pruneCache(Date.now());
}

// ============================================
// HELPERS
// ============================================

function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>
): string {
  if (!params) return baseUrl;

  const [baseWithoutHash, hashFragment] = baseUrl.split('#');
  const [path, existingQuery] = baseWithoutHash.split('?');

  const searchParams = new URLSearchParams(existingQuery || '');
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      searchParams.delete(key);
      for (const entry of value) {
        searchParams.append(key, String(entry));
      }
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  const rebuilt = queryString ? `${path}?${queryString}` : path;
  return hashFragment ? `${rebuilt}#${hashFragment}` : rebuilt;
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  const safeMs = Number.isFinite(ms) && ms >= 0
    ? Math.min(ms, MAX_SLEEP_MS)
    : DEFAULT_RETRY_DELAY_MS;

  if (signal?.aborted) {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    throw abortError;
  }

  return new Promise((resolve, reject) => {
    if (signal) {
      let timer: ReturnType<typeof setTimeout>;
      const onAbort = () => {
        clearTimeout(timer);
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        signal.removeEventListener('abort', onAbort);
        reject(abortError);
      };

      timer = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, safeMs);

      signal.addEventListener('abort', onAbort, { once: true });
      return;
    }

    setTimeout(resolve, safeMs);
  });
}

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return parseJsonSafely(response);
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

// ============================================
// HOOK
// ============================================

export function useFetchWithStatus<T = unknown>(
  options: FetchOptions<T>
): FetchResult<T> {
  const {
    url,
    method = 'GET',
    body,
    params,
    headers,
    immediate = true,
    deps = [],
    retryCount = 0,
    retryDelay = 1000,
    cacheTtl = 0,
    transform,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    status: 'idle',
    loading: false,
    error: null,
    isValidating: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const retryAttemptRef = useRef(0);

  const reset = useCallback(() => {
    setState({
      data: null,
      status: 'idle',
      loading: false,
      error: null,
      isValidating: false,
    });
  }, []);

  const mutate = useCallback((updater: T | ((prev: T | null) => T | null)) => {
    setState((prev) => {
      let newData: T | null;
      try {
        newData = typeof updater === 'function'
          ? (updater as (prev: T | null) => T | null)(prev.data)
          : updater;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update data';
        onError?.(message);
        return {
          ...prev,
          status: 'error',
          loading: false,
          error: message,
          isValidating: false,
        };
      }

      if (cacheTtl > 0 && method === 'GET') {
        const normalizedUrl = normalizeUrl(url);
        const normalizedParams = normalizeParams(params);
        if (normalizedUrl) {
          const cacheKey = getCacheKey(normalizedUrl, normalizedParams);
          setCache(cacheKey, newData, cacheTtl);
        }
        const cacheKey = getCacheKey(url, params);
        setCache(cacheKey, newData, cacheTtl);
      }

      return { ...prev, data: newData };
    });
  }, [cacheTtl, method, onError, params, url]);

  const fetchData = useCallback(async (overrides?: FetchOverrides) => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      setState({
        data: null,
        status: 'error',
        loading: false,
        error: 'Invalid request URL.',
        isValidating: false,
      });
      onError?.('Invalid request URL.');
      return;
    }

    const effectiveParams = normalizeParams(overrides?.params ?? params);
    const effectiveHeaders = { ...headers, ...overrides?.headers };
    const effectiveBody = overrides?.body ?? body;

    // Check cache first
    const cacheKey = getCacheKey(normalizedUrl, effectiveParams);
    if (cacheTtl > 0 && method === 'GET') {
      const cached = getFromCache<T>(cacheKey);
      if (cached.hit) {
        setState({
          data: cached.data,
          status: 'success',
          loading: false,
          error: null,
          isValidating: true,
        });
      }
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      status: prev.data ? 'success' : 'loading',
      isValidating: true,
    }));

    try {
      const fullUrl = buildUrl(normalizedUrl, effectiveParams);

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...effectiveHeaders,
        },
        signal: controller.signal,
      };

      if (effectiveBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(effectiveBody);
      }

      const response = await fetch(fullUrl, fetchOptions);

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        const errorData = await readResponseBody(response);
        if (errorData && typeof errorData === 'object') {
          const errorRecord = errorData as Record<string, unknown>;
          errorMessage =
            (typeof errorRecord.error === 'string' && errorRecord.error) ||
            (typeof errorRecord.message === 'string' && errorRecord.message) ||
            errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await readResponseBody(response);
      const transformedData = transform ? transform(data) : (data as T);

      // Update cache
      if (cacheTtl > 0 && method === 'GET') {
        setCache(cacheKey, transformedData, cacheTtl);
      }

      // Reset retry counter on success
      retryAttemptRef.current = 0;

      if (isMountedRef.current) {
        setState({
          data: transformedData,
          status: 'success',
          loading: false,
          error: null,
          isValidating: false,
        });

        onSuccess?.(transformedData);
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      // Handle retry
      if (retryAttemptRef.current < retryCount) {
        retryAttemptRef.current++;
        const delay = retryDelay * Math.pow(2, retryAttemptRef.current - 1);

        console.warn(
          `Fetch failed, retrying (${retryAttemptRef.current}/${retryCount}) in ${delay}ms`
        );

        try {
          await sleep(delay, controller.signal);
        } catch (sleepError) {
          if (sleepError instanceof Error && sleepError.name === 'AbortError') {
            return;
          }
          const sleepMessage =
            sleepError instanceof Error ? sleepError.message : 'Retry delay failed';
          setState({
            data: null,
            status: 'error',
            loading: false,
            error: sleepMessage,
            isValidating: false,
          });
          onError?.(sleepMessage);
          return;
        }

        if (isMountedRef.current) {
          await fetchData();
        }
        return;
      }

      setState({
        data: null,
        status: 'error',
        loading: false,
        error: errorMessage,
        isValidating: false,
      });

      onError?.(errorMessage);
    }
  }, [url, method, body, params, headers, cacheTtl, retryCount, retryDelay, transform, onSuccess, onError]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch on mount or when dependencies change
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate, ...deps]);

  return {
    ...state,
    refetch: fetchData,
    reset,
    mutate,
  };
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Simplified hook for GET requests
 */
export function useGet<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: Omit<FetchOptions<T>, 'url' | 'method' | 'params'>
): FetchResult<T> {
  const safeOptions = options ?? {};
  const normalizedUrl = normalizeUrl(url);
  const normalizedParams = normalizeParams(params);

  return useFetchWithStatus<T>({
    ...safeOptions,
    url: normalizedUrl ?? '',
    method: 'GET',
    params: normalizedParams,
  });
}

/**
 * Simplified hook for POST requests
 */
export function usePost<T, TBody = unknown>(
  url: string,
  body?: TBody,
  options?: Omit<FetchOptions<T>, 'url' | 'method' | 'body'>
): FetchResult<T> {
  const safeOptions = options ?? {};
  const normalizedUrl = normalizeUrl(url);

  return useFetchWithStatus<T>({
    ...safeOptions,
    url: normalizedUrl ?? '',
    method: 'POST',
    body,
    immediate: false, // POST usually triggered manually
  });
}

/**
 * Hook for paginated data
 */
export interface PaginatedData<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export interface UsePaginatedOptions<T> extends Omit<FetchOptions<PaginatedData<T>>, 'params' | 'url'> {
  initialPage?: number;
  pageSize?: number;
  additionalParams?: Record<string, string | number | boolean | undefined>;
}

export interface UsePaginatedResult<T> extends FetchResult<PaginatedData<T>> {
  page: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePaginated<T>(
  url: string,
  options: UsePaginatedOptions<T> = {}
): UsePaginatedResult<T> {
  const {
    initialPage = 1,
    pageSize = 20,
    additionalParams,
    ...fetchOptions
  } = options;

  const [page, setPage] = useState(initialPage);

  const result = useFetchWithStatus<PaginatedData<T>>({
    url,
    params: {
      page,
      limit: pageSize,
      ...additionalParams,
    },
    deps: [page, stableStringify(sanitizeParams(additionalParams ?? {}))],
    ...fetchOptions,
  });

  const totalPages = result.data?.totalPages ?? 1;

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    ...result,
    page,
    setPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default useFetchWithStatus;
