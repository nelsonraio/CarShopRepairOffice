'use client';

import React, { useState, useEffect } from 'react';

interface EncomendaItem {
  id: string;
  peca_id: string;
  quantidade_encomendada: number;
  quantidade_recebida: number;
  preco_unitario: number;
  estado?: string;
}

interface Encomenda {
  id: string;
  numero_encomenda: string;
  fornecedor_id: string;
  fornecedor_nome?: string;
  data_encomenda: string;
  data_entrega_estimada: string | null;
  data_entrega_real: string | null;
  estado: 'pendente' | 'em_transito' | 'recebido' | 'cancelado';
  custo_total: number;
  itens?: EncomendaItem[];
  dias_atraso?: number;
}

interface ReceiveModalProps {
  isOpen: boolean;
  order: Encomenda | null;
  onClose: () => void;
  onConfirm: (items: { id: string; quantity: number }[]) => void;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({
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
      // by default pre-select every part with its remaining quantity
      const initial: Record<string, number> = {};
      order.itens.forEach(item => {
        const remaining = item.quantidade_encomendada - (item.quantidade_recebida || 0);
        if (remaining > 0) {
          initial[item.id] = remaining;
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
      const remaining = item.quantidade_encomendada - (item.quantidade_recebida || 0);
      setSelected(prev => ({ ...prev, [itemId]: remaining > 0 ? remaining : 0 }));
    } else {
      setSelected(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  };

  const handleQuantityChange = (itemId: string, value: number) => {
    setSelected(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    const items = Object.entries(selected).map(([id, qty]) => ({ id, quantity: qty }));
    onConfirm(items);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Receber Encomenda</h2>
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
          <p className="text-gray-300">Selecione as peças que deseja acrescentar ao stock e indique a quantidade.</p>

          {order.itens && order.itens.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {order.itens.map(item => {
                const remaining = item.quantidade_encomendada - (item.quantidade_recebida || 0);
                return (
                  <div key={item.id} className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-600">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected[item.id] !== undefined}
                        onChange={e => handleCheckbox(item.id, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-brand-yellow bg-gray-800 border-gray-600 rounded"
                      />
                      <span className="text-gray-300">{item.quantidade_encomendada} un.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={selected[item.id] ?? 0}
                        disabled={selected[item.id] === undefined}
                        onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-center"
                      />
                      <span className="text-gray-400 text-xs">/ {remaining}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">Não há itens na encomenda.</p>
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
            className="px-6 py-2 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors rounded"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveModal;
