"use client";

import Link from "next/link";
import { useFetch, useModal, usePagination, useFilters, filterPredicates } from "@/hooks";
import Sidebar from "../../components/Sidebar";
import ClientTable, { type ClienteRecord } from "../../components/ClientTable";

const ITEMS_PER_PAGE = 20;

// Translation labels for client details
const CLIENT_DETAIL_LABELS: Record<string, string> = {
  nome: 'Nome',
  email: 'Email',
  telefone: 'Telefone',
  nif: 'NIF',
  endereco: 'Endereço',
  perfil: 'Perfil',
  veiculos: 'Veículos',
  dataRegistro: 'Data de Registro',
  totalGasto: 'Total Gasto',
  visitas: 'Visitas',
};

/**
 * Clientes Page - Main view for managing clients
 * Uses custom hooks for simplified state management:
 * - useFetch: Data loading with loading/error handling
 * - useModal: Details modal state
 * - usePagination: Pagination logic
 * - useFilters: Search/filtering functionality
 */
export default function ClientesPage() {
  // Data fetching
  const { data: rawClients, loading, error, refetch } = useFetch<ClienteRecord[]>('/api/clientes');
  const clients = rawClients || [];

  // Modal for client details
  const { isOpen: clientModalOpen, selectedItem: clientDetails, select: selectClientDetails, close: closeClientModal } = useModal<ClienteRecord>();

  // Filtering (search across multiple fields)
  const searchConfig = {
    search: filterPredicates.search(['nome', 'nif', 'telefone'])
  };
  const { filters, setFilter } = useFilters(clients, searchConfig);
  const searchTerm = filters.search || '';

  // Pagination with automatic reset on filter change
  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nif.includes(searchTerm) ||
    client.telefone.includes(searchTerm)
  );

  const { currentPage, totalPages, paginatedItems: paginatedClients, prevPage, nextPage } = 
    usePagination(filteredClients, ITEMS_PER_PAGE, [searchTerm]);

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refresh data after deletion
        await refetch();
      }
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  // Pagination info calculation
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredClients.length);

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="clientes" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Clientes</h2>
            <p className="mt-1 text-gray-400">Gerencie a sua base de clientes</p>
          </div>
          <Link
            href="/clientes/novo"
            className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Cliente
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-gray-700 border border-gray-600 p-4 mb-6 rounded-none flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome, NIF ou telefone..."
              value={searchTerm}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400">Carregando clientes...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
            Erro ao carregar clientes: {error}
          </div>
        ) : (
          <>
            <ClientTable
              clients={paginatedClients}
              onDelete={handleDelete}
              onClientClick={selectClientDetails}
            />

            {/* Client Details Modal */}
            {clientModalOpen && clientDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
                  <h3 className="text-xl font-bold text-white mb-4">Detalhes do Cliente</h3>
                  <div className="space-y-2 text-gray-200">
                    {Object.entries(clientDetails).map(([key, value]) => {
                      const label = CLIENT_DETAIL_LABELS[key] || key.replace(/_/g, ' ').toUpperCase();
                      return (
                        <div className="text-gray-100" key={key}>
                          <span className="font-semibold">{label}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={closeClientModal}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredClients.length > 0 && (
              <div className="mt-4 bg-gray-700 px-4 py-3 border border-gray-600 flex items-center justify-between rounded">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{endIndex}</span> de <span className="font-medium text-gray-200">{filteredClients.length}</span> clientes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-3">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
