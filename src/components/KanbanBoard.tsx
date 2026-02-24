
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import KanbanColumn from "./KanbanColumn";
import KanbanCardDetailsModal from "./KanbanCardDetailsModal";
import NewVehicleModal from "./NewVehicleModal";

// Classe CSS para shake
const shakeAnimation = `
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
  100% { transform: translateX(0); }
}
.shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
`;

// ...existing code...

// ...existing code...

interface WorkOrder {
  id: string;
  ref_ordem_trabalho: string;
  veiculo_modelo: string;
  veiculo_matricula: string;
  mecanico_nome: string;
  estado: string;
  cliente_nome: string;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
  contacto_email?: string | null;
  data_inicio?: string;
  data_conclusao?: string;
  prioridade: string;
  total_geral: number;
  waitingParts?: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    valor_total: number;
  }>;
  items?: Array<{
    id: number;
    tipo_item: string;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
    valor_total: number;
  }>;
}

interface Appointment {
  id: string;
  ref_agendamento: string;
  veiculo_modelo: string;
  veiculo_matricula: string;
  mecanico_nome: string;
  cliente_nome: string;
  cliente_telefone?: string | null;
  cliente_email?: string | null;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
  contacto_email?: string | null;
  prioridade: string;
  titulo: string;
  descricao: string;
  hora_agendamento: string;
}

interface Budget {
  id: number;
  ref_orcamento: string;
  estado: string;
  data_emissao?: string;
  total_geral: number;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
  contacto_email?: string | null;
  itens_orcamento?: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    valor_total: number;
  }>;
  cliente?: {
    nome: string;
    telefone?: string | null;
    email?: string | null;
  };
  veiculo?: {
    marca: string;
    modelo: string;
    matricula: string;
  };
}

interface KanbanCard {
  id: string;
  proc: string;
  plate?: string;
  model?: string;
  mechanic?: string;
  estado?: string;
  cliente_nome?: string;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
  contacto_email?: string | null;
  data_inicio?: string;
  data_conclusao?: string;
  prioridade?: string;
  total_geral?: number;
  avatar?: string;
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
}

interface KanbanColumnData {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const parsePtDateToIso = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}T00:00:00.000Z`;
};

const mapStatusLabelToEstado = (status?: string) => {
  switch (status) {
    case 'Em Aprovação': return 'em_aprovacao';
    case 'Aguarda Peças': return 'aguarda_peca';
    case 'Em Andamento': return 'em_andamento';
    case 'Concluído': return 'concluido';
    case 'Entregue': return 'entregue';
    case 'Cancelado': return 'cancelado';
    default: return undefined;
  }
};

const normalizeWorkOrder = (order: any): WorkOrder => {
  const vehicle = order.vehicle ?? '';
  const [vehicleInfo, vehiclePlate] = vehicle.split('|').map((part: string) => part.trim());

  // Forçar sempre o nome do mecânico, usando todas as fontes possíveis
  let mecanico_nome = order.mecanico_nome
    || order.mechanic
    || (order.mecanico && typeof order.mecanico === 'object' && order.mecanico.nome)
    || (order.mecanico && typeof order.mecanico === 'string' ? order.mecanico : undefined)
    || 'N/A';

  return {
    id: order.ref_ordem_trabalho ?? order.id ?? '',
    ref_ordem_trabalho: order.ref_ordem_trabalho ?? order.id ?? '',
    veiculo_modelo: order.veiculo_modelo ?? vehicleInfo ?? 'N/A',
    veiculo_matricula: order.veiculo_matricula ?? vehiclePlate ?? 'N/A',
    mecanico_nome,
    estado: order.estado ?? mapStatusLabelToEstado(order.status) ?? 'em_andamento',
    cliente_nome: order.cliente_nome ?? order.client ?? 'N/A',
    contacto_nome: order.contacto_nome ?? null,
    contacto_telefone: order.contacto_telefone ?? null,
    contacto_email: order.contacto_email ?? null,
    data_inicio: order.data_inicio ?? parsePtDateToIso(order.openDate),
    data_conclusao: order.data_conclusao ?? parsePtDateToIso(order.closeDate),
    prioridade: order.prioridade ?? order.priority ?? 'Normal',
    total_geral: Number(order.total_geral ?? order.total ?? 0),
    waitingParts: order.waitingParts ?? [],
    items: order.items ?? []
  };
};

// Define state colors and order for work orders
const stateConfig: Record<string, { title: string; color: string }> = {
  'em_recepcao': { title: 'Em Recepção', color: 'text-purple-400' },
  'em_aprovacao': { title: 'Em Aprovação', color: 'text-indigo-400' },
  'aguarda_peca': { title: 'Aguarda Peças', color: 'text-orange-400' },
  'em_andamento': { title: 'Em Andamento', color: 'text-blue-400' },
  'concluido': { title: 'Concluído', color: 'text-yellow-400' }
};

const stateOrder = ['em_recepcao', 'em_aprovacao',  'aguarda_peca', 'em_andamento', 'concluido'];

export default function KanbanBoard() {
  const [shakeCardId, setShakeCardId] = useState<string | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('kanban-shake-style')) {
      const style = document.createElement('style');
      style.id = 'kanban-shake-style';
      style.innerHTML = shakeAnimation;
      document.head.appendChild(style);
    }
  }, []);
  const router = useRouter();
  const [columns, setColumns] = useState<KanbanColumnData[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnTitle, setSelectedColumnTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [pendingVehicleData, setPendingVehicleData] = useState<any>(null);
  const [pendingCard, setPendingCard] = useState<KanbanCard | null>(null);
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');
  const [pendingBudgetId, setPendingBudgetId] = useState<number | null>(null);
  const [pendingTargetColumn, setPendingTargetColumn] = useState<string>('');
  const [showWaitingPartsModal, setShowWaitingPartsModal] = useState(false);
  const [workOrderItems, setWorkOrderItems] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [waitingParts, setWaitingParts] = useState<string>('');
  const [loadingItems, setLoadingItems] = useState(false);
  const [pendingWorkOrderRef, setPendingWorkOrderRef] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionDate, setCompletionDate] = useState<string>('');
  const [draggedCard, setDraggedCard] = useState<{card: KanbanCard, fromColumnId: string} | null>(null);

  // Detectar drop fora das colunas
  useEffect(() => {
    const handleDocumentDrop = async (e: DragEvent) => {
      console.log('=== Document Drop Event ===');
      
      const target = e.target as HTMLElement;
      const isInsideColumn = target.closest('.kanban-column-content, .kanban-column');
      
      console.log('isInsideColumn:', !!isInsideColumn);
      console.log('draggedCard:', draggedCard);
      console.log('target:', target.className);
      
      if (!isInsideColumn && draggedCard) {
        e.preventDefault();
        console.log('✓ Drop fora detectado!', draggedCard);
        console.log('fromColumnId:', draggedCard.fromColumnId);
        
        const { card, fromColumnId } = draggedCard;
        
        // Cancelar agendamento se arrastar de "em_recepcao" para fora
        if (fromColumnId === 'em_recepcao') {
          // ...existing code para agendamento...
          // (mantém igual)
        } else if (fromColumnId === 'em_aprovacao') {
          // ...existing code para orçamento...
          if (window.confirm('Deseja mesmo eliminar este orçamento? Esta ação não pode ser desfeita.')) {
            try {
              const url = `/api/orcamentos?id=${card.id}`;
              console.log('Fetching DELETE:', url);
              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete budget');
              }

              setColumns(prevColumns => {
                const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
                const fromColumn = newColumns.find(col => col.id === fromColumnId);
                if (fromColumn) {
                  fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);
                }
                return newColumns;
              });

              alert('Orçamento eliminado com sucesso!');
            } catch (error) {
              alert('Erro ao eliminar orçamento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
            }
          }
        } else if (fromColumnId === 'em_andamento') {
          // Novo: Cancelar ordem de trabalho se arrastar de "em_andamento" para fora
          if (window.confirm('Deseja mesmo cancelar esta ordem de trabalho?')) {
            try {
              const url = '/api/ordens-trabalho';
              const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: card.proc,
                  estado: 'Cancelado'
                }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Falha ao cancelar ordem de trabalho');
              }

              setColumns(prevColumns => {
                // Remove da coluna antiga e adiciona na coluna "cancelado"
                const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
                const fromColumn = newColumns.find(col => col.id === fromColumnId);
                if (fromColumn) {
                  fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);
                }
                // Adiciona na coluna cancelado
                const canceladoColumn = newColumns.find(col => col.id === 'cancelado');
                if (canceladoColumn) {
                  canceladoColumn.cards.push({ ...card, estado: 'cancelado' });
                }
                return newColumns;
              });

              alert('Ordem de trabalho cancelada com sucesso!');
            } catch (error) {
              alert('Erro ao cancelar ordem de trabalho: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
            }
          }
        } else if (fromColumnId === 'concluido') {
          // ...existing code para entregar ordem...
          try {
            const url = '/api/ordens-trabalho';
            const response = await fetch(url, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: card.proc,
                estado: 'Entregue'
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to deliver work order');
            }

            setColumns(prevColumns => {
              const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
              const fromColumn = newColumns.find(col => col.id === fromColumnId);
              if (fromColumn) {
                fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);
              }
              return newColumns;
            });

            alert('Ordem de trabalho entregue com sucesso!');
          } catch (error) {
            alert('Erro ao entregar ordem de trabalho: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
          }
        } else {
          // Drop fora não faz nada para outras colunas
        }
        
        setDraggedCard(null);
      } else {
        console.log('⚠ Não foi drop fora ou draggedCard é null');
      }
    };

    const handleDocumentDragOver = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const isInsideColumn = target.closest('.kanban-column-content, .kanban-column');
      
      if (!isInsideColumn && draggedCard) {
        e.preventDefault(); // Permitir drop fora
      }
    };

    const handleDragEnd = () => {
      setDraggedCard(null);
    };

    document.addEventListener('drop', handleDocumentDrop);
    document.addEventListener('dragover', handleDocumentDragOver);
    document.addEventListener('dragend', handleDragEnd);

    return () => {
      document.removeEventListener('drop', handleDocumentDrop);
      document.removeEventListener('dragover', handleDocumentDragOver);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, [draggedCard]);

  // Function to fetch all data
  const fetchData = async () => {
    try {
      const [ordersResponse, appointmentsResponse, budgetsResponse] = await Promise.all([
        fetch('/api/ordens-trabalho'),
        fetch('/api/agendamentos/hoje'),
        fetch('/api/orcamentos?limit=200&page=1')
      ]);

      if (!ordersResponse.ok) throw new Error('Failed to fetch work orders');
      if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
      if (!budgetsResponse.ok) throw new Error('Failed to fetch budgets');
      
      const workOrders: WorkOrder[] = await ordersResponse.json();
      const appointments: Appointment[] = await appointmentsResponse.json();
      const budgetsData = await budgetsResponse.json();
      const budgets: Budget[] = budgetsData?.orcamentos || [];
        
        // Group work orders by estado
        const grouped: Record<string, KanbanCard[]> = {};
        
        stateOrder.forEach(state => {
          grouped[state] = [];
        });

        appointments.forEach(appt => {
          if (!grouped['em_recepcao']) {
            grouped['em_recepcao'] = [];
          }
          const card: KanbanCard = {
            id: appt.id,
            proc: appt.ref_agendamento,
            plate: appt.veiculo_matricula,
            model: appt.veiculo_modelo,
            mechanic: appt.mecanico_nome || 'N/A',
            estado: 'em_recepcao',
            cliente_nome: appt.cliente_nome,
            contacto_nome: appt.contacto_nome || appt.cliente_nome,
            contacto_telefone: appt.contacto_telefone ?? appt.cliente_telefone ?? null,
            contacto_email: appt.contacto_email ?? appt.cliente_email ?? null,
            prioridade: appt.prioridade,
            total_geral: 0,
            avatar: `https://i.pravatar.cc/40?u=${appt.id}`,
            titulo: appt.titulo,
            descricao: appt.descricao,
            hora_agendamento: appt.hora_agendamento
          };
          grouped['em_recepcao'].push(card);
        });

        budgets
          .filter(budget => budget.estado?.toLowerCase() === 'pendente')
          .forEach(budget => {
            const isApproved = budget.estado?.toLowerCase() === 'aprovado';
            const targetColumn = isApproved ? 'aprovado' : 'em_aprovacao';
            
            if (!grouped[targetColumn]) {
              grouped[targetColumn] = [];
            }
            const workOrderRef = budget.ref_orcamento
              .replace(/^ORC/, 'OT')
              .replace(/^OR-/, 'OT-');
            const linkedWorkOrder = workOrders.find(order => order.ref_ordem_trabalho === workOrderRef);

            // Se já existe uma ordem de trabalho associada e está em andamento ou concluída, não mostrar na coluna aprovado
            if (linkedWorkOrder && 
                (linkedWorkOrder.estado === 'em_andamento' || 
                 linkedWorkOrder.estado === 'concluido' || 
                 linkedWorkOrder.estado === 'entregue' ||
                 linkedWorkOrder.estado === 'Em Andamento' ||
                 linkedWorkOrder.estado === 'Concluído' ||
                 linkedWorkOrder.estado === 'Entregue')) {
              // Não adicionar - a OT já está em outro estado
              return;
            }

            const card: KanbanCard = {
              id: String(budget.id),
              proc: budget.ref_orcamento,
              plate: budget.veiculo?.matricula || 'N/A',
              model: budget.veiculo ? `${budget.veiculo.marca} ${budget.veiculo.modelo}` : 'N/A',
              mechanic: linkedWorkOrder?.mecanico_nome || 'N/A',
              estado: 'em_aprovacao',
              cliente_nome: budget.cliente?.nome || 'N/A',
              contacto_nome: budget.contacto_nome || budget.cliente?.nome || 'N/A',
              contacto_telefone: budget.contacto_telefone || budget.cliente?.telefone || null,
              contacto_email: budget.contacto_email || budget.cliente?.email || null,
              prioridade: linkedWorkOrder?.prioridade || 'normal',
              total_geral: budget.total_geral,
              itens_count: budget.itens_orcamento?.length ?? 0,
              itens_orcamento: budget.itens_orcamento ?? []
            };

            if (budget.data_emissao) {
              card.data_emissao = budget.data_emissao;
            }

            if (linkedWorkOrder?.ref_ordem_trabalho) {
              card.work_order_ref = linkedWorkOrder.ref_ordem_trabalho;
            }
            if (linkedWorkOrder?.mecanico_nome) {
              card.work_order_mechanic = linkedWorkOrder.mecanico_nome;
            }
            if (linkedWorkOrder?.total_geral !== undefined) {
              card.work_order_total = linkedWorkOrder.total_geral;
            }
            if (linkedWorkOrder?.data_inicio) {
              card.work_order_data_inicio = linkedWorkOrder.data_inicio;
            }
            if (linkedWorkOrder?.data_conclusao) {
              card.work_order_data_conclusao = linkedWorkOrder.data_conclusao;
            }
            if (linkedWorkOrder?.prioridade) {
              card.work_order_prioridade = linkedWorkOrder.prioridade;
            }
            if (linkedWorkOrder?.estado) {
              card.work_order_estado = linkedWorkOrder.estado;
            }
            if (linkedWorkOrder?.items && linkedWorkOrder.items.length > 0) {
              card.work_order_items = linkedWorkOrder.items;
            }
            
            // Push to targetColumn (either 'aprovado' or 'em_aprovacao')
            grouped[targetColumn].push(card);
          });

        workOrders.forEach(order => {
          const normalized = normalizeWorkOrder(order as any);
          let estado = normalized.estado || 'em_andamento';
          
          // Map Portuguese status to internal status key
          if (estado === 'Aguarda Peças') {
            estado = 'aguarda_peca';
          } else if (estado === 'Em Andamento') {
            estado = 'em_andamento';
          } else if (estado === 'Concluído') {
            estado = 'concluido';
          } else if (estado === 'Entregue') {
            estado = 'entregue';
          } else if (estado === 'Em Aprovação') {
            estado = 'em_aprovacao';
          }
          
          if (!grouped[estado]) {
            grouped[estado] = [];
          }
          
          // Find linked budget for this work order
          const workOrderNum = normalized.ref_ordem_trabalho.replace(/^OT-?/i, '');
          const linkedBudget = budgets.find(b => 
            b.ref_orcamento.replace(/^ORC-?|^OR-?/i, '') === workOrderNum
          );
          
          const card: KanbanCard = {
            id: normalized.id,
            proc: normalized.ref_ordem_trabalho,
            plate: normalized.veiculo_matricula,
            model: normalized.veiculo_modelo,
            mechanic: normalized.mecanico_nome || 'N/A',
            estado: estado,
            cliente_nome: normalized.cliente_nome,
              contacto_nome: normalized.contacto_nome || normalized.cliente_nome,
              contacto_telefone: normalized.contacto_telefone ?? null,
              contacto_email: normalized.contacto_email ?? null,
            prioridade: normalized.prioridade,
            total_geral: normalized.total_geral,
            avatar: `https://i.pravatar.cc/40?u=${normalized.id}`
          };

          if (normalized.data_inicio) {
            card.data_inicio = normalized.data_inicio;
          }
          console.log('DEBUG - Card data:', {
            ref: normalized.ref_ordem_trabalho,
            estado: estado,
            waitingParts: normalized.waitingParts,
            hasWaitingParts: !!(normalized.waitingParts && normalized.waitingParts.length > 0)
          });
          
          if (normalized.waitingParts && normalized.waitingParts.length > 0) {
            card.waiting_parts = normalized.waitingParts;
            console.log('DEBUG - Assigned waiting_parts to card:', card.waiting_parts);
          }
          if (normalized.items && normalized.items.length > 0) {
            card.work_order_items = normalized.items;
          }
          
          // Add budget items if linked budget exists and no work order items
          if (linkedBudget && (!card.work_order_items || card.work_order_items.length === 0)) {
            if (linkedBudget.itens_orcamento && linkedBudget.itens_orcamento.length > 0) {
              card.itens_orcamento = linkedBudget.itens_orcamento;
            }
          }
          
          if (normalized.data_conclusao) {
            card.data_conclusao = normalized.data_conclusao;
          }
          
          console.log('Work Order Card:', {
            ref: normalized.ref_ordem_trabalho,
            mechanic: card.mechanic,
            items: card.work_order_items?.length || 0,
            budgetItems: card.itens_orcamento?.length || 0
          });
          
          // Ensure column exists before pushing - use non-null assertion since we initialized all states above
          if (!grouped[estado]) {
            grouped[estado] = [];
          }
          (grouped[estado] as KanbanCard[]).push(card);
        });

        // Create columns
        const newColumns = stateOrder
          .filter(state => !!stateConfig[state])
          .map(state => {
            const config = stateConfig[state]!;
            return {
              id: state,
              title: config.title,
              color: config.color,
              cards: grouped[state] || []
            };
          });

        setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch work orders and today's appointments on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleCardClick = (card: KanbanCard, columnTitle: string) => {
    setSelectedCard(card);
    setSelectedColumnTitle(columnTitle);
    setIsDetailsModalOpen(true);
  };

  const handleCardDrop = async (card: KanbanCard, fromColumnId: string, toColumnId: string) => {
    const allowedTransitions: Record<string, string[]> = {
      em_recepcao: ['cancelado', 'em_aprovacao'],
      em_aprovacao: ['em_andamento', 'aguarda_peca'],
      aprovado: ['em_andamento', 'aguarda_peca'],
      em_andamento: ['aguarda_peca', 'concluido'],
      aguarda_peca: ['em_andamento'],
      concluido: ['entregue']
    };

    if (fromColumnId !== toColumnId) {
      const allowedTargets = allowedTransitions[fromColumnId] || [];
      // Caso especial: orçamento em aprovação arrastado para fora
      if (fromColumnId === 'em_aprovacao' && !allowedTargets.includes(toColumnId)) {
        // Perguntar se deseja apagar
        if (window.confirm('Deseja mesmo apagar o orçamento? Esta ação não pode ser desfeita.')) {
          try {
            await fetch(`/api/orcamentos?id=${card.id}`, { method: 'DELETE' });
            setColumns(prevColumns => {
              const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
              const fromColumn = newColumns.find(col => col.id === fromColumnId);
              if (fromColumn) {
                fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);
              }
              return newColumns;
            });
            alert('Orçamento apagado com sucesso!');
          } catch (error) {
            console.error('Erro ao apagar orçamento:', error);
            alert('Erro ao apagar orçamento. Por favor, tente novamente.');
          }
        }
        return;
      }
      if (!allowedTargets.includes(toColumnId)) {
        setShakeCardId(card.id);
        if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = setTimeout(() => setShakeCardId(null), 500);
        return;
      }
    }

    // Lógica especial: arrastar do "em_recepcao" para "cancelado" (cancelar agendamento)
    if (fromColumnId === 'em_recepcao' && toColumnId === 'cancelado') {
      try {
        const response = await fetch(`/api/agendamentos/${card.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'cancelado'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to cancel appointment');
        }

        // Remover card do UI
        setColumns(prevColumns => {
          const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
          const fromColumn = newColumns.find(col => col.id === fromColumnId);
          if (fromColumn) {
            fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);
          }
          return newColumns;
        });

        alert('Agendamento cancelado com sucesso!');
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        alert('Erro ao cancelar agendamento. Por favor, tente novamente.');
      }
      return;
    }

    // Lógica especial: arrastar do "concluido" para "entregue" (entregar ordem)
    if (fromColumnId === 'concluido' && toColumnId === 'entregue') {
      try {
        const response = await fetch('/api/ordens-trabalho', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: card.proc,
            estado: 'Entregue'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to deliver work order');
        }

        // Remover card do UI
        setColumns(prevColumns => {
          const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
          const fromColumn = newColumns.find(col => col.id === fromColumnId);
          if (fromColumn) {
            fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);
          }
          return newColumns;
        });

        alert('Ordem de trabalho entregue com sucesso!');
      } catch (error) {
        console.error('Erro ao entregar ordem de trabalho:', error);
        alert('Erro ao entregar ordem de trabalho. Por favor, tente novamente.');
      }
      return;
    }

    // Lógica especial: quando move de "em_recepcao" para "em_aprovacao"

    if (fromColumnId === 'em_recepcao' && toColumnId === 'em_aprovacao') {
      try {
        const matricula = card.plate || '';
        const cliente = card.cliente_nome || '';

        console.log('Drag from Recepção to Aprovação', { matricula, cliente, card });

        // NÃO apagar o agendamento neste momento!

        // Remover o card do Kanban
        setColumns(prevColumns => prevColumns.map(col => ({
          ...col,
          cards: col.cards.filter(c => c.id !== card.id)
        })));

        // Verificar se o veículo existe na base de dados
        const vehicleResponse = await fetch(
          `/api/veiculos/search?matricula=${encodeURIComponent(matricula)}`
        );

        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();

          if (!vehicleData.found) {
            // Veículo não existe - abrir modal de novo veículo
            setPendingCard(card);
            setPendingVehicleData({
              licensePlate: matricula,
              clientName: cliente
            });
            setIsNewVehicleModalOpen(true);
            return;
          } else {
            // Veículo existe - redirecionar para novo orçamento com dados pré-preenchidos
            const vehicle = vehicleData.vehicle;
            const newUrl = `/orcamentos/novo?agendamento_id=${encodeURIComponent(card.id)}&matricula=${encodeURIComponent(vehicle.matricula)}&cliente=${encodeURIComponent(cliente)}&from=kanban`;
            console.log('Redirecting to:', newUrl);
            router.push(newUrl);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar veículo:', error);
      }
    }

    // Lógica especial: quando move de "em_aprovacao" para "aprovado"
    // Deve automaticamente ir para "em_andamento" com OT-xxx
    if (fromColumnId === 'em_aprovacao' && (toColumnId === 'em_andamento' || toColumnId === 'aguarda_peca')) {
      try {
        // Guardar o destino pretendido
        setPendingTargetColumn(toColumnId);
        // Buscar mecânicos e abrir modal de seleção
        await fetchMechanicsForApproval();
        setPendingBudgetId(parseInt(card.id));
        setPendingCard(card);
        setSelectedMechanic('');
        setShowMechanicModal(true);
        return;
      } catch (error) {
        console.error('Erro ao preparar seleção de mecânico:', error);
        alert('Erro ao preparar seleção de mecânico. Por favor, tente novamente.');
      }
      return;
    }

    // Lógica especial: quando move de "em_andamento" para "aguarda_peca"
    if (fromColumnId === 'em_andamento' && toColumnId === 'aguarda_peca') {
      try {
        // Fetch work order items from API
        setPendingCard(card);
        setPendingWorkOrderRef(card.proc);
        setLoadingItems(true);
        setShowWaitingPartsModal(true);
        setSelectedParts(new Set());
        setWaitingParts('');

        const response = await fetch(`/api/ordens-trabalho?id=${encodeURIComponent(card.proc)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.itens_ordem_trabalho && Array.isArray(data.itens_ordem_trabalho)) {
            setWorkOrderItems(data.itens_ordem_trabalho);
            
            // Pre-select parts that are already marked as awaiting
            const waitingPartsSet = new Set<string>();
            const waitingPartsList: string[] = [];
            
            data.itens_ordem_trabalho.forEach((item: any) => {
              if (item.tipo_item === 'peca' && item.aguarda_peca === true) {
                waitingPartsSet.add(String(item.id));
                waitingPartsList.push(item.descricao);
              }
            });
            
            setSelectedParts(waitingPartsSet);
            if (waitingPartsList.length > 0) {
              setWaitingParts(waitingPartsList.join('\n'));
            }
          }
        }
        setLoadingItems(false);
        return;
      } catch (error) {
        console.error('Erro ao carregar items da ordem:', error);
        setLoadingItems(false);
      }
    }

    // Lógica especial: quando move de "em_andamento" para "concluido"
    if (fromColumnId === 'em_andamento' && toColumnId === 'concluido') {
      setPendingCard(card);
      setPendingWorkOrderRef(card.proc);
      const dateStr = new Date().toISOString().split('T')[0];
      const defaultDate = dateStr || '';
      setCompletionDate(defaultDate);
      setShowCompletionModal(true);
      return;
    }

    // Lógica especial: quando move de "aprovado" para "em_andamento" ou "aguarda_peca"
    // Buscar a referência OT correta e atualizar o card
    if (fromColumnId === 'aprovado' && (toColumnId === 'em_andamento' || toColumnId === 'aguarda_peca')) {
      // Verificar se o card tem work_order_ref
      const workOrderRef = card.work_order_ref || card.proc.replace(/^ORC/, 'OT').replace(/^OR-/, 'OT-');
      
      // Atualizar o card com a referência OT correta
      const updatedCard = {
        ...card,
        proc: workOrderRef,
        estado: toColumnId
      };
      
      // Atualizar o card na base de dados e no UI
      try {
        const response = await fetch('/api/ordens-trabalho', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: workOrderRef,
            estado: toColumnId === 'em_andamento' ? 'Em Andamento' : 'Aguarda Peças'
          }),
        });

        if (!response.ok) {
          console.error('Failed to update work order status');
        }
      } catch (woError) {
        console.error('Error updating work order:', woError);
      }
      
      // Atualizar o UI
      updateCardState(updatedCard, toColumnId);
      return;
    }

    // Para outras transições, apenas atualizar o estado
    updateCardState(card, toColumnId);
  };

  const fetchMechanicsForApproval = async () => {
    try {
      const response = await fetch('/api/mecanicos');
      if (response.ok) {
        const data = await response.json();
        setMechanics(data);
      }
    } catch (error) {
      console.error('Failed to fetch mechanics:', error);
    }
  };

  const handleApproveBudget = async () => {
    if (!pendingBudgetId || !selectedMechanic) {
      alert('Por favor selecione um mecânico');
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos?id=${pendingBudgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'Aprovado',
          mecanico_id: parseInt(selectedMechanic)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve budget');
      }

      // Gerar a referência OT a partir do orçamento
      const workOrderRef = pendingCard?.proc
        .replace(/^ORC/, 'OT')
        .replace(/^OR-/, 'OT-') || 'OT-001';

      // Se o destino é "aguarda_peca", abrir o modal de peças com os itens do orçamento
      if (pendingTargetColumn === 'aguarda_peca' && pendingCard) {
        // Buscar os itens do orçamento para mostrar no modal
        const budgetItems = pendingCard.itens_orcamento || [];
        
        // Preparar os itens como peças
        const pecaItems = budgetItems.map((item, index) => ({
          id: item.id || index + 1000,
          tipo_item: 'peca',
          descricao: item.descricao,
          quantidade: item.quantidade,
          preco_unitario: item.valor_total / item.quantidade,
          valor_total: item.valor_total
        }));
        
        // Configurar o estado para o modal de peças
        setWorkOrderItems(pecaItems);
        setPendingWorkOrderRef(workOrderRef);
        setLoadingItems(false);
        
        // Atualizar o pendingCard com a referência OT
        const mechanicName = mechanics.find(m => m.id === parseInt(selectedMechanic))?.nome || 'N/A';
        setPendingCard({
          ...pendingCard,
          proc: workOrderRef,
          mechanic: mechanicName,
          work_order_ref: workOrderRef
        });
        
        // Fechar modal de mecânico
        setShowMechanicModal(false);
        setSelectedMechanic('');
        setPendingBudgetId(null);
        
        // Abrir o modal de peças
        setShowWaitingPartsModal(true);
        setSelectedParts(new Set());
        setWaitingParts('');
        
        return;
      }

      // Se existir uma ordem de trabalho associada, atualizar o seu estado para "em_andamento"
      if (pendingCard && pendingCard.work_order_ref) {
        try {
          const woResponse = await fetch('/api/ordens-trabalho', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: pendingCard.work_order_ref,
              estado: 'Em Andamento'
            }),
          });

          if (!woResponse.ok) {
            console.error('Failed to update work order status');
            // Continuar mesmo se falhar a atualização da OT
          }
        } catch (woError) {
          console.error('Error updating work order:', woError);
          // Continuar mesmo se falhar
        }
      }

      // Fechar modal e atualizar estado
      setShowMechanicModal(false);
      setSelectedMechanic('');
      setPendingBudgetId(null);

      // Atualizar o card no UI - vai diretamente para "em_andamento" com OT
      if (pendingCard) {
        // Gerar a referência OT a partir do orçamento
        const workOrderRef = pendingCard.proc
          .replace(/^ORC/, 'OT')
          .replace(/^OR-/, 'OT-');
        
        // Atualizar a referência do card para usar a OT em vez do OR
        const updatedCard = {
          ...pendingCard,
          proc: workOrderRef
        };
        
        // Remover da coluna "em_aprovacao" e adicionar na coluna "em_andamento"
        updateCardState(updatedCard, pendingTargetColumn || 'em_andamento');
        setPendingCard(null);
      }
    } catch (err) {
      alert('Erro ao aprovar orçamento: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const updateCardState = async (card: KanbanCard, newColumnId: string) => {
    try {
      // Aqui você pode adicionar lógica para atualizar o backend
      // Por enquanto, vamos apenas refletir a mudança no UI
      setColumns(prevColumns => {
        // Find which column the card is currently in - check both id and proc
        const fromColumnIndex = prevColumns.findIndex(col =>
          col.cards.some(c => c.id === card.id || c.proc === card.proc)
        );

        if (fromColumnIndex === -1 || !prevColumns[fromColumnIndex]) {
          return prevColumns;
        }

        // Create new columns array
        const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
        const fromColumn = newColumns[fromColumnIndex];

        if (!fromColumn) return prevColumns;

        // Remove card from current column - check both id and proc
        fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id && c.proc !== card.proc);

        // Add card to new column
        const toColumnIndex = newColumns.findIndex(col => col.id === newColumnId);
        if (toColumnIndex !== -1 && newColumns[toColumnIndex]) {
          newColumns[toColumnIndex].cards.push({ ...card, estado: newColumnId });
        }

        return newColumns;
      });
    } catch (error) {
      console.error('Erro ao atualizar estado do card:', error);
    }
  };

  const handleNewVehicleSuccess = async () => {
    // Após criar novo veículo, abrir nova página de orçamento
    setIsNewVehicleModalOpen(false);
    
    // Redirecionar para a página de novo orçamento com a matricula pré-preenchida
    if (pendingCard && pendingCard.plate) {
      router.push(
        `/orcamentos/novo?agendamento_id=${encodeURIComponent(pendingCard.id)}&matricula=${encodeURIComponent(pendingCard.plate)}&cliente=${encodeURIComponent(pendingCard.cliente_nome || '')}&from=kanban`
      );
      setPendingCard(null);
    }
  };

  const handleNewBudgetSuccess = async () => {
    // Neste caso, vamos redirecionar diretamente para novo orçamento
    // sem precisar criar veículo
    setIsNewVehicleModalOpen(false);
    
    if (pendingCard && pendingCard.plate && pendingVehicleData) {
      router.push(
        `/orcamentos/novo?agendamento_id=${encodeURIComponent(pendingCard.id)}&matricula=${encodeURIComponent(pendingVehicleData.veiculo_matricula)}&cliente=${encodeURIComponent(pendingCard.cliente_nome || '')}&from=kanban`
      );
      setPendingCard(null);
    }
  };

  const handleSaveWaitingParts = async () => {
    if (!pendingWorkOrderRef || !pendingCard) return;

    const selectedPartIds = Array.from(selectedParts);

    if (selectedPartIds.length === 0) {
      alert('Por favor, selecione pelo menos uma peça em espera.');
      return;
    }

    try {
      const response = await fetch('/api/ordens-trabalho', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pendingWorkOrderRef,
          estado: 'Aguarda Peças',
          selectedPartIds: selectedPartIds
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update work order');
      }

      // Close modal and update UI
      setShowWaitingPartsModal(false);
      setPendingWorkOrderRef(null);
      setSelectedParts(new Set());
      setWaitingParts('');
      setWorkOrderItems([]);

      // Update card state
      updateCardState(pendingCard, 'aguarda_peca');
      setPendingCard(null);

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar ordem de trabalho:', error);
      alert('Erro ao atualizar ordem de trabalho');
    }
  };

  const handleSaveCompletion = async () => {
    if (!pendingWorkOrderRef || !pendingCard) return;

    try {
      const response = await fetch('/api/ordens-trabalho', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pendingWorkOrderRef,
          estado: 'Concluído',
          data_conclusao: completionDate?.trim() ? completionDate : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update work order');
      }

      // Close modal and update UI
      setShowCompletionModal(false);
      setPendingWorkOrderRef(null);
      setCompletionDate('');

      // Update card state
      updateCardState(pendingCard, 'concluido');
      setPendingCard(null);

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar ordem de trabalho:', error);
      alert('Erro ao atualizar ordem de trabalho');
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Carregando dados...</div>;
  }

  const handleCardDragStart = (card: KanbanCard, fromColumnId: string) => {
    console.log('Drag started:', { card, fromColumnId });
    setDraggedCard({ card, fromColumnId });
  };

  return (
    <>
      <div className="kanban-board">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={handleCardClick}
            onCardDrop={handleCardDrop}
            onCardDragStart={handleCardDragStart}
            isReadOnly={false}
            shakeCardId={shakeCardId}
          />
        ))}
      </div>

      <KanbanCardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        card={selectedCard}
        columnTitle={selectedColumnTitle}
        isReadOnly={true}
      />

      <NewVehicleModal
        isOpen={isNewVehicleModalOpen}
        onClose={() => {
          setIsNewVehicleModalOpen(false);
          setPendingCard(null);
          setPendingVehicleData(null);
        }}
        onSuccess={handleNewVehicleSuccess}
        vehicle={pendingVehicleData}
      />

      {/* Modal de Seleção de Mecânico para Aprovação */}
      {showMechanicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Selecionar Mecânico</h2>
            <select
              value={selectedMechanic}
              onChange={(e) => setSelectedMechanic(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded mb-4"
            >
              <option value="">-- Selecione um mecânico --</option>
              {mechanics.map((mechanic) => (
                <option key={mechanic.id} value={mechanic.id}>
                  {mechanic.nome}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMechanicModal(false);
                  setSelectedMechanic('');
                  setPendingBudgetId(null);
                  setPendingCard(null);
                }}
                className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleApproveBudget}
                className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aguarda Peças */}
      {showWaitingPartsModal && pendingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-none p-6 w-96 max-w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Aguarda Peças - {pendingCard.proc}</h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Peças em Espera</label>
              
              {loadingItems ? (
                <div className="text-gray-500 text-sm mb-2">Carregando peças...</div>
              ) : workOrderItems.filter(item => item.tipo_item === 'peca').length > 0 ? (
                <div className="mb-3 bg-gray-700 p-2 border border-gray-600 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-400">Selecione as peças em falta:</p>
                    <button 
                      type="button"
                      className="text-xs text-brand-yellow hover:text-white transition-colors"
                      onClick={() => {
                        // Select all part IDs
                        const allPartIds = new Set(
                          workOrderItems
                            .filter(item => item.tipo_item === 'peca')
                            .map(item => String(item.id))
                        );
                        setSelectedParts(allPartIds);
                        
                        // Also update the text
                        const allParts = workOrderItems
                          .filter(item => item.tipo_item === 'peca')
                          .map(item => item.descricao)
                          .join('\n');
                        setWaitingParts(allParts);
                      }}
                    >
                      Selecionar Todas
                    </button>
                  </div>
                  {workOrderItems.filter(item => item.tipo_item === 'peca').map(item => (
                    <div key={item.id} className="flex items-center mb-1">
                      <input 
                        type="checkbox" 
                        id={`part-${item.id}`}
                        className="mr-2"
                        checked={selectedParts.has(String(item.id))}
                        onChange={(e) => {
                          const itemId = String(item.id);
                          const newSelectedParts = new Set(selectedParts);
                          if (e.target.checked) {
                            newSelectedParts.add(itemId);
                          } else {
                            newSelectedParts.delete(itemId);
                          }
                          setSelectedParts(newSelectedParts);
                          
                          // Update waitingParts text based on selection
                          const selectedItems = workOrderItems.filter(i => 
                            i.tipo_item === 'peca' && newSelectedParts.has(String(i.id))
                          );
                          setWaitingParts(selectedItems.map(i => i.descricao).join('\n'));
                        }}
                      />
                      <label htmlFor={`part-${item.id}`} className="text-sm text-gray-300 cursor-pointer select-none">
                        {item.descricao || ''} <span className="text-gray-500 text-xs">({item.quantidade})</span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-xs italic mb-2">Nenhuma peça encontrada nesta ordem de trabalho.</div>
              )}

              <textarea 
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                rows={3}
                placeholder="Liste as peças necessárias..."
                value={waitingParts || ''}
                onChange={(e) => setWaitingParts(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowWaitingPartsModal(false);
                  setPendingWorkOrderRef(null);
                  setPendingCard(null);
                  setSelectedParts(new Set());
                  setWaitingParts('');
                  setWorkOrderItems([]);
                }}
                className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveWaitingParts}
                className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conclusão */}
      {showCompletionModal && pendingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-none p-6 w-96 max-w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Concluir Ordem - {pendingCard.proc}</h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Data de Conclusão (opcional - será preenchida automaticamente)</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                placeholder="Deixe em branco para usar data atual"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
              <p className="text-gray-500 text-xs mt-1">Se deixar em branco, será usada a data e hora atual</p>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setPendingWorkOrderRef(null);
                  setPendingCard(null);
                  setCompletionDate('');
                }}
                className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCompletion}
                className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none shadow-md"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

