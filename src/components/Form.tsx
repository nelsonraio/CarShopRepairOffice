'use client';

import React from 'react';

/**
 * Componente genérico para input de texto
 * Reduz duplicação de styling e state em formulários
 */
interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full bg-gray-900 border rounded px-3 py-2 text-white
          placeholder-gray-600 outline-none transition-colors
          ${error ? 'border-red-500' : 'border-gray-600'}
          focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow
          ${className || ''}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
);

FormInput.displayName = 'FormInput';

/**
 * Componente genérico para textarea
 */
interface FormTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full bg-gray-900 border rounded px-3 py-2 text-white
          placeholder-gray-600 outline-none transition-colors
          ${error ? 'border-red-500' : 'border-gray-600'}
          focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow
          resize-none
          ${className || ''}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
);

FormTextArea.displayName = 'FormTextArea';

/**
 * Componente genérico para select
 */
interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full bg-gray-900 border rounded px-3 py-2 text-white
          placeholder-gray-600 outline-none transition-colors
          ${error ? 'border-red-500' : 'border-gray-600'}
          focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow
          ${className || ''}
        `}
        {...props}
      >
        <option value="">Selecionar...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
);

FormSelect.displayName = 'FormSelect';

/**
 * Componente genérico para botão
 */
interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const FormButton: React.FC<FormButtonProps> = ({
  variant = 'primary',
  isLoading,
  children,
  className,
  ...props
}) => {
  const baseStyle = 'px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = {
    primary: 'bg-brand-yellow text-gray-900 hover:bg-yellow-600',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'A processar...' : children}
    </button>
  );
};

/**
 * Container genérico para modal
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-6 w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
