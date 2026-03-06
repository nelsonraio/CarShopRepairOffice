/**
 * usePagination Hook
 * Manages pagination logic for lists and tables
 * Handles page calculation, slicing, and reset on filter changes
 */
import { useState, useEffect, useCallback } from 'react';

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

/**
 * Custom hook for managing pagination
 * @param items - Full list of items to paginate
 * @param itemsPerPage - Number of items per page
 * @param dependencies - Array of dependencies that trigger page reset
 * @returns Pagination state and control functions
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 20,
  dependencies: any[] = []
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when dependencies change (e.g., filters applied)
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToPage = useCallback((page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
}

/**
 * Utility function for pagination info text
 */
export function getPaginationInfo(
  startIndex: number,
  endIndex: number,
  total: number,
  itemName: string = 'itens'
) {
  return `A mostrar ${startIndex + 1} a ${Math.min(endIndex, total)} de ${total} ${itemName}`;
}
