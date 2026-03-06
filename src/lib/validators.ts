/**
 * Validadores comuns para formulários
 * Centraliza lógica de validação reutilizável
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone português
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 9;
};

/**
 * Valida NIF português (básico)
 */
export const isValidNIF = (nif: string): boolean => {
  const cleanNIF = nif.replace(/\D/g, '');
  return cleanNIF.length === 9;
};

/**
 * Valida se string não está vazia
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida valor numérico positivo
 */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Valida campos obrigatórios em objeto
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): ValidationError[] => {
  return requiredFields
    .filter(field => !data[field] || data[field].toString().trim() === '')
    .map(field => ({
      field,
      message: `${field} é obrigatório`
    }));
};

/**
 * Validação genérica com regras customizadas
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => boolean | string>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(data[field]);
    if (result !== true) {
      errors.push({
        field,
        message: typeof result === 'string' ? result : `${field} é inválido`
      });
    }
  });

  return errors;
};

/**
 * Formata erro de validação para exibição
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(err => err.message).join(', ');
};

/**
 * Regras de validação pré-definidas
 */
export const ValidationRules = {
  required: (value: any) => isNotEmpty(String(value)) || 'Campo obrigatório',
  email: (value: string) => isValidEmail(value) || 'Email inválido',
  phone: (value: string) => isValidPhoneNumber(value) || 'Telefone inválido (9 dígitos)',
  nif: (value: string) => isValidNIF(value) || 'NIF inválido (9 dígitos)',
  positiveNumber: (value: number) => isPositiveNumber(value) || 'Deve ser um número positivo',
  minLength: (min: number) => (value: string) => value.length >= min || `Mínimo ${min} caracteres`,
  maxLength: (max: number) => (value: string) => value.length <= max || `Máximo ${max} caracteres`
};
