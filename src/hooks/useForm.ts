import { useState, useCallback, useEffect } from 'react';

/**
 * Hook generalizado para gerenciar estado de formulário
 * Reduz boilerplate e unifica padrão de formulários em toda a app
 */
export const useForm = <T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar campo individual
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro ao editar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Atualizar múltiplos campos
  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Resetar formulário
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // Handler de submit centralizado
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      resetForm();
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, resetForm]);

  return {
    values,
    setFieldValue,
    errors,
    setErrors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  };
};

/**
 * Hook para gerenciar estado de modal
 * Encapsula lógica de abrir/fechar modal
 */
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
};

/**
 * Hook para gerenciar fetch de dados de API
 * Cuida de loading, erro e cache
 */
export const useFetch = <T,>(url: string, dependencies: ReadonlyArray<unknown> = []) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, ...dependencies]);

  return { data, isLoading, error };
};
