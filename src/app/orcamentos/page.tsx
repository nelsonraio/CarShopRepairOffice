'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

interface Budget {
  id: string;
  client: string;
  vehicle: string;
  date: string;
  total: number;
  status: 'Pendente' | 'Aprovado';
}

const sampleBudgets: Budget[] = [
  { id: 'OR-2024-TVDE0078', client: 'João Silva', vehicle: 'Peugeot 308 | 45-GH-23', date: '2024-02-28', total: 153.75, status: 'Pendente' },
  { id: 'OR-2024-C0079', client: 'Maria Santos', vehicle: 'Renault Clio | 12-AB-34', date: '2024-03-01', total: 85.50, status: 'Aprovado' },
  { id: 'OR-2024-TVDE0080', client: 'Pedro Costa', vehicle: 'BMW 320d | 98-XY-12', date: '2024-03-02', total: 450.00, status: 'Pendente' },
  { id: 'OR-2024-C0081', client: 'Ana Oliveira', vehicle: 'Fiat 500 | 33-ZZ-44', date: '2024-03-03', total: 120.00, status: 'Pendente' },
  { id: 'OR-2024-TVDE0082', client: 'Carlos Ferreira', vehicle: 'Mercedes A180 | 77-MM-88', date: '2024-03-04', total: 210.25, status: 'Pendente' },
  { id: 'OR-2024-C0083', client: 'Sofia Martins', vehicle: 'Audi A3 | 55-PP-66', date: '2024-03-05', total: 320.00, status: 'Aprovado' },
];

const BudgetsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>(sampleBudgets);

  useEffect(() => {
    const filtered = budgets.filter(budget => {
      const matchesSearch =
        budget.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === '' || budget.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredBudgets(filtered);
  }, [searchTerm, statusFilter, budgets]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Aprovado': return 'text-green-400 bg-green-900/30 border border-green-900';
      case 'Pendente': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-900';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const updateBudgetStatus = (budgetId: string, newStatus: 'Pendente' | 'Aprovado') => {
    setBudgets(prevBudgets =>
      prevBudgets.map(budget =>
        budget.id === budgetId ? { ...budget, status: newStatus } : budget
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

        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="overflow-x-auto rounded-none border border-gray-600">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3">ID Orçamento</th>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3">Veículo</th>
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
                      <tr key={budget.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">{budget.id}</td>
                        <td className="px-6 py-4">{budget.client}</td>
                        <td className="px-6 py-4 text-gray-400">{budget.vehicle}</td>
                        <td className="px-6 py-4 text-gray-400">{budget.date}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-200">€{budget.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                            {budget.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-brand-yellow hover:text-brand-yellow-light transition-colors mr-3" title="Ver Detalhes">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-red-400 transition-colors" title="Eliminar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
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
