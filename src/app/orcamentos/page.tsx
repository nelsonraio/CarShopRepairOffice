'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

interface Budget {
  id: number;
  ref_orcamento: string;
  cliente: {
    nome: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    matricula: string;
  };
  data_emissao: string;
  total_geral: number;
  estado: string;
};

const BudgetsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    const filtered = budgets.filter(budget => {
      const matchesSearch =
        budget.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${budget.veiculo?.marca} ${budget.veiculo?.modelo} | ${budget.veiculo?.matricula}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.ref_orcamento?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === '' || budget.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredBudgets(filtered);
  }, [searchTerm, statusFilter, budgets]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orcamentos');
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      const data = await response.json();
      setBudgets(data.orcamentos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (!confirm('Tem certeza que deseja eliminar este orçamento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos?id=${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      // Remove from local state
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
    } catch (err) {
      alert('Erro ao eliminar orçamento: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Aprovado': return 'text-green-400 bg-green-900/30 border border-green-900';
      case 'Pendente': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-900';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const updateBudgetStatus = (budgetId: number, newStatus: 'Pendente' | 'Aprovado') => {
    setBudgets(prevBudgets =>
      prevBudgets.map(budget =>
        budget.id === budgetId ? { ...budget, estado: newStatus } : budget
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="orcamentos" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Orçamentos</h2>
            <p className="mt-1 text-gray-400">Gerencie os orçamentos de reparação</p>
          </div>
          <div className="flex gap-3">
            <Link href="/orcamentos/novo" className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Novo Orçamento
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-gray-700 border border-gray-600 p-4 rounded-none flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Procurar por cliente, veículo ou ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os Estados</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovado">Aprovado</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                  <tr>
                    <th scope="col" className="px-6 py-3">ID Orçamento</th>
                    <th scope="col" className="px-6 py-3">Veículo</th>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3 text-right">Total</th>
                    <th scope="col" className="px-6 py-3 text-center">Estado</th>
                    <th scope="col" className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredBudgets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhum orçamento encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredBudgets.map(budget => (
                      <tr key={budget.id} className="hover:bg-gray-600 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">{budget.ref_orcamento}</td>
                        <td className="px-6 py-4 text-gray-400">{budget.veiculo ? `${budget.veiculo.marca} ${budget.veiculo.modelo} | ${budget.veiculo.matricula}` : 'Veículo não informado'}</td>
                       
                        <td className="px-6 py-4">{budget.cliente?.nome || 'Cliente não informado'}</td>
                        <td className="px-6 py-4 text-gray-400">{new Date(budget.data_emissao).toLocaleDateString('pt-PT')}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-200">€{budget.total_geral.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.estado)}`}>
                            {budget.estado}
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
                              onClick={() => handleDeleteBudget(budget.id)}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default BudgetsPage;
