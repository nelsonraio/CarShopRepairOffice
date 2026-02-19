'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import EncomendaModal from '@/components/EncomendaModal';
import EncomendaTable from '@/components/EncomendaTable';

interface Fornecedor {
  id: string;
  nome: string;
}

interface Peca {
  id: string;
  reference: string;
  nome: string;
  preco: number;
  quantidade_stock: number;
  nivel_stock_minimo: number;
}

interface Encomenda {
  id: string;
  numero_encomenda: string;
  fornecedor_id: string;
  fornecedor_nome?: string;
  data_encomenda: string;
  data_entrega_estimada: string | null;
  data_entrega_real: string | null;
  estado: 'pendente' | 'em_transito' | 'recebido' | 'cancelado';
  custo_total: number;
  itens?: any[];
  dias_atraso?: number;
}

const ITEMS_PER_PAGE = 20;

export default function EncomendasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [encRes, fornRes, pecRes] = await Promise.all([
        fetch('/api/encomendas'),
        fetch('/api/fornecedores'),
        fetch('/api/pecas'),
      ]);

      if (encRes.ok) {
        const encData = await encRes.json();
        setEncomendas(Array.isArray(encData) ? encData : []);
      } else {
        setError('Erro ao carregar encomendas');
      }

      if (fornRes.ok) {
        const fornData = await fornRes.json();
        setFornecedores(Array.isArray(fornData) ? fornData : []);
      }

      if (pecRes.ok) {
        const pecData = await pecRes.json();
        const pecasList = Array.isArray(pecData)
          ? pecData.map((peca) => ({
              id: String(peca.id),
              reference: peca.referencia,
              nome: peca.nome,
              preco: Number(peca.preco_venda) || 0,
              quantidade_stock: peca.quantidade_stock ?? 0,
              nivel_stock_minimo: peca.nivel_stock_minimo ?? 0
            }))
          : [];
        setPecas(pecasList);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/encomendas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erro ao atualizar status');
    }
  };

  const handleReceive = async (id: string) => {
    try {
      const response = await fetch(`/api/encomendas/${id}/receber`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body - will process all pending items
      });

      if (!response.ok) throw new Error('Erro ao registar recebimento');

      // Reload data
      await loadData();
      setError('');
    } catch (err) {
      console.error('Error receiving order:', err);
      setError('Erro ao registar recebimento');
    }
  };

  // Filter encomendas
  const filteredEncomendas = encomendas.filter(enc => {
    const matchesSearch =
      enc.numero_encomenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enc.fornecedor_nome?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || enc.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEncomendas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEncomendas = filteredEncomendas.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Encomendas</h1>
            <p className="text-gray-400">Gestão de encomendas de peças aos fornecedores</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-400 p-4 rounded">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-4 underline hover:no-underline"
              >
                Descartar
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Pesquisar por número de encomenda ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
              />
            </div>

            {/* New Order Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-brand-yellow text-gray-900 font-bold rounded hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nova Encomenda
            </button>
          </div>

          {/* Status Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {['todos', 'pendente', 'em_transito', 'recebido', 'cancelado'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-yellow text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'todos'
                  ? ` (${encomendas.length})`
                  : ` (${encomendas.filter(e => e.estado === status).length})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
              </div>
            ) : (
              <EncomendaTable
                encomendas={paginatedEncomendas}
                onStatusChange={handleStatusChange}
                onReceive={handleReceive}
                onViewDetails={(id) => console.log('View:', id)}
              />
            )}
          </div>

          {/* Pagination */}
          {filteredEncomendas.length > 0 && (
            <div className="mt-4 bg-gray-800 px-4 py-3 border border-gray-600 flex items-center justify-between rounded-lg">
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredEncomendas.length)}</span> de <span className="font-medium text-gray-200">{filteredEncomendas.length}</span> encomendas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-400 px-3">
                    Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded p-6">
              <p className="text-gray-400 text-sm">Total Encomendas</p>
              <p className="text-3xl font-bold text-white mt-2">{encomendas.length}</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded p-6">
              <p className="text-gray-400 text-sm">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">
                {encomendas.filter(e => e.estado === 'pendente').length}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded p-6">
              <p className="text-gray-400 text-sm">Em Trânsito</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                {encomendas.filter(e => e.estado === 'em_transito').length}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded p-6">
              <p className="text-gray-400 text-sm">Valor Total Pendente</p>
              <p className="text-2xl font-bold text-green-400 mt-2">
                €{encomendas
                  .filter(e => e.estado !== 'recebido' && e.estado !== 'cancelado')
                  .reduce((sum, e) => sum + e.custo_total, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EncomendaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        fornecedores={fornecedores}
        pecas={pecas}
      />
    </div>
  );
}
