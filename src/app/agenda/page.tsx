'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import AppointmentDetailsModal from '../../components/AppointmentDetailsModal';
import { useFetch, useModal, usePagination, useFilters, filterPredicates } from '@/hooks';

const ITEMS_PER_PAGE = 20;

/**
 * Agenda Page - Manage appointments
 * Uses custom hooks for simplified state management:
 * - useFetch: Data loading with loading/error handling
 * - useModal: Details modal state
 * - usePagination: Pagination logic with auto-reset
 * - useFilters: Date range and search filtering
 */
export default function AgendaPage() {
  // Data fetching
  const { data: appointmentsData, loading, error, refetch } = useFetch<any[]>('/api/agendamentos');
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  // Modal for appointment details
  const { isOpen: modalOpen, selectedItem: selectedAppointment, select: selectAppointment, close: closeModal } = useModal<any>();

  // Custom date filter state (outside useFilters for quick filter buttons)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtering configuration
  const filterConfig = {
    search: filterPredicates.search(['client', 'matricula']),
  };

  const { filters, setFilter } = useFilters(appointments, filterConfig);

  // Apply filters with date range
  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    const searchTerm = filters.search || '';
    const matchesSearch = searchTerm === '' ||
      appointment.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.matricula?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const appointmentDate = new Date(appointment.date.split('/').reverse().join('-'));
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        matchesDateRange = matchesDateRange && appointmentDate >= fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        matchesDateRange = matchesDateRange && appointmentDate <= toDate;
      }
    }

    return matchesSearch && matchesDateRange;
  }).sort((a, b) => {
    // Sort by date ascending
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  // Pagination with automatic reset on filter changes
  const { currentPage, totalPages, paginatedItems: paginatedAppointments, prevPage, nextPage } =
    usePagination(filteredAppointments, ITEMS_PER_PAGE, [filters.search, dateFrom, dateTo]);

  // Quick filter buttons
  const setQuickFilter = (filter: string) => {
    const today = new Date();
    let fromDate = '';
    let toDate = '';

    switch (filter) {
      case 'hoje':
        fromDate = today.toISOString().substring(0, 10);
        toDate = fromDate;
        break;
      case 'semana':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        fromDate = startOfWeek.toISOString().substring(0, 10);
        toDate = endOfWeek.toISOString().substring(0, 10);
        break;
      case 'mes':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        fromDate = startOfMonth.toISOString().substring(0, 10);
        toDate = endOfMonth.toISOString().substring(0, 10);
        break;
      case 'todos':
        fromDate = '';
        toDate = '';
        break;
    }

    setDateFrom(fromDate);
    setDateTo(toDate);
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este agendamento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await refetch();
      } else {
        alert('Erro ao apagar agendamento');
      }
    } catch (err) {
      console.error('Failed to delete appointment', err);
      alert('Erro ao apagar agendamento');
    }
  };

  // Pagination info calculation
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredAppointments.length);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex h-screen bg-gray-800">
        <Sidebar activePage="agenda" />

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 leading-tight">Agenda</h2>
              <p className="mt-1 text-gray-400">Gerencie os agendamentos da oficina</p>
            </div>
            <Link
              href="/agenda/novo"
              className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
            >
              Novo Agendamento
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-gray-700 p-4 rounded-lg border border-gray-600">
            {/* Quick Filters */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Filtros Rápidos</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickFilter('hoje')}
                  className="px-3 py-1 bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded text-sm"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setQuickFilter('semana')}
                  className="px-3 py-1 bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded text-sm"
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => setQuickFilter('mes')}
                  className="px-3 py-1 bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors rounded text-sm"
                >
                  Este Mês
                </button>
                <button
                  onClick={() => setQuickFilter('todos')}
                  className="px-3 py-1 bg-brand-yellow text-gray-900 hover:bg-brand-yellow-dark transition-colors rounded text-sm font-medium"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Pesquisar (Cliente/Matrícula)</label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilter('search', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Pesquisar..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data De</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data Até</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
            {/* Tabela para desktop */}
            <div className="hidden md:block">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Hora</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Detalhes do Veículo</th>
                    <th className="px-6 py-3">Mecânico</th>
                    <th className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {paginatedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="bg-gray-700 hover:bg-gray-600 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-400">
                        <button
                          className="underline text-blue-400 hover:text-blue-300 font-mono"
                          onClick={() => selectAppointment(appointment)}
                          title="Visualizar dados do agendamento"
                        >
                          {appointment.id}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-brand-yellow">{appointment.date}</td>
                      <td className="px-6 py-4 font-mono">{appointment.time}</td>
                      <td className="px-6 py-4 text-gray-100 font-bold">{appointment.client || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-gray-100">{appointment.marca && appointment.modelo ? `${appointment.marca} ${appointment.modelo}${appointment.ano ? ` ${appointment.ano}` : ''}${appointment.matricula ? ` - ${appointment.matricula}` : ''}` : appointment.matricula || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-100">{appointment.mechanic}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Link
                            href={`/agenda/${appointment.id}/edit`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar agendamento"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </Link>

                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Apagar agendamento"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para mobile */}
            <div className="md:hidden flex flex-col gap-4 p-2">
              {paginatedAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand-yellow text-lg">{appointment.time}</span>
                    <span className="bg-blue-900 text-blue-200 px-2 py-1 text-xs font-bold rounded">{appointment.status || ''}</span>
                  </div>
                  <div className="text-gray-100 font-bold text-base">{appointment.marca && appointment.modelo ? `${appointment.marca} ${appointment.modelo}${appointment.ano ? ` ${appointment.ano}` : ''}` : appointment.modelo || appointment.model || ''}</div>
                  <div className="font-mono text-gray-300 text-xs">Matrícula: {appointment.matricula || appointment.plate || ''}</div>
                  <div className="text-gray-200 text-sm">Cliente: {appointment.client || 'N/A'}</div>
                  {appointment.descricao && <div className="text-xs text-gray-400">{appointment.descricao}</div>}
                  {appointment.mechanic && <div className="text-xs text-gray-400">Mecânico: {appointment.mechanic}</div>}
                  {appointment.priority && <div className="text-xs text-gray-400">Prioridade: {appointment.priority}</div>}
                  <div className="flex justify-end gap-2 mt-2">
                    <Link
                      href={`/agenda/${appointment.id}/edit`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar agendamento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Apagar agendamento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Nenhum agendamento encontrado.
              </div>
            )}
          </div>


          {filteredAppointments.length > 0 && (
            <div className="mt-4 bg-gray-800 px-4 py-3 border border-gray-600 flex items-center justify-between rounded-lg">
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredAppointments.length)}</span> de <span className="font-medium text-gray-200">{filteredAppointments.length}</span> agendamentos
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

          <AppointmentDetailsModal
            appointment={selectedAppointment}
            isOpen={modalOpen}
            onClose={closeModal}
          />
        </main>
      </div>
    </>
  );
}
