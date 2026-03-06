/**
 * useCRUD Hook
 * Manages Create, Read, Update, Delete operations
 * Centralizes API calls for data management
 */
import { useState, useCallback } from 'react';

interface UseCRUDResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  add: (item: Omit<T, 'id'>) => Promise<T | void>;
  update: (id: string, item: Partial<T>) => Promise<T | void>;
  delete: (id: string) => Promise<void>;
  setItems: (items: T[]) => void;
}

/**
 * Custom hook for CRUD operations
 * @param endpoint - API endpoint base URL
 * @returns CRUD operations and state
 */
export function useCRUD<T extends { id: string | number }>(
  endpoint: string
): UseCRUDResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (item: Omit<T, 'id'>) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          throw new Error(`Failed to create item`);
        }

        const newItem = await response.json();
        setItems((prev) => [...prev, newItem]);
        return newItem;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create item';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  const update = useCallback(
    async (id: string | number, updatedData: Partial<T>) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${endpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update item`);
        }

        const updatedItem = await response.json();
        setItems((prev) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );
        return updatedItem;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update item';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  const deleteItem = useCallback(
    async (id: string | number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete item`);
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  return {
    items,
    loading,
    error,
    add,
    update,
    delete: deleteItem,
    setItems,
  };
}
