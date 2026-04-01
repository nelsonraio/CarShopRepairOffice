'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useFetch, useModal, useModals, usePagination, useFilters, filterPredicates } from '@/hooks';

interface WorkOrder {
  id: string;
  client: string;
  vehicle: string;
  mechanic: string;
  openDate: string;
  closeDate: string;
  status: 'Em Andamento' | 'Aguardando Peças' | 'Concluída' | 'Entregue' | 'Cancelada';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  problem: string;
  waitingParts: string;
}

type RawWorkOrder = Record<string, any>;

const mapApiStatusToUi = (status: string): WorkOrder['status'] => {
  const s = String(status || '').toLowerCase();
  if (s === 'aguarda_peca' || s === 'aguardando pecas') return 'Aguardando Peças';
  if (s === 'concluido' || s === 'concluida') return 'Concluída';
  if (s === 'entregue') return 'Entregue';
  if (s === 'cancelado' || s === 'cancelada') return 'Cancelada';
  return 'Em Andamento';
};

const mapApiPriorityToUi = (priority: string): WorkOrder['priority'] => {
  const p = String(priority || '').toLowerCase();
  if (p === 'baixa') return 'Baixa';
  if (p === 'alta') return 'Alta';
  if (p === 'urgente') return 'Urgente';
  return 'Normal';
};

const normalizeWorkOrder = (order: RawWorkOrder): WorkOrder => {
  const waitingPartsArr = Array.isArray(order.waitingParts) ? order.waitingParts : [];
  const waitingPartsText = waitingPartsArr
    .map((item: any) => {
      const description = typeof item?.descricao === 'string' ? item.descricao.trim() : '';
      const reference = typeof item?.referencia === 'string' ? item.referencia.trim() : '';
      if (!description) return '';
      return reference ? `${description} (${reference})` : description;
    })
    .filter((v: unknown): v is string => typeof v === 'string' && v.trim().length > 0)
    .join('\n');

  const ref = String(order.ref_ordem_trabalho || order.refOrdemTrabalho || '').trim();
  const numericId = String(order.id || '').trim();

  return {
    id: ref || numericId,
    client: String(order.cliente_nome || order.client || ''),
    vehicle: String(order.veiculo_modelo || order.vehicle || ''),
    mechanic: String(order.mecanico_nome || order.mechanic || ''),
    openDate: String(order.data_inicio || order.openDate || ''),
    closeDate: String(order.data_conclusao || order.closeDate || ''),
    status: mapApiStatusToUi(String(order.estado || order.status || '')),
    priority: mapApiPriorityToUi(String(order.prioridade || order.priority || '')),
    problem: String(order.descricao_problema || order.problem || ''),
    waitingParts: waitingPartsText || String(order.waitingParts || '')
  };
};

interface WorkOrderItem {
  id: string | number;
  tipo_item: string;
  descricao: string;
  referencia?: string | undefined;
  quantidade: number | string;
  [key: string]: any;
}

// Pagination configuration
const ITEMS_PER_PAGE = 20;

// Work order field labels
const WORK_ORDER_FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  client: 'Cliente',
  vehicle: 'Veículo',
  mechanic: 'Mecânico',
  openDate: 'Data de Abertura',
  closeDate: 'Data de Encerramento',
  status: 'Estado',
  priority: 'Prioridade',
  problem: 'Descrição do Problema',
  waitingParts: 'Peças em Espera',
};

/**
 * Work Orders Page - Manage work orders and their status
 * Uses custom hooks for state management:
 * - useFetch: Load work orders
 * - useModal: Details modal state
 * - useModals: Multiple modals (details + status update)
 * - usePagination: Pagination with filter reset
 * - useFilters: Multi-field search and filtering
 */
const WorkOrdersPage = () => {
  // Data fetching
  const { data: rawWorkOrders = [], loading, error, refetch } = useFetch<RawWorkOrder[]>('/api/ordens-trabalho');
  const workOrders = (rawWorkOrders || []).map(normalizeWorkOrder);

  // Modal states
  const { isOpen: detailsModalOpen, selectedItem: detailsWorkOrder, select: selectDetailsWorkOrder, close: closeDetailsModal } = useModal<WorkOrder>();
  const { modals: statusModals, open: openStatusModal, close: closeStatusModal } = useModals({
    showStatusModal: false,
  });

  // Status modal item state
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [completionDate, setCompletionDate] = useState('');
  const [waitingParts, setWaitingParts] = useState('');
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState(false);
  const [detailsItems, setDetailsItems] = useState<WorkOrderItem[]>([]);
  const [detailsLoadingItems, setDetailsLoadingItems] = useState(false);

  // Auto-refresh when page becomes visible (fixes sync issues after Kanban updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refetch);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refetch);
    };
  }, [refetch]);

  // Filtering configuration
  const filterConfig = {
    search: filterPredicates.search(['client', 'vehicle', 'id', 'mechanic']),
    status: filterPredicates.exact('status'),
    priority: filterPredicates.exact('priority'),
  };

  const { filters, setFilter } = useFilters(workOrders, filterConfig);

  // Apply filters
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = (filters.search || '') === '' ||
      workOrder.client.toLowerCase().includes((filters.search || '').toLowerCase()) ||
      workOrder.vehicle.toLowerCase().includes((filters.search || '').toLowerCase()) ||
      workOrder.id.toLowerCase().includes((filters.search || '').toLowerCase()) ||
      workOrder.mechanic.toLowerCase().includes((filters.search || '').toLowerCase());

    const matchesStatus = (filters.status || '') === '' || workOrder.status === filters.status;
    const matchesPriority = (filters.priority || '') === '' || workOrder.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination with filter reset
  const { currentPage, totalPages, paginatedItems: paginatedWorkOrders, nextPage, prevPage } = 
    usePagination(filteredWorkOrders, ITEMS_PER_PAGE, [filters.search, filters.status, filters.priority]);

  // Pagination info
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredWorkOrders.length);

  // Details modal handler
  const handleWorkOrderIdClick = async (workOrder: WorkOrder) => {
    selectDetailsWorkOrder(workOrder);

    setDetailsItems([]);
    setDetailsLoadingItems(true);
    try {
      const response = await fetch(`/api/ordens-trabalho?id=${encodeURIComponent(workOrder.id)}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (Array.isArray(data.itens_ordem_trabalho)) {
        setDetailsItems(data.itens_ordem_trabalho);
      }
    } catch (err) {
      console.error('Error fetching work order details items:', err);
    } finally {
      setDetailsLoadingItems(false);
    }
  };

  // Status modal handlers
  const handleStatusClick = async (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setNewStatus(workOrder.status);
    const defaultDate = new Date().toISOString().split('T')[0];
    setCompletionDate(workOrder.closeDate || defaultDate || '');
    setWaitingParts(workOrder.waitingParts || '');
    setSelectedParts(new Set());
    setWorkOrderItems([]);
    setLoadingItems(true);
    openStatusModal('showStatusModal');

    // Fetch work order items from API
    try {
      const response = await fetch(`/api/ordens-trabalho?id=${encodeURIComponent(workOrder.id)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.itens_ordem_trabalho && Array.isArray(data.itens_ordem_trabalho)) {
          setWorkOrderItems(data.itens_ordem_trabalho);
          
          // Pre-select waiting parts
          const waitingPartsSet = new Set<string>();
          const waitingPartsList: string[] = [];
          data.itens_ordem_trabalho.forEach((item: any) => {
            if (item.tipo_item === 'peca' && item.aguarda_peca === true) {
              waitingPartsSet.add(String(item.id));
              waitingPartsList.push(item.referencia ? `${item.descricao} (${item.referencia})` : item.descricao);
            }
          });
          
          setSelectedParts(waitingPartsSet);
          if (waitingPartsList.length > 0) {
            setWaitingParts(waitingPartsList.join('\n'));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching work order items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  // Save status changes
  const handleSaveStatus = async () => {
    if (!selectedWorkOrder) return;

    const isReopeningFromConcluded =
      selectedWorkOrder.status === 'Concluída' &&
      (newStatus === 'Em Andamento' || newStatus === 'Aguardando Peças');

    let confirmReopen = false;
    if (isReopeningFromConcluded) {
      confirmReopen = window.confirm(
        'Esta ordem de trabalho está concluída. Deseja mesmo reabrir? As peças usadas serão repostas em stock.'
      );
      if (!confirmReopen) {
        return;
      }
    }

    // Get selected part IDs from workOrderItems
    const waitingPartsStr = typeof waitingParts === 'string' ? waitingParts : '';
    const selectedPartIds = workOrderItems
      .filter(item => item.tipo_item === 'peca' && waitingPartsStr.split('\n').map(p => p.trim()).includes(item.descricao))
      .map(item => String(item.id));

    if (newStatus === 'Aguardando Peças' && selectedPartIds.length === 0) {
      alert('Por favor, selecione pelo menos uma peça em espera.');
      return;
    }

    // Create updated work order object
    const updatedOrder: WorkOrder = {
      ...selectedWorkOrder,
      status: newStatus as WorkOrder['status'],
      closeDate: (newStatus === 'Concluída' || newStatus === 'Entregue') ? completionDate : (selectedWorkOrder.closeDate || ''),
      waitingParts: newStatus === 'Aguardando Peças' ? (waitingParts || '') : (selectedWorkOrder.waitingParts || '')
    };

    try {
      // Call API to persist changes
      const response = await fetch('/api/ordens-trabalho', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedWorkOrder.id,
          estado: newStatus,
          data_conclusao: (newStatus === 'Concluída' || newStatus === 'Entregue') ? completionDate : null,
          waitingParts: newStatus === 'Aguardando Peças' ? waitingParts : null,
          selectedPartIds: newStatus === 'Aguardando Peças' ? selectedPartIds : [],
          confirmReopen
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update work order');
      }

      // Refresh data after successful update
      await refetch();

      // Close modal after successful update
      closeStatusModal('showStatusModal');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar estado da ordem de trabalho');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Em Andamento': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-900';
      case 'Aguardando Peças': return 'text-orange-400 bg-orange-900/30 border border-orange-900';
      case 'Concluída': return 'text-green-400 bg-green-900/30 border border-green-900';
      case 'Entregue': return 'text-blue-400 bg-blue-900/30 border border-blue-900';
      case 'Cancelada': return 'text-red-400 bg-red-900/30 border border-red-900';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Baixa': return 'text-gray-400 bg-gray-900/30 border border-gray-900';
      case 'Normal': return 'text-blue-400 bg-blue-900/30 border border-blue-900';
      case 'Alta': return 'text-orange-400 bg-orange-900/30 border border-orange-900';
      case 'Urgente': return 'text-red-400 bg-red-900/30 border border-red-900';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const handlePrintWorkOrder = async (workOrder: WorkOrder) => {
    // Fetch work order items from API
    let workOrderItems: WorkOrderItem[] = [];
    try {
      const response = await fetch(`/api/ordens-trabalho?id=${encodeURIComponent(workOrder.id)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.itens_ordem_trabalho && Array.isArray(data.itens_ordem_trabalho)) {
          workOrderItems = data.itens_ordem_trabalho;
        }
      }
    } catch (err) {
      console.error('Error fetching work order items:', err);
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Gerar as linhas da tabela dinamicamente
    const rows = workOrderItems.length > 0 ? workOrderItems.map(item => `
      <tr>
        <td>${item.referencia ? `${item.descricao} (${item.referencia})` : item.descricao}</td>
        <td>${item.quantidade}</td>
        <td></td>
      </tr>
    `).join('') : '<tr><td>-</td><td>-</td><td></td></tr>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Ordem de Trabalho - ${workOrder.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
            
            /* Cabeçalho */
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo-section { display: flex; align-items: center; }
            .logo-section img { width: 70px; margin-right: 15px; }
            .company-name h1 { margin: 0; font-size: 20px; font-weight: bold; }
            .company-name p { margin: 0; font-size: 14px; }
            .contacts-section { text-align: right; font-size: 12px; line-height: 1.4; }

            /* Dados da Ordem de Trabalho */
            .doc-info { margin-top: 10px; margin-bottom: 20px; line-height: 1.6; }
            .doc-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .client-details { font-size: 14px; }

            /* Tabela */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #666; color: #fff; border: 1px solid #000; padding: 10px; text-transform: uppercase; font-size: 13px; }
            td { border: 1px solid #000; padding: 10px; text-align: center; font-size: 13px; }
            td:first-child { text-align: left; width: 60%; }

            /* Mecânico */
            .mechanic-section { 
              margin-top: 30px; 
              border: 2px solid #000; 
              background-color: #f5f5f5; 
              padding: 15px; 
              font-size: 14px;
              text-align: center;
            }
            .mechanic-label { font-weight: bold; margin-bottom: 5px; text-align: center; }
            .mechanic-name { font-size: 16px; color: #333; text-align: center; }

            /* Assinaturas */
            .signatures-section { margin-top: 50px; text-align: center; }
            .sig-block { margin-bottom: 40px; font-size: 12px; display: flex; flex-direction: column; align-items: center; }
            .sig-line { border-bottom: 1px solid #000; width: 250px; margin: 0 auto; margin-top: 35px; }
            
            @media print {
              body { margin: 20mm; }
              th { -webkit-print-color-adjust: exact; }
              img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <div style="background: white; padding: 5px; border-radius: 4px; display: inline-block; margin-right: 15px;">
                <img src="/logoblack.jpg" alt="MQAuto Logo" style="width: 50px; height: 50px; object-fit: contain; display: block;" />
              </div>
              <div class="company-name">
                <h1>MQ Auto</h1>
                <p>Oficina Automóvel</p>
              </div>
            </div>
            <div class="contacts-section">
              <p>(+351) 935 205 354</p>
              <p>montesquaresmalda@outlook.com</p>
            </div>
          </div>

          <div class="doc-info">
            <div class="doc-title">Ordem de Trabalho: ${workOrder.id}</div>
            <div class="client-details">
              <p>Cliente: ${workOrder.client || ''}</p>
              <p>Veículo: ${workOrder.vehicle || ''}</p>
              <p>Data: ${new Date().toLocaleDateString('pt-PT')}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DESCRIÇÃO / SERVIÇO</th>
                <th>QUANTIDADE</th>
                <th>CONCLUÍDO</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="mechanic-section">
            <div class="mechanic-label">Responsável da Reparação</div>
            <div class="mechanic-name">${workOrder.mechanic || '_____________________________'}</div>
          </div>
          <div class="signatures-section">
            <div class="sig-block">
              <p>Assinatura do Responsável:</p>
              <div class="sig-line"></div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Pequeno delay para garantir que o estilo é aplicado antes da impressão
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="ordens-trabalho" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Ordens de Trabalho</h2>
            <p className="mt-1 text-gray-400">Gerencie as ordens de trabalho ativas</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-gray-700 border border-gray-600 p-4 rounded-none flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Procurar por cliente, veículo, OT ou mecânico..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition placeholder-gray-500"
                value={filters.search || ''}
                onChange={(e) => setFilter('search', e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                value={filters.status || ''}
                onChange={(e) => setFilter('status', e.target.value)}
              >
                <option value="">Todos os Estados</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Aguardando Peças">Aguardando Peças</option>
                <option value="Concluída">Concluída</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                value={filters.priority || ''}
                onChange={(e) => setFilter('priority', e.target.value)}
              >
                <option value="">Todas as Prioridades</option>
                <option value="Baixa">Baixa</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-400">Carregando ordens de trabalho...</div>
                </div>
              ) : error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
                  Erro ao carregar ordens de trabalho: {error}
                </div>
              ) : (
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nº OT</th>
                      <th scope="col" className="px-6 py-3">Veículo</th>
                      <th scope="col" className="px-6 py-3">Cliente</th>
                      <th scope="col" className="px-6 py-3">Mecânico</th>
                      <th scope="col" className="px-6 py-3">Data Abertura</th>
                      <th scope="col" className="px-6 py-3">Data de Fecho</th>
                      <th scope="col" className="px-6 py-3 text-center">Prioridade</th>
                      <th scope="col" className="px-6 py-3 text-center">Estado</th>
                      <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {filteredWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          Nenhuma ordem de trabalho encontrada.
                        </td>
                      </tr>
                    ) : (
                      paginatedWorkOrders.map(workOrder => (
                        <tr key={workOrder.id} className="hover:bg-gray-600 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                            <button
                              className="underline text-brand-yellow hover:text-yellow-400 cursor-pointer"
                              onClick={() => handleWorkOrderIdClick(workOrder)}
                              title="Ver detalhes da OT"
                            >
                              {workOrder.id}
                            </button>
                          </td>
                          
                          <td className="px-6 py-4 text-gray-400">{workOrder.vehicle}</td>
                          <td className="px-6 py-4">{workOrder.client}</td>
                          <td className="px-6 py-4 text-gray-400">{workOrder.mechanic}</td>
                          <td className="px-6 py-4 text-gray-400">{workOrder.openDate}</td>
                          <td className="px-6 py-4 text-gray-400">{workOrder.closeDate || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                              {workOrder.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                              {workOrder.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                                title="Alterar Estado"
                                onClick={() => handleStatusClick(workOrder)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                              </button>
                              <button
                                className="text-orange-400 hover:text-orange-300 transition-colors"
                                title="Imprimir Ordem de Trabalho"
                                onClick={() => handlePrintWorkOrder(workOrder)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredWorkOrders.length > 0 && (
              <div className="bg-gray-800 px-4 py-3 border-t border-gray-600 flex items-center justify-between rounded-b">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{endIndex}</span> de <span className="font-medium text-gray-200">{filteredWorkOrders.length}</span> ordens de trabalho
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-3">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Work Order Details Modal */}
      {detailsModalOpen && detailsWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Detalhes da Ordem de Trabalho</h3>
            <div className="space-y-2 text-gray-200">
              {Object.entries(detailsWorkOrder).map(([key, value]) => {
                if (key === 'items') return null;
                // evitar mostrar mecanico_nome se já existe mechanic
                if (key === 'mecanico_nome' && ('mechanic' in detailsWorkOrder)) {
                  return null;
                }
                if (key === 'waitingParts' && detailsWorkOrder.status !== 'Aguardando Peças') {
                  return null;
                }
                const label = WORK_ORDER_FIELD_LABELS[key] 
                  || (key === 'mecanico_nome' ? 'Mecânico' : key.replace(/_/g, ' ').toUpperCase());
                return (
                  <div className="text-gray-100" key={key}>
                    <span className="font-semibold">{label}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                  </div>
                );
              })}

              <div className="mt-4">
                <span className="font-semibold block mb-2">ITENS DA ORDEM:</span>
                {detailsLoadingItems ? (
                  <div className="text-gray-400">A carregar itens...</div>
                ) : detailsItems.length === 0 ? (
                  <div className="text-gray-400">Nenhum item.</div>
                ) : (
                  <table className="w-full text-sm text-left text-gray-300 border border-gray-700 rounded mb-2">
                    <thead className="bg-gray-900 text-gray-400">
                      <tr>
                        <th className="px-2 py-1">Tipo</th>
                        <th className="px-2 py-1">Descrição</th>
                        <th className="px-2 py-1">Qtd</th>
                        <th className="px-2 py-1">Preço Unit.</th>
                        <th className="px-2 py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsItems.map((item) => (
                        <tr key={item.id} className="border-t border-gray-700">
                          <td className="px-2 py-1">{item.tipo_item || '-'}</td>
                          <td className="px-2 py-1">{item.referencia ? `${item.descricao} (${item.referencia})` : item.descricao || '-'}</td>
                          <td className="px-2 py-1">{item.quantidade || '-'}</td>
                          <td className="px-2 py-1">{item.preco_unitario ?? '-'}</td>
                          <td className="px-2 py-1">{item.valor_total ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setDetailsItems([]);
                  setDetailsLoadingItems(false);
                  closeDetailsModal();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModals.showStatusModal && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-none p-6 w-96 max-w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Alterar Estado - {selectedWorkOrder.id}</h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Novo Estado</label>
              <select 
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Em Andamento">Em Andamento</option>
                <option value="Aguardando Peças">Aguardando Peças</option>
                <option value="Concluída">Concluída</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            {(newStatus === 'Concluída' || newStatus === 'Entregue') && (
              <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">Data de Conclusão</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
              </div>
            )}

            {newStatus === 'Aguardando Peças' && (
              <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">Peças em Espera</label>
                
                {loadingItems ? (
                  <div className="text-gray-500 text-sm mb-2">Carregando peças...</div>
                ) : workOrderItems.filter(item => item.tipo_item === 'peca').length > 0 ? (
                  <div className="mb-3 bg-gray-700 p-2 border border-gray-600 max-h-40 overflow-y-auto">
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
                            .map(item => item.referencia ? `${item.descricao} (${item.referencia})` : item.descricao)
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
                            setWaitingParts(selectedItems.map(i => i.referencia ? `${i.descricao} (${i.referencia})` : i.descricao).join('\n'));
                          }}
                        />
                        <label htmlFor={`part-${item.id}`} className="text-sm text-gray-300 cursor-pointer select-none">
                          {item.referencia ? `${item.descricao} (${item.referencia})` : item.descricao || ''} <span className="text-gray-500 text-xs">({item.quantidade})</span>
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
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => closeStatusModal('showStatusModal')}
                className="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersPage;