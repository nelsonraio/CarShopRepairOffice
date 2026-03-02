'use client';

import React, { useState, useEffect } from 'react';

interface EncomendaItem {
  id: string;
  peca_id: string;
  quantidade_encomendada: number;
  quantidade_recebida: number;
  preco_unitario: number;
  estado?: string;
  nome?: string;
  referencia?: string;
}

interface Encomenda {
  id: string;
  numero_encomenda: string;
  fornecedor_id: string;
  fornecedor_nome?: string;
  data_encomenda: string;
  data_entrega_estimada: string | null;
  data_entrega_real: string | null;
  estado: string;
  custo_total: number;
  itens?: EncomendaItem[];
  dias_atraso?: number;
}

interface ReturnModalProps {
  isOpen: boolean;
  order: Encomenda | null;
  onClose: () => void;
  onConfirm: (items: { id: string; quantity: number }[]) => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<Record<string, number>>({});

  // reset when modal opens/closes or order changes
  useEffect(() => {
    if (!isOpen) {
      setSelected({});
    } else if (order && order.itens) {
      // by default, pre-select all items that were received (can return any that were received)
      const initial: Record<string, number> = {};
      order.itens.forEach(item => {
        if (item.quantidade_recebida && item.quantidade_recebida > 0) {
          initial[item.id] = item.quantidade_recebida;
        }
      });
      setSelected(initial);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleCheckbox = (itemId: string, checked: boolean) => {
    if (checked) {
      const item = order.itens?.find(i => i.id === itemId);
      if (!item) return;
      // Default to the quantity received (max that can be returned)
      const maxReturnable = item.quantidade_recebida || 0;
      setSelected(prev => ({ ...prev, [itemId]: maxReturnable }));
    } else {
      setSelected(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  };

  const handleQuantityChange = (itemId: string, value: number) => {
    const item = order.itens?.find(i => i.id === itemId);
    const maxValue = item?.quantidade_recebida || 0;
    const clampedValue = Math.min(Math.max(0, value), maxValue);
    setSelected(prev => ({ ...prev, [itemId]: clampedValue }));
  };

  const handleSelectAll = () => {
    const all: Record<string, number> = {};
    order.itens?.forEach(item => {
      if (item.quantidade_recebida && item.quantidade_recebida > 0) {
        all[item.id] = item.quantidade_recebida;
      }
    });
    setSelected(all);
  };

  const handleSelectNone = () => {
    setSelected({});
  };

  const handleSubmit = () => {
    const items = Object.entries(selected).map(([id, qty]) => ({ id, quantity: qty }));
    onConfirm(items);
  };

  const hasReturnableItems = order.itens?.some(item => 
    item.quantidade_recebida && item.quantidade_recebida > 0
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Devolver Peças</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-300">Selecione as peças que deseja devolver ao fornecedor e indique a quantidade.</p>

          {hasReturnableItems ? (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Selecionar Todas
                </button>
                <button
                  type="button"
                  onClick={handleSelectNone}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Desmarcar Todas
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.itens?.map(item => {
                  const received = item.quantidade_recebida || 0;
                  if (received === 0) return null; // Skip items not received
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-600">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected[item.id] !== undefined}
                          onChange={e => handleCheckbox(item.id, e.target.checked)}
                          className="form-checkbox h-4 w-4 text-brand-yellow bg-gray-800 border-gray-600 rounded"
                        />
                        <div>
                          <span className="text-white">{item.nome || `Peça ID: ${item.peca_id}`}</span>
                          {item.referencia && <span className="text-gray-400 text-sm ml-2">Ref: {item.referencia}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={received}
                          value={selected[item.id] ?? 0}
                          disabled={selected[item.id] === undefined}
                          onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-center"
                        />
                        <span className="text-gray-400 text-xs">/ {received}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-yellow-400">Esta encomenda não tem peças recebidas para devolver.</p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors rounded"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(selected).length === 0}
            className="px-6 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Devolução
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
