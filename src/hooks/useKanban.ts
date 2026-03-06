import { useState, useEffect } from 'react';

// Types
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
  waitingParts?: Array<any>;
  items?: Array<any>;
}

interface Appointment {
  id: string;
  ref_agendamento: string;
  veiculo_modelo: string;
  veiculo_matricula: string;
  mecanico_nome: string;
  cliente_nome: string;
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
  cliente?: { nome: string };
  veiculo?: { marca: string; modelo: string };
}

interface KanbanData {
  workOrders: WorkOrder[];
  appointments: Appointment[];
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para gerenciar dados do Kanban
 * Centraliza fetch de ordens, agendamentos e orçamentos
 */
export const useKanbanData = (): KanbanData => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [ordersRes, appointmentsRes, budgetsRes] = await Promise.all([
        fetch('/api/ordens-trabalho?estado=agendado,em_progresso,pausado'),
        fetch('/api/agendamentos?estado=agendado'),
        fetch('/api/orcamentos?estado=pendente')
      ]);

      if (!ordersRes.ok || !appointmentsRes.ok || !budgetsRes.ok) {
        throw new Error('Falha ao carregar dados');
      }

      const [ordersData, appointmentsData, budgetsData] = await Promise.all([
        ordersRes.json(),
        appointmentsRes.json(),
        budgetsRes.json()
      ]);

      setWorkOrders(ordersData || []);
      setAppointments(appointmentsData || []);
      setBudgets(budgetsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar dados Kanban:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workOrders,
    appointments,
    budgets,
    isLoading,
    error
  };
};

/**
 * Hook para gerenciar estado de modals
 */
export const useModalState = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const openModal = (modalName: string, card?: any) => {
    setActiveModal(modalName);
    if (card) setSelectedCard(card);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCard(null);
  };

  return {
    activeModal,
    selectedCard,
    openModal,
    closeModal
  };
};

/**
 * Hook para gerenciar drag & drop
 */
export const useDragDrop = () => {
  const [draggedCard, setDraggedCard] = useState<any>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);

  const handleDragStart = (card: any, source: string) => {
    setDraggedCard(card);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragSource(null);
  };

  return {
    draggedCard,
    dragSource,
    handleDragStart,
    handleDragEnd
  };
};
