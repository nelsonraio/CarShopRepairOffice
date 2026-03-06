/**
 * useModal Hook
 * Manages modal open/close state with optional detail selection
 * Simplifies modal state management across components
 */
import { useState, useCallback } from 'react';

interface UseModalResult<T> {
  isOpen: boolean;
  selectedItem: T | null;
  open: (item?: T) => void;
  close: () => void;
  select: (item: T) => void;
  clear: () => void;
}

/**
 * Custom hook for managing modal state
 * @returns Object with isOpen, selectedItem, and control functions
 */
export function useModal<T = any>(): UseModalResult<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    if (item !== undefined) {
      setSelectedItem(item);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const select = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const clear = useCallback(() => {
    setSelectedItem(null);
    setIsOpen(false);
  }, []);

  return { isOpen, selectedItem, open, close, select, clear };
}

/**
 * Hook for managing multiple modal states
 * Useful when page has multiple modals (add, edit, details, etc.)
 */
export function useModals<T extends Record<string, any>>(
  initialState: T
) {
  const [modals, setModals] = useState(initialState);

  const open = useCallback(
    (modalName: keyof T) => {
      setModals((prev) => ({ ...prev, [modalName]: true }));
    },
    []
  );

  const close = useCallback(
    (modalName: keyof T) => {
      setModals((prev) => ({ ...prev, [modalName]: false }));
    },
    []
  );

  const toggle = useCallback(
    (modalName: keyof T) => {
      setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
    },
    []
  );

  return { modals, open, close, toggle };
}
