/**
 * useFetch Hook
 * Manages data fetching with loading/error states
 * Centralizes try-catch-finally pattern across all pages
 */
import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  skip?: boolean; // Skip fetching on mount
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching data from API endpoints
 * @param url - API endpoint URL
 * @param options - Fetch options (method, headers, body, skip)
 * @returns Object with data, loading, error, and refetch function
 */
export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
      };

      if (options.headers) {
        fetchOptions.headers = options.headers;
      }

      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
        if (!fetchOptions.headers) {
          fetchOptions.headers = {};
        }
        (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`Failed to fetch from ${url}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, options.method, options.headers, options.body]);

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<T = any>(
  url: string,
  options: { method?: 'POST' | 'PUT' | 'DELETE' } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body?: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          method: options.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Mutation failed on ${url}`);
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, options.method]
  );

  return { mutate, loading, error };
}
