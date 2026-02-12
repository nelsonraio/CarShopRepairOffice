'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

interface WorkOrder {
  id: string;
  client: string;
  vehicle: string;
  mechanic: string;
  openDate: string;
  closeDate: string;
  status: 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  problem: string;
}



const WorkOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await fetch('/api/ordens-trabalho');
        if (!response.ok) {
          throw new Error('Failed to fetch work orders');
        }
        const data = await response.json();
        setWorkOrders(data);
        setFilteredWorkOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  useEffect(() => {
    const filtered = workOrders.filter(workOrder => {
      const matchesSearch =
        workOrder.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.mechanic.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === '' || workOrder.status === statusFilter;
      const matchesPriority = priorityFilter === '' || workOrder.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    setFilteredWorkOrders(filtered);
  }, [searchTerm, statusFilter, priorityFilter, workOrders]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Aberta': return 'text-blue-400 bg-blue-900/30 border border-blue-900';
      case 'Em Andamento': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-900';
      case 'Concluída': return 'text-green-400 bg-green-900/30 border border-green-900';
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
          <div className="flex gap-3">
            <Link href="/ordens-trabalho/novo" className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nova OT
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Procurar por cliente, veículo, OT ou mecânico..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-48">
                <select
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os Estados</option>
                  <option value="Aberta">Aberta</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="w-full lg:w-48">
                <select
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-400">Carregando ordens de trabalho...</div>
              </div>
            ) : error ? (
              <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
                Erro ao carregar ordens de trabalho: {error}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-none border border-gray-600">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                    <tr>
                      <th scope="col" className="px-6 py-3">Nº OT</th>
                      <th scope="col" className="px-6 py-3">Cliente</th>
                      <th scope="col" className="px-6 py-3">Veículo</th>
                      <th scope="col" className="px-6 py-3">Mecânico</th>
                      <th scope="col" className="px-6 py-3">Data Abertura</th>
                      <th scope="col" className="px-6 py-3">Data Fechamento</th>
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
                      filteredWorkOrders.map(workOrder => (
                        <tr key={workOrder.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">{workOrder.id}</td>
                          <td className="px-6 py-4">{workOrder.client}</td>
                          <td className="px-6 py-4 text-gray-400">{workOrder.vehicle}</td>
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
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                              </button>
                              <button
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkOrdersPage;
