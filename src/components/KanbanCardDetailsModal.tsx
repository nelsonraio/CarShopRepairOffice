"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface KanbanCardData {
  id: string;
  proc: string;
  plate?: string;
  model?: string;
  mechanic?: string;
  avatar?: string;
  estado?: string;
  cliente_nome?: string;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
  contacto_email?: string | null;
  data_conclusao?: string;
  prioridade?: string;
  total_geral?: number;
  titulo?: string;
  descricao?: string;
  hora_agendamento?: string;
  data_emissao?: string;
  itens_count?: number;
  itens_orcamento?: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    valor_total: number;
  }>;
  waiting_parts?: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    valor_total: number;
  }>;
  work_order_items?: Array<{
    id: number;
    tipo_item: string;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
    valor_total: number;
  }>;
  work_order_ref?: string;
  work_order_mechanic?: string;
  work_order_total?: number;
  work_order_data_inicio?: string;
  work_order_data_conclusao?: string;
  work_order_prioridade?: string;
  work_order_estado?: string;
  data_inicio?: string;
}

interface KanbanCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: KanbanCardData | null;
  columnTitle: string;
  isReadOnly?: boolean;
}

export default function KanbanCardDetailsModal({ isOpen, onClose, card, columnTitle }: KanbanCardDetailsModalProps) {
    const [clientModalOpen, setClientModalOpen] = React.useState(false);
    const [clientDetails, setClientDetails] = React.useState<any | null>(null);

    const handleClientClick = async () => {
      if (!card || !card.cliente_nome) return;
      try {
        const response = await fetch(`/api/clientes?nome=${encodeURIComponent(card.cliente_nome)}`);
        if (response.ok) {
          const data = await response.json();
          setClientDetails(data);
          setClientModalOpen(true);
        }
      } catch (err) {
        setClientDetails({ nome: card.cliente_nome });
        setClientModalOpen(true);
      }
    };
  const router = useRouter();

  if (!isOpen || !card) return null;

  const getStatusLabel = (estado?: string) => {
    switch(estado) {
      case 'em_recepcao': return 'Em Recepção';
      case 'em_aprovacao': return 'Em Aprovação';
      case 'em_andamento': return 'Em Andamento';
      case 'aguarda_peca': return 'Aguarda Peças';
      case 'concluido': return 'Concluído';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return estado || 'Desconhecido';
    }
  };

  const getStatusColor = (estado?: string) => {
    switch(estado) {
      case 'em_recepcao': return 'bg-purple-400/20 text-purple-300 border-purple-400/50';
      case 'em_aprovacao': return 'bg-indigo-400/20 text-indigo-300 border-indigo-400/50';
      case 'em_andamento': return 'bg-blue-400/20 text-blue-300 border-blue-400/50';
      case 'aguarda_peca': return 'bg-orange-400/20 text-orange-300 border-orange-400/50';
      case 'concluido': return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50';
      case 'entregue': return 'bg-green-400/20 text-green-300 border-green-400/50';
      case 'cancelado': return 'bg-red-400/20 text-red-300 border-red-400/50';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getPriorityColor = (prioridade?: string) => {
    switch(prioridade?.toLowerCase()) {
      case 'urgente': return 'text-red-400';
      case 'alta': return 'text-orange-400';
      case 'normal': return 'text-gray-300';
      case 'baixa': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleCreateBudget = () => {
    // Navigate to new budget page with appointment ID
    router.push(`/orcamentos/novo?agendamento_id=${card.id}&from=kanban`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-start justify-center z-50 backdrop-blur-sm overflow-y-auto py-6">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl p-6 shadow-2xl relative max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-100">
              {card.estado === 'em_recepcao'
                ? 'Detalhes do Agendamento'
                : card.estado === 'em_aprovacao'
                  ? 'Detalhes do Orçamento'
                  : 'Detalhes da Ordem de Trabalho'}
            </h3>
            <p className="text-sm text-brand-yellow font-mono mt-1">
              {card.estado === 'em_recepcao'
                ? 'AGD: '
                : card.estado === 'em_aprovacao'
                  ? 'ORC: '
                  : 'OT: '}{card.proc}
            </p>
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
              <label className="block text-xs font-medium text-gray-500 uppercase">Cliente</label>
              {card.cliente_nome ? (
                <button
                  className="text-sm text-brand-yellow underline hover:text-yellow-400 focus:outline-none"
                  onClick={handleClientClick}
                >
                  {card.cliente_nome}
                </button>
              ) : (
                <p className="text-sm text-gray-300">N/A</p>
              )}
            </div>
            {/* Mostrar contacto destacado para agendamentos em recepção */}
            {card.estado === 'em_recepcao' && (
              <div className="bg-purple-400/10 border border-purple-400/30 rounded p-3">
                <label className="block text-xs font-medium text-purple-300 uppercase mb-2">Contacto</label>
                <p className="text-sm font-medium text-white">{card.contacto_nome || card.cliente_nome || 'N/A'}</p>
                <p className="text-sm text-purple-200 font-mono">📞 {card.contacto_telefone || 'Sem telefone'}</p>
                {card.contacto_email && <p className="text-xs text-purple-300">✉️ {card.contacto_email}</p>}
              </div>
            )}
            {/* Mostrar contacto normal para outros estados */}
            {card.estado !== 'em_recepcao' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Contacto</label>
                <p className="text-sm text-gray-300">{card.contacto_nome || card.cliente_nome || 'N/A'}</p>
                <p className="text-xs text-gray-400">{card.contacto_telefone || 'Sem telefone'}</p>
                {card.contacto_email && <p className="text-xs text-gray-400">{card.contacto_email}</p>}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Mecânico</label>
              <span className="bg-brand-yellow text-gray-900 text-xs font-semibold px-3 py-1 rounded inline-block mt-1">
                {card.mechanic || 'N/A'}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Estado Atual</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 border ${getStatusColor(card.estado)}`}>
                {getStatusLabel(card.estado)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Prioridade</label>
              <p className={`text-sm font-medium capitalize ${getPriorityColor(card.prioridade)} mt-1`}>
                {card.prioridade || 'N/A'}
              </p>
            </div>
          </div>

          {/* Work Order Details */}
          {card.estado !== 'em_recepcao' && card.estado !== 'em_aprovacao' && (
            <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
              <h4 className="text-sm font-bold text-gray-200 mb-3">Detalhes da Ordem de Trabalho</h4>
              <div className="grid grid-cols-2 gap-4">
                {card.estado !== 'em_andamento' && (
                  <div>
                    <label className="block text-xs text-gray-500 uppercase">Total</label>
                    <p className="text-lg font-bold text-brand-yellow">€{card.total_geral?.toFixed(2) || '0.00'}</p>
                  </div>
                )}
                {card.data_inicio && (
                  <div>
                    <label className="block text-xs text-gray-500 uppercase">Data de Início</label>
                    <p className="text-sm text-gray-300 mt-1">
                      {new Date(card.data_inicio).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}
                {card.data_conclusao && (
                  <div>
                    <label className="block text-xs text-gray-500 uppercase">Data de Conclusão</label>
                    <p className="text-sm text-gray-300 mt-1">
                      {new Date(card.data_conclusao).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}
                {card.prioridade && (
                  <div>
                    <label className="block text-xs text-gray-500 uppercase">Prioridade</label>
                    <p className={`text-sm font-medium capitalize ${getPriorityColor(card.prioridade)} mt-1`}>
                      {card.prioridade}
                    </p>
                  </div>
                )}
              </div>
              {/* Mostrar peças em falta - usar waiting_parts se existir, senão usar todos os itens do tipo peça da OT */}
              {(card.estado === 'aguarda_peca') && (
                <div className="mt-4 border-t border-orange-600 pt-3">
                  <h5 className="text-xs font-semibold text-orange-200 uppercase mb-2">Peças em Falta</h5>
                  <div className="space-y-2">
                    {Array.isArray(card.waiting_parts) && card.waiting_parts.length > 0 ? (
                      card.waiting_parts.map(item => (
                        <div key={item.id} className="flex items-center text-sm text-orange-200">
                          <span className="truncate pr-3">{item.descricao}</span>
                          <span className="text-orange-300 ml-2">x{item.quantidade}</span>
                        </div>
                      ))
                    ) : Array.isArray(card.work_order_items) ? (
                      card.work_order_items
                        .filter(item => (item.tipo_item === 'peça' || item.tipo_item === 'peca') &&
                          !(Array.isArray(card.waiting_parts) && card.waiting_parts.some(wp => wp.id === item.id)))
                        .map(item => (
                          <div key={item.id} className="flex items-center text-sm text-orange-200">
                            <span className="truncate pr-3">{item.descricao}</span>
                            <span className="text-orange-300 ml-2">x{item.quantidade}</span>
                          </div>
                        ))
                    ) : (
                      <span className="text-orange-300">Nenhuma peça em falta encontrada.</span>
                    )}
                  </div>
                </div>
              )}
          
              {card.work_order_ref && (
                <div className="mt-4 border-t border-indigo-700 pt-3">
                  <h5 className="text-xs font-semibold text-indigo-200 uppercase mb-2">Ordem de Trabalho Associada</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                    <div>
                      <span className="block text-xs uppercase text-gray-400">Referencia</span>
                      <span className="font-mono text-brand-yellow">{card.work_order_ref}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase text-gray-400">Mecanico</span>
                      <span>{card.work_order_mechanic || 'N/A'}</span>
                    </div>
                    {card.work_order_estado && (
                      <div>
                        <span className="block text-xs uppercase text-gray-400">Estado</span>
                        <span className="capitalize">{card.work_order_estado.replace('_', ' ')}</span>
                      </div>
                    )}
                    {card.work_order_prioridade && (
                      <div>
                        <span className="block text-xs uppercase text-gray-400">Prioridade</span>
                        <span className="capitalize">{card.work_order_prioridade}</span>
                      </div>
                    )}
                    {card.work_order_data_inicio && (
                      <div>
                        <span className="block text-xs uppercase text-gray-400">Inicio</span>
                        <span>{new Date(card.work_order_data_inicio).toLocaleDateString('pt-PT')}</span>
                      </div>
                    )}
                    {card.work_order_data_conclusao && (
                      <div>
                        <span className="block text-xs uppercase text-gray-400">Conclusao</span>
                        <span>{new Date(card.work_order_data_conclusao).toLocaleDateString('pt-PT')}</span>
                      </div>
                    )}
                    {card.work_order_total !== undefined && (
                      <div>
                        <span className="block text-xs uppercase text-gray-400">Total OT</span>
                        <span className="font-mono text-brand-yellow">€{Number(card.work_order_total).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {card.itens_orcamento && card.itens_orcamento.length > 0 && (
                <div className="mt-4 border-t border-indigo-700 pt-3">
                  <h5 className="text-xs font-semibold text-indigo-200 uppercase mb-2">Itens do Orçamento</h5>
                  <div className="space-y-2">
                    {card.itens_orcamento.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm text-gray-300">
                        <span className="truncate pr-3">{item.descricao}</span>
                        <span className="text-gray-400">x{item.quantidade}</span>
                        <span className="font-mono text-brand-yellow">€{Number(item.valor_total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {card.work_order_items && card.work_order_items.length > 0 && (
                <div className="mt-4 border-t border-indigo-700 pt-3">
                  <h5 className="text-xs font-semibold text-indigo-200 uppercase mb-2">Itens da Ordem de Trabalho</h5>
                  <div className="space-y-2">
                    {card.work_order_items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm text-gray-300">
                        <span className="truncate pr-3">{item.descricao}</span>
                        <span className="text-gray-400">x{item.quantidade}</span>
                        <span className="text-gray-400">{item.tipo_item === 'servico' ? 'Serviço' : 'Peça'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budget Details */}
          {card.estado === 'em_aprovacao' && (
            <div className="bg-indigo-900/25 border border-indigo-700 p-4 rounded">
              <h4 className="text-sm font-bold text-indigo-200 mb-3">Detalhes do Orçamento</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase">Total</label>
                  <p className="text-lg font-bold text-brand-yellow">€{Number(card.total_geral || 0).toFixed(2)}</p>
                </div>
                {card.data_emissao && (
                  <div>
                    <label className="block text-xs text-gray-400 uppercase">Data de Emissão</label>
                    <p className="text-sm text-gray-300 mt-1">
                      {new Date(card.data_emissao).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-400 uppercase">Itens</label>
                  <p className="text-sm text-gray-300 mt-1">{card.itens_count ?? card.itens_orcamento?.length ?? 0}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-indigo-700 pt-3">
                <h5 className="text-xs font-semibold text-indigo-200 uppercase mb-2">Itens do Orçamento</h5>
                <div className="space-y-2">
                  {Array.isArray(card.itens_orcamento) && card.itens_orcamento.length > 0 ? (
                    card.itens_orcamento.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm text-gray-300">
                        <span className="truncate pr-3">{item.descricao}</span>
                        <span className="text-gray-400">x{item.quantidade}</span>
                        <span className="font-mono text-brand-yellow">€{Number(item.valor_total).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Sem itens associados.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          {card.estado === 'em_recepcao' && (
            <div className="bg-purple-900/30 border border-purple-800 p-4 rounded">
              <h4 className="text-sm font-bold text-purple-200 mb-4">Detalhes do Agendamento</h4>
              <div className="space-y-3">
                {card.hora_agendamento && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Hora Agendada</label>
                    <p className="text-sm text-gray-300">{card.hora_agendamento}</p>
                  </div>
                )}
                {card.descricao && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Descrição</label>
                    <p className="text-sm text-gray-300 italic">{card.descricao}</p>
                  </div>
                )}
                <p className="text-sm text-purple-300 italic pt-2 border-t border-purple-700">
                  ✓ Pendente de entrada em oficina
                </p>
              </div>
            </div>
          )}

        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
      {/* Client Details Modal */}
      {clientModalOpen && clientDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-brand-yellow w-full max-w-md p-8 rounded-lg shadow-2xl relative">
            <button
              onClick={() => setClientModalOpen(false)}
              className="absolute top-3 right-3 text-brand-yellow hover:text-yellow-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h2 className="text-xl font-bold text-brand-yellow mb-6">Detalhes do Cliente</h2>
            <div className="space-y-3">
              {Object.entries(clientDetails).map(([key, value]) => (
                <div className="text-gray-100" key={key}>
                  <span className="font-semibold text-brand-yellow">{key.replace(/_/g, ' ').toUpperCase()}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
