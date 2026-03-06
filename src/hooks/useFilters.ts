/**
 * useFilters Hook
 * Manages multiple filter states and filtering logic
 * Centralizes search/filter state management
 */
import { useState, useCallback, useMemo } from 'react';

interface FilterConfig {
  [key: string]: (item: any, filterValue: string) => boolean;
}

interface UseFiltersResult<T> {
  filters: Record<string, string>;
  setFilter: (name: string, value: string) => void;
  resetFilters: () => void;
  filteredItems: T[];
}

/**
 * Custom hook for managing multiple filters
 * @param items - List to filter
 * @param config - Filter configuration with predicate functions
 * @returns Filters state and filtered items
 */
export function useFilters<T>(
  items: T[],
  config: FilterConfig
): UseFiltersResult<T> {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const setFilter = useCallback((name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filteredItems = useMemo(() => {
    // Ensure items is an array before filtering
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items.filter((item) => {
      for (const [filterName, filterValue] of Object.entries(filters)) {
        if (filterValue === '') continue; // Skip empty filters
        if (!config[filterName]) continue; // Skip unknown filters

        if (!config[filterName](item, filterValue)) {
          return false;
        }
      }
      return true;
    });
  }, [items, filters, config]);

  return { filters, setFilter, resetFilters, filteredItems };
}

/**
 * Predefined filter predicates for common use cases
 */
export const filterPredicates = {
  /**
   * Search in multiple string fields
   */
  search: (fields: string[]) => (item: any, searchTerm: string) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return fields.some((field) => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(term);
    });
  },

  /**
   * Exact match on a field
   */
  exact: (field: string) => (item: any, value: string) => {
    if (!value) return true;
    return String(item[field]) === value;
  },

  /**
   * Includes on a field (for arrays or string checking)
   */
  includes: (field: string) => (item: any, value: string) => {
    if (!value) return true;
    const fieldValue = item[field];
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(value);
    }
    return String(fieldValue).includes(value);
  },

  /**
   * Date range filter
   */
  dateRange: (field: string) => (item: any, range: string) => {
    if (!range || range === 'todos') return true;
    const itemDate = new Date(item[field]);
    const today = new Date();

    switch (range) {
      case 'hoje':
        return itemDate.toDateString() === today.toDateString();
      case 'semana':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        return itemDate >= weekAgo;
      case 'mes':
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        return itemDate >= monthAgo;
      default:
        return true;
    }
  },

  /**
   * Numeric range filter
   */
  numericRange: (field: string, min?: number, max?: number) => (item: any, value: string) => {
    if (!value) return true;
    const itemValue = Number(item[field]);
    const filterValue = Number(value);

    if (min !== undefined && itemValue < min) return false;
    if (max !== undefined && itemValue > max) return false;

    return itemValue === filterValue;
  },
};
