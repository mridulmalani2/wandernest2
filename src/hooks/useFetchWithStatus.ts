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
  refetch: () => Promise<void>;

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

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(url: string, params?: Record<string, unknown>): string {
  const paramStr = params ? JSON.stringify(params) : '';
  return `${url}:${paramStr}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  if (ttl <= 0) return;

  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });

  // Cleanup old entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > v.ttl) {
        cache.delete(k);
      }
    }
  }
}

// ============================================
// HELPERS
// ============================================

function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      const newData = typeof updater === 'function'
        ? (updater as (prev: T | null) => T | null)(prev.data)
        : updater;
      return { ...prev, data: newData };
    });
  }, []);

  const fetchData = useCallback(async () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check cache first
    const cacheKey = getCacheKey(url, params);
    if (cacheTtl > 0 && method === 'GET') {
      const cached = getFromCache<T>(cacheKey);
      if (cached) {
        setState({
          data: cached,
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
      const fullUrl = buildUrl(url, params);

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(fullUrl, fetchOptions);

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse errors
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
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

        await sleep(delay);

        if (isMountedRef.current) {
          fetchData();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

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
  return useFetchWithStatus<T>({
    url,
    method: 'GET',
    params,
    ...options,
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
  return useFetchWithStatus<T>({
    url,
    method: 'POST',
    body,
    immediate: false, // POST usually triggered manually
    ...options,
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
    deps: [page, JSON.stringify(additionalParams)],
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
