"use client";

import { useState, useRef, useEffect } from "react";

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'decimal' | 'boolean' | 'select' | 'date';
  required?: boolean;
  editable?: boolean;
  width?: string;
  options?: { value: any; label: string }[];
  render?: (value: any, row: T) => React.ReactNode;
  format?: (value: any) => string;
  validate?: (value: any) => string | null; // Returns error message or null
}

interface EditableDataGridProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  idField?: string;
  onSave?: (row: T, isNew: boolean) => Promise<void>;
  onDelete?: (id: any) => Promise<void>;
  onToggleActive?: (id: any, active: boolean) => Promise<void>;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canToggleActive?: boolean;
  loading?: boolean;
}

export default function EditableDataGrid<T extends Record<string, any>>({
  columns,
  data,
  idField = 'id',
  onSave,
  onDelete,
  onToggleActive,
  canAdd = true,
  canEdit = true,
  canDelete = false,
  canToggleActive = true,
  loading = false
}: EditableDataGridProps<T>) {
  const [editingId, setEditingId] = useState<any>(null);
  const [editedRow, setEditedRow] = useState<Partial<T>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<any>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | HTMLSelectElement | null }>({});

  // Reset when changing rows
  useEffect(() => {
    if (editingId === null && !isAddingNew) {
      setEditedRow({});
      setErrors({});
    }
  }, [editingId, isAddingNew]);

  const startEdit = (row: T) => {
    setEditingId(row[idField]);
    setEditedRow({ ...row });
    setIsAddingNew(false);
    setErrors({});
  };

  const startAddNew = () => {
    const newRow: Partial<T> = {};
    columns.forEach(col => {
      if (col.type === 'boolean') {
        newRow[col.key as keyof T] = true as any;
      } else if (col.type === 'number' || col.type === 'decimal') {
        newRow[col.key as keyof T] = 0 as any;
      } else {
        newRow[col.key as keyof T] = '' as any;
      }
    });
    
    // Set ativo to true by default for new rows
    if ('ativo' in newRow) {
      newRow['ativo' as keyof T] = true as any;
    }
    
    setEditedRow(newRow);
    setIsAddingNew(true);
    setEditingId(null);
    setErrors({});
    
    // Focus first input
    setTimeout(() => {
      const firstEditableCol = columns.find(col => col.editable !== false);
      if (firstEditableCol) {
        inputRefs.current[firstEditableCol.key]?.focus();
      }
    }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setEditedRow({});
    setErrors({});
  };

  const validateRow = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(col => {
      if (col.required && col.editable !== false) {
        const value = editedRow[col.key as keyof T];
        if (value === null || value === undefined || value === '') {
          newErrors[col.key] = `${col.header} é obrigatório`;
        }
      }
      
      if (col.validate) {
        const value = editedRow[col.key as keyof T];
        const error = col.validate(value);
        if (error) {
          newErrors[col.key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateRow()) {
      return;
    }

    if (!onSave) return;

    setSavingId(isAddingNew ? 'new' : editingId);
    try {
      await onSave(editedRow as T, isAddingNew);
      cancelEdit();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erro ao guardar. Por favor tente novamente.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: any) => {
    if (!onDelete) return;
    if (!confirm('Tem certeza que deseja eliminar este registo?')) return;

    setSavingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Erro ao eliminar. Por favor tente novamente.');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (id: any, currentActive: boolean) => {
    if (!onToggleActive) return;

    setSavingId(id);
    try {
      await onToggleActive(id, !currentActive);
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Erro ao alterar estado. Por favor tente novamente.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCellChange = (key: string, value: any) => {
    // Convert empty strings to null for consistency
    const processedValue = value === '' ? null : value;
    setEditedRow(prev => ({ ...prev, [key]: processedValue }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const renderCell = (column: ColumnDef, row: T, isEditing: boolean) => {
    const value = row[column.key];

    if (isEditing && column.editable !== false) {
      const editValue = editedRow[column.key as keyof T];
      const hasError = !!errors[column.key];

      const baseInputClass = `px-2 py-1 bg-gray-800 border ${
        hasError ? 'border-red-500' : 'border-gray-600'
      } text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow w-full`;

      switch (column.type) {
        case 'boolean':
          return (
            <input
              type="checkbox"
              checked={!!editValue}
              onChange={(e) => handleCellChange(column.key, e.target.checked)}
              className="w-4 h-4 text-brand-yellow bg-gray-800 border-gray-600 rounded focus:ring-brand-yellow"
            />
          );
        
        case 'select':
          return (
            <select
              ref={(el) => { inputRefs.current[column.key] = el; }}
              value={editValue as string || ''}
              onChange={(e) => handleCellChange(column.key, e.target.value)}
              className={baseInputClass}
            >
              <option value="">Selecione...</option>
              {column.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );

        case 'number':
          return (
            <input
              ref={(el) => { inputRefs.current[column.key] = el; }}
              type="number"
              value={editValue as number || ''}
              onChange={(e) => handleCellChange(column.key, e.target.value ? parseInt(e.target.value) : null)}
              className={baseInputClass}
            />
          );

        case 'decimal':
          return (
            <input
              ref={(el) => { inputRefs.current[column.key] = el; }}
              type="number"
              step="0.01"
              value={editValue as number || ''}
              onChange={(e) => handleCellChange(column.key, e.target.value ? parseFloat(e.target.value) : null)}
              className={baseInputClass}
            />
          );

        case 'date':
          return (
            <input
              ref={(el) => { inputRefs.current[column.key] = el; }}
              type="date"
              value={editValue as string || ''}
              onChange={(e) => handleCellChange(column.key, e.target.value)}
              className={baseInputClass}
            />
          );

        default:
          return (
            <input
              ref={(el) => { inputRefs.current[column.key] = el; }}
              type="text"
              value={(editValue as string) || ''}
              onChange={(e) => handleCellChange(column.key, e.target.value)}
              className={baseInputClass}
            />
          );
      }
    }

    // Display mode
    if (column.render) {
      return column.render(value, row);
    }

    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'boolean':
        return (
          <span className={`px-2 py-1 text-xs font-semibold ${
            value ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {value ? 'Sim' : 'Não'}
          </span>
        );
      
      case 'decimal':
      case 'number':
        return <span className="font-mono">{value?.toFixed(column.type === 'decimal' ? 2 : 0) || '0'}</span>;

      case 'date':
        return value ? new Date(value).toLocaleDateString('pt-PT') : '-';

      default:
        return value || '-';
    }
  };

  const renderActions = (row: T) => {
    const id = row[idField];
    const isEditing = editingId === id || (isAddingNew && editingId === null);
    const isSaving = savingId === id || (isAddingNew && savingId === 'new');
    const isActive = 'ativo' in row ? row.ativo : true;

    if (isEditing) {
      return (
        <div className="flex justify-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
            title="Guardar"
          >
            {isSaving ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
          <button
            onClick={cancelEdit}
            disabled={isSaving}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            title="Cancelar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-center gap-2">
        {canEdit && (
          <button
            onClick={() => startEdit(row)}
            disabled={isSaving}
            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            title="Editar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
        )}
        
        {canToggleActive && 'ativo' in row && (
          <button
            onClick={() => handleToggleActive(id, isActive)}
            disabled={isSaving}
            className={`transition-colors disabled:opacity-50 ${
              isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'
            }`}
            title={isActive ? 'Desativar' : 'Ativar'}
          >
            {isActive ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            )}
          </button>
        )}

        {canDelete && (
          <button
            onClick={() => handleDelete(id)}
            disabled={isSaving}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            title="Eliminar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
      {/* Add New Button */}
      {canAdd && !isAddingNew && editingId === null && (
        <div className="p-4 border-b border-gray-600">
          <button
            onClick={startAddNew}
            className="px-4 py-2 bg-brand-yellow text-gray-900 font-semibold hover:bg-yellow-500 transition-colors"
          >
            + Adicionar Novo
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  scope="col" 
                  className="px-6 py-3"
                  style={{ width: col.width }}
                >
                  {col.header}
                  {col.required && <span className="text-red-400 ml-1">*</span>}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-center w-32">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {/* New Row */}
            {isAddingNew && (
              <tr className="bg-gray-600 border-l-4 border-brand-yellow">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4">
                    <div>
                      {renderCell(col, editedRow as T, true)}
                      {errors[col.key] && (
                        <p className="text-red-400 text-xs mt-1">{errors[col.key]}</p>
                      )}
                    </div>
                  </td>
                ))}
                <td className="px-6 py-4">{renderActions(editedRow as T)}</td>
              </tr>
            )}

            {/* Existing Rows */}
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <svg className="w-8 h-8 animate-spin text-brand-yellow" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">
                  Nenhum registo encontrado
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = row[idField];
                const isEditing = editingId === id;
                const isActive = 'ativo' in row ? row.ativo : true;

                return (
                  <tr 
                    key={id}
                    className={`transition-colors ${
                      isEditing ? 'bg-gray-600 border-l-4 border-brand-yellow' : 
                      !isActive ? 'bg-gray-800 opacity-60' : 'hover:bg-gray-600'
                    }`}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4">
                        <div>
                          {renderCell(col, row, isEditing)}
                          {isEditing && errors[col.key] && (
                            <p className="text-red-400 text-xs mt-1">{errors[col.key]}</p>
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4">{renderActions(row)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
