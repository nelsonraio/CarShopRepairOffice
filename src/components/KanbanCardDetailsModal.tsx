"use client";

import React from 'react';

interface KanbanCardData {
  id: string;
  proc: string;
  plate: string;
  model: string;
  mechanic: string;
  avatar: string;
}

interface KanbanCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: KanbanCardData | null;
  columnTitle: string;
}

export default function KanbanCardDetailsModal({ isOpen, onClose, card, columnTitle }: KanbanCardDetailsModalProps) {
  if (!isOpen || !card) return null;

  const getStageContent = (columnName: string) => {
    switch(columnName) {
      case 'A Chegar':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-300"><span className="font-semibold text-gray-400">Motivo:</span> Revisão Programada</p>
            <div className="mt-2 p-2 bg-blue-900/30 border border-blue-800 rounded">
              <p className="text-xs text-blue-200">⚠️ Verificar histórico de travões.</p>
            </div>
          </div>
        );
      case 'Diagnóstico':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-2">Checklist de Entrada:</p>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-brand-yellow bg-gray-800 border-gray-600 rounded-none" />
              <span className="text-sm text-gray-300">Leitura OBD</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-brand-yellow bg-gray-800 border-gray-600 rounded-none" />
              <span className="text-sm text-gray-300">Teste de Estrada</span>
            </label>
          </div>
        );
      case 'Aprovação':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-300"><span className="font-semibold text-gray-400">Orçamento:</span> #4501</p>
            <p className="text-sm text-gray-300"><span className="font-semibold text-gray-400">Valor:</span> €115.00</p>
            <button
              onClick={() => window.location.href = '/orcamentos'}
              className="w-full mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-none transition-colors"
            >
              Ver Orçamento
            </button>
          </div>
        );
      case 'Aguarda Peças':
        return (
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-800">
              <tr>
                <th className="px-2 py-1">Peça</th>
                <th className="px-2 py-1">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-2 py-2">Kit Distribuição</td>
                <td className="px-2 py-2 text-yellow-400">Encomendado</td>
              </tr>
              <tr>
                <td className="px-2 py-2">Bomba de Água</td>
                <td className="px-2 py-2 text-green-400">Em Stock</td>
              </tr>
            </tbody>
          </table>
        );
      case 'Em Reparação':
        return (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progresso</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>
            <p className="text-sm text-gray-300"><span className="font-semibold text-gray-400">Previsão Fim:</span> 16:00</p>
          </div>
        );
      case 'Pronto':
        return (
          <div className="text-center p-2">
            <p className="text-lg font-bold text-green-400">Veículo Pronto</p>
            <button className="mt-2 px-4 py-1 bg-brand-yellow text-gray-900 text-sm font-bold rounded-none">
              Emitir Fatura
            </button>
          </div>
        );
      default:
        return <p className="text-sm text-gray-500 italic">Sem informação adicional.</p>;
    }
  };

  const getStatusColor = (columnName: string) => {
    switch(columnName) {
      case 'A Chegar': return 'bg-gray-700 text-gray-300 border-gray-600';
      case 'Diagnóstico': return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50';
      case 'Aprovação': return 'bg-purple-400/20 text-purple-300 border-purple-400/50';
      case 'Aguarda Peças': return 'bg-orange-400/20 text-orange-300 border-orange-400/50';
      case 'Em Reparação': return 'bg-blue-400/20 text-blue-300 border-blue-400/50';
      case 'Pronto': return 'bg-green-400/20 text-green-300 border-green-400/50';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-100">Detalhes do Veículo</h3>
            <p className="text-sm text-brand-yellow font-mono mt-1">N. Proc: {card.proc}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Info Geral */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Matrícula</label>
              <p className="text-lg font-medium text-white">{card.plate}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Modelo</label>
              <p className="text-lg font-medium text-white">{card.model}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Estado Atual</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 border ${getStatusColor(columnTitle)}`}>
                {columnTitle}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Mecânico</label>
              <div className="flex items-center mt-1">
                <img src={card.avatar} className="w-6 h-6 rounded-full mr-2 border border-gray-600" />
                <span className="text-gray-300">{card.mechanic}</span>
              </div>
            </div>
          </div>

          {/* Contextual Info Area */}
          <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
            <h4 className="text-sm font-bold text-gray-200 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Informação do Estágio
            </h4>
            <div>
              {getStageContent(columnTitle)}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notas / Observações</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 text-sm"
              rows={3}
              placeholder="Adicionar notas..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
          >
            Fechar
          </button>
          <button className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
