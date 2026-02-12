'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

export default function AgendaPage() {

  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');


  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, dateFrom, dateTo]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agendamentos');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date.split('/').reverse().join('-'));
        return appointmentDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date.split('/').reverse().join('-'));
        return appointmentDate <= toDate;
      });
    }

    // Sort by date ascending
    filtered.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredAppointments(filtered);
  };

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



  const handleDelete = async (id: string) => {

    if (window.confirm('Tem certeza que deseja apagar este agendamento?')) {
      try {
        await fetch(`/api/agendamentos?id=${id}`, {
          method: 'DELETE'
        });
        await fetchAppointments();
      } catch (err) {
        console.error('Failed to delete appointment', err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Hora</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Detalhes do Veículo</th>
                <th className="px-6 py-3">Mecânico</th>
                <th className="px-6 py-3">Tipo de Serviço</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="bg-gray-700 hover:bg-gray-600 transition-colors">
                  <td className="px-6 py-4 font-mono text-brand-yellow">{appointment.date}</td>
                  <td className="px-6 py-4 font-mono">{appointment.time}</td>
                  <td className="px-6 py-4 text-gray-100 font-bold">{appointment.client}</td>
                  <td className="px-6 py-4 font-mono text-gray-100">{appointment.marca && appointment.modelo ? `${appointment.marca} ${appointment.modelo}${appointment.ano ? ` ${appointment.ano}` : ''}${appointment.matricula ? ` - ${appointment.matricula}` : ''}` : appointment.matricula || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-100">{appointment.mechanic}</td>
                  <td className="px-6 py-4 text-gray-100">{appointment.tipoServico || 'Revisão Geral'}</td>
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
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum agendamento encontrado.
            </div>
          )}
        </div>




      </main>
    </div>
  );
}
