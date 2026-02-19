'use client';

import React, { useState } from 'react';

interface EncomendaItem {
  id: string;
  peca_id: string;
  quantidade_encomendada: number;
  quantidade_recebida: number;
  preco_unitario: number;
  estado: string;
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

interface EncomendaTableProps {
  encomendas: Encomenda[];
  onStatusChange?: (id: string, newStatus: string) => void;
  onReceive?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  loading?: boolean;
}

const EncomendaTableComponent: React.FC<EncomendaTableProps> = ({
  encomendas,
  onStatusChange,
  onReceive,
  onViewDetails,
  loading = false,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'text-yellow-400 bg-yellow-900/50';
      case 'em_transito':
        return 'text-blue-400 bg-blue-900/50';
      case 'recebido':
        return 'text-green-400 bg-green-900/50';
      case 'cancelado':
        return 'text-red-400 bg-red-900/50';
      default:
        return 'text-gray-400 bg-gray-900/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_transito':
        return 'Em Trânsito';
      case 'recebido':
        return 'Recebido';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (encomendas.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-white">Nenhuma encomenda encontrada</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {encomendas.map(encomenda => (
        <div
          key={encomenda.id}
          className="bg-gray-700 border border-gray-600 rounded overflow-hidden"
        >
          {/* Header Row */}
          <div
            className="flex items-center p-4 cursor-pointer hover:bg-gray-600/50 transition-colors"
            onClick={() => toggleExpanded(encomenda.id)}
          >
            <svg
              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                expandedIds.includes(encomenda.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>

            <div className="ml-4 flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
              {/* Order Number & Supplier */}
              <div className="md:col-span-1">
                <p className="text-white font-semibold text-sm">{encomenda.numero_encomenda}</p>
                <p className="text-gray-400 text-xs">{encomenda.fornecedor_nome || 'Fornecedor'}</p>
              </div>

              {/* Dates - Hidden on mobile */}
              <div className="hidden md:block text-sm">
                <p className="text-gray-400 text-xs">Encomendado</p>
                <p className="text-gray-300">{formatDate(encomenda.data_encomenda)}</p>
              </div>

              <div className="hidden md:block text-sm">
                <p className="text-gray-400 text-xs">Previsto</p>
                <p className={`${encomenda.dias_atraso && encomenda.dias_atraso > 0 ? 'text-red-400 font-semibold' : 'text-gray-300'}`}>
                  {formatDate(encomenda.data_entrega_estimada)}
                  {encomenda.dias_atraso && encomenda.dias_atraso > 0 && (
                    <span className="ml-2 text-xs">({encomenda.dias_atraso}d atraso)</span>
                  )}
                </p>
              </div>

              {/* Status */}
              <div className="text-sm">
                <p className="text-gray-400 text-xs mb-1">Status</p>
                <select
                  value={encomenda.estado}
                  onChange={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(encomenda.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`px-2 py-1 text-xs font-bold rounded border-0 bg-transparent cursor-pointer focus:ring-1 focus:ring-brand-yellow ${getStatusColor(
                    encomenda.estado
                  )}`}
                >
                  <option value="pendente" className="bg-gray-800">
                    Pendente
                  </option>
                  <option value="em_transito" className="bg-gray-800">
                    Em Trânsito
                  </option>
                  <option value="recebido" className="bg-gray-800">
                    Recebido
                  </option>
                  <option value="cancelado" className="bg-gray-800">
                    Cancelado
                  </option>
                </select>
              </div>

              {/* Total */}
              <div className="text-right md:text-left">
                <p className="text-gray-400 text-xs">Total</p>
                <p className="text-white font-semibold">€{encomenda.custo_total.toFixed(2)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-4 flex gap-2">
              {encomenda.estado !== 'recebido' && encomenda.estado !== 'cancelado' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReceive?.(encomenda.id);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
                  title="Receber encomenda"
                >
                  Receber
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(encomenda.id);
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors"
              >
                Ver
              </button>
            </div>
          </div>

          {/* Details Row */}
          {expandedIds.includes(encomenda.id) && (
            <div className="bg-gray-800 border-t border-gray-600 p-4">
              {encomenda.itens && encomenda.itens.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-white font-semibold text-sm mb-3">Peças:</h4>
                  {encomenda.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-gray-900 p-2 rounded">
                      <div className="flex-1">
                        <p className="text-gray-300">
                          {item.quantidade_encomendada} un. @ €{item.preco_unitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          €{(item.quantidade_encomendada * item.preco_unitario).toFixed(2)}
                        </p>
                        {item.quantidade_recebida > 0 && (
                          <p className="text-xs text-green-400">
                            {item.quantidade_recebida}/{item.quantidade_encomendada} recebidas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Sem detalhes de peças</p>
              )}

              {encomenda.data_entrega_real && (
                <div className="mt-3 text-xs text-green-400 bg-green-900/30 p-2 rounded">
                  Recebida em: {formatDate(encomenda.data_entrega_real)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EncomendaTableComponent;
