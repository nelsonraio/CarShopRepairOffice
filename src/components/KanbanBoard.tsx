"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KanbanColumn from "./KanbanColumn";
import KanbanCardDetailsModal from "./KanbanCardDetailsModal";
import NewVehicleModal from "./NewVehicleModal";

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
    case 'Em Andamento': return 'em_andamento';
    case 'Aguarda Peças': return 'aguarda_peca';
    case 'Concluído': return 'concluido';
    case 'Entregue': return 'entregue';
    case 'Cancelado': return 'cancelado';
    default: return undefined;
  }
};

const normalizeWorkOrder = (order: any): WorkOrder => {
  const vehicle = order.vehicle ?? '';
  const [vehicleInfo, vehiclePlate] = vehicle.split('|').map((part: string) => part.trim());

  return {
    id: order.ref_ordem_trabalho ?? order.id ?? '',
    ref_ordem_trabalho: order.ref_ordem_trabalho ?? order.id ?? '',
    veiculo_modelo: order.veiculo_modelo ?? vehicleInfo ?? 'N/A',
    veiculo_matricula: order.veiculo_matricula ?? vehiclePlate ?? 'N/A',
    mecanico_nome: order.mecanico_nome ?? order.mechanic ?? 'N/A',
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
  'em_andamento': { title: 'Em Andamento', color: 'text-blue-400' },
  'aguarda_peca': { title: 'Aguarda Peças', color: 'text-orange-400' },
  'concluido': { title: 'Concluído', color: 'text-yellow-400' }
};

const stateOrder = ['em_recepcao', 'em_aprovacao', 'em_andamento', 'aguarda_peca', 'concluido'];

export default function KanbanBoard() {
  const router = useRouter();
  const [columns, setColumns] = useState<KanbanColumnData[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnTitle, setSelectedColumnTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [pendingVehicleData, setPendingVehicleData] = useState<any>(null);
  const [pendingCard, setPendingCard] = useState<KanbanCard | null>(null);

  // Fetch work orders and today's appointments on mount
  useEffect(() => {
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
            contacto_nome: appt.cliente_nome,
            contacto_telefone: appt.cliente_telefone ?? null,
            contacto_email: appt.cliente_email ?? null,
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
            if (!grouped['em_aprovacao']) {
              grouped['em_aprovacao'] = [];
            }
            const workOrderRef = budget.ref_orcamento
              .replace(/^ORC/, 'OT')
              .replace(/^OR-/, 'OT-');
            const linkedWorkOrder = workOrders.find(order => order.ref_ordem_trabalho === workOrderRef);

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
              prioridade: 'normal',
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
            grouped['em_aprovacao'].push(card);
          });

        workOrders.forEach(order => {
          const normalized = normalizeWorkOrder(order as any);
          const estado = normalized.estado || 'em_andamento';
          if (!grouped[estado]) {
            grouped[estado] = [];
          }
          
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
          if (normalized.waitingParts && normalized.waitingParts.length > 0) {
            card.waiting_parts = normalized.waitingParts;
          }
          if (normalized.items && normalized.items.length > 0) {
            card.work_order_items = normalized.items;
          }
          
          if (normalized.data_conclusao) {
            card.data_conclusao = normalized.data_conclusao;
          }
          
          grouped[estado].push(card);
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

    fetchData();
  }, []);

  const handleCardClick = (card: KanbanCard, columnTitle: string) => {
    setSelectedCard(card);
    setSelectedColumnTitle(columnTitle);
    setIsDetailsModalOpen(true);
  };

  const handleCardDrop = async (card: KanbanCard, fromColumnId: string, toColumnId: string) => {
    // Lógica especial: quando move de "em_recepcao" para "em_aprovacao"
    if (fromColumnId === 'em_recepcao' && toColumnId === 'em_aprovacao') {
      try {
        const matricula = card.plate || '';
        const cliente = card.cliente_nome || '';
        
        console.log('Drag from Recepção to Aprovação', { matricula, cliente, card });
        
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
            const newUrl = `/orcamentos/novo?matricula=${encodeURIComponent(vehicle.matricula)}&cliente=${encodeURIComponent(cliente)}`;
            console.log('Redirecting to:', newUrl);
            router.push(newUrl);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar veículo:', error);
      }
    }

    // Para outras transições, apenas atualizar o estado
    updateCardState(card, toColumnId);
  };

  const updateCardState = async (card: KanbanCard, newColumnId: string) => {
    try {
      // Aqui você pode adicionar lógica para atualizar o backend
      // Por enquanto, vamos apenas refletir a mudança no UI
      setColumns(prevColumns => {
        // Find which column the card is currently in
        const fromColumnIndex = prevColumns.findIndex(col =>
          col.cards.some(c => c.id === card.id)
        );

        if (fromColumnIndex === -1 || !prevColumns[fromColumnIndex]) {
          return prevColumns;
        }

        // Create new columns array
        const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
        const fromColumn = newColumns[fromColumnIndex];

        if (!fromColumn) return prevColumns;

        // Remove card from current column
        fromColumn.cards = fromColumn.cards.filter(c => c.id !== card.id);

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
        `/orcamentos/novo?matricula=${encodeURIComponent(pendingCard.plate)}&cliente=${encodeURIComponent(pendingCard.cliente_nome || '')}`
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
        `/orcamentos/novo?matricula=${encodeURIComponent(pendingVehicleData.veiculo_matricula)}&cliente=${encodeURIComponent(pendingCard.cliente_nome || '')}`
      );
      setPendingCard(null);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Carregando dados...</div>;
  }

  return (
    <>
      <div className="kanban-board">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={handleCardClick}
            onCardDrop={handleCardDrop}
            isReadOnly={false}
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
    </>
  );
}
