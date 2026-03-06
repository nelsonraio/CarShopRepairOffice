"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PartsTable from "@/components/PartsTable";
import AddPartModal from "@/components/AddPartModal";
import EditPartModal from "@/components/EditPartModal";
import OrderPartsModal from "@/components/OrderPartsModal";
import EncomendaModal from "@/components/EncomendaModal";
import OrdersModal from "@/components/OrdersModal";
import { useFetch, useModals, usePagination, useFilters, filterPredicates } from "@/hooks";

interface Part {
  id: string;
  reference: string;
  name: string;
  category: string;
  supplier: string;
  supplierId?: string;
  supplierName?: string;
  stock: number;
  minStock?: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
  margem_lucro?: number;
  notas?: string;
}

const ITEMS_PER_PAGE = 20;

// Part detail labels
const PART_DETAIL_LABELS: Record<string, string> = {
  id: 'ID',
  reference: 'Referência',
  name: 'Nome',
  category: 'Categoria',
  supplier: 'Fornecedor',
  supplierId: 'ID Fornecedor',
  supplierName: 'Nome Fornecedor',
  stock: 'Stock',
  price: 'Preço',
  stockStatus: 'Estado do Stock',
};

/**
 * Parts Page - Inventory management view
 * Uses custom hooks for state management:
 * - useFetch: Load parts and suppliers
 * - useModals: Manage multiple modal states (add, edit, order, details, orders)
 * - usePagination: Handle pagination with filter reset
 * - useFilters: Multi-field search and filtering
 */
export default function PartsPage() {
  // Data fetching
  const { data: rawParts, loading, refetch } = useFetch<any[]>('/api/pecas');
  const { data: rawSuppliers = [], loading: suppliersLoading } = useFetch<any[]>('/api/fornecedores');

  // Map raw API data to Part interface
  const parts: Part[] = (rawParts || []).map((peca: any) => ({
    id: peca.id,
    reference: peca.referencia,
    name: peca.nome,
    category: peca.categoria,
    supplier: peca.fornecedor_nome || '',
    supplierId: peca.fornecedor_id ? String(peca.fornecedor_id) : '',
    supplierName: peca.fornecedor_nome || '',
    stock: peca.quantidade_stock || 0,
    price: parseFloat(peca.preco_venda) || 0,
    stockStatus: peca.ativo === false ? 'esgotado' : 
                (peca.quantidade_stock || 0) === 0 ? 'esgotado' :
                (peca.quantidade_stock || 0) <= (peca.nivel_stock_minimo || 0) ? 'baixo_stock' : 'em_stock',
    margem_lucro: typeof peca.margem_lucro === 'number' ? peca.margem_lucro : (peca.margem_lucro ? Number(peca.margem_lucro) : 0),
    notas: peca.notas || ''
  }));

  const fornecedores = Array.isArray(rawSuppliers) ? rawSuppliers : [];

  // Multiple modal management (add, edit, order, details, orders, encomenda)
  const { modals, open: openModal, close: closeModal } = useModals({
    isAddModalOpen: false,
    isEditModalOpen: false,
    isOrderModalOpen: false,
    isEncomendaModalOpen: false,
    isOrdersModalOpen: false,
    isPartDetailsModalOpen: false,
  });

  // Modal item states
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [reorderSelectedParts, setReorderSelectedParts] = useState<Array<{part: Part, quantity: number}> | undefined>(undefined);

  // Filtering configuration
  const filterConfig = {
    search: filterPredicates.search(['name', 'reference']),
    category: filterPredicates.exact('category'),
    stock: filterPredicates.exact('stockStatus'),
  };

  const { filters, setFilter } = useFilters(parts, filterConfig);

  // Apply filters
  const filteredParts = parts.filter(part => {
    const matchesSearch = (filters.search || '') === '' ||
      part.name.toLowerCase().includes((filters.search || '').toLowerCase()) ||
      part.reference.toLowerCase().includes((filters.search || '').toLowerCase());

    const matchesCategory = (filters.category || '') === '' || part.category === filters.category;
    const matchesStock = (filters.stock || '') === '' || part.stockStatus === filters.stock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Pagination with filter reset
  const { currentPage, totalPages, paginatedItems: paginatedParts, nextPage, prevPage } = 
    usePagination(filteredParts, ITEMS_PER_PAGE, [filters.search, filters.category, filters.stock]);

  // CRUD handlers
  const handleAddPart = async (newPart: Omit<Part, 'id'>) => {
    try {
      const response = await fetch('/api/pecas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newPart.name,
          referencia: newPart.reference,
          categoria: newPart.category,
          stock: newPart.stock,
          minStock: 0,
          price: newPart.price,
          fornecedor_id: newPart.supplierId ? parseInt(newPart.supplierId) : null,
          supplierName: newPart.supplierName,
          margem_lucro: typeof newPart.margem_lucro === 'number' ? newPart.margem_lucro : 0,
          notas: newPart.notas || null
        }),
      });

      if (response.ok) {
        closeModal('isAddModalOpen');
        // Refetch data after successful addition
        await refetch();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao adicionar peça');
      }
    } catch (error) {
      console.error('Error adding part:', error);
      alert('Erro ao adicionar peça');
    }
  };

  const handleEditPart = async (updatedPart: Part) => {
    try {
      const response = await fetch('/api/pecas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedPart.id,
          nome: updatedPart.name,
          referencia: updatedPart.reference,
          categoria: updatedPart.category,
          stock: updatedPart.stock,
          minStock: updatedPart.minStock || 0,
          price: updatedPart.price,
          fornecedor_id: updatedPart.supplierId ? parseInt(updatedPart.supplierId) : null,
          supplierName: updatedPart.supplierName,
          margem_lucro: typeof updatedPart.margem_lucro === 'number' ? updatedPart.margem_lucro : 0,
          notas: updatedPart.notas || null
        }),
      });

      if (response.ok) {
        closeModal('isEditModalOpen');
        setEditingPart(null);
        // Refetch data after successful update
        await refetch();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar peça');
      }
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Erro ao atualizar peça');
    }
  };

  const handleOrderParts = (selectedParts: Array<{part: Part, quantity: number}>) => {
    console.log("Ordering parts:", selectedParts);
    closeModal('isOrderModalOpen');
    setReorderSelectedParts(undefined);
  };

  const handleReorder = (selectedParts: Array<{part: Part, quantity: number}>) => {
    setReorderSelectedParts(selectedParts);
    openModal('isOrderModalOpen');
    closeModal('isOrdersModalOpen');
  };

  // Pagination info
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredParts.length);

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="pecas" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Catálogo de Peças</h2>
            <p className="mt-1 text-gray-400">Gerencie o inventário e preços</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openModal('isOrdersModalOpen')}
              className="px-4 py-2 bg-blue-700 text-gray-200 font-bold hover:bg-blue-600 transition-colors rounded-none flex items-center shadow-md border border-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Ver Encomendas
            </button>
            <button
              onClick={() => openModal('isOrderModalOpen')}
              className="px-4 py-2 bg-gray-700 text-gray-200 font-bold hover:bg-gray-600 transition-colors rounded-none flex items-center shadow-md border border-gray-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              Gerar Encomenda
            </button>
            <button
              onClick={() => openModal('isAddModalOpen')}
              className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Adicionar Peça
            </button>
          </div>
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
              placeholder="Pesquisar por nome, referência ou código..."
              value={filters.search || ''}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filters.category || ''}
              onChange={(e) => setFilter('category', e.target.value)}
              className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-4 py-2"
            >
              <option value="">Todas as Categorias</option>
              <option value="motor">Motor</option>
              <option value="travoes">Travões</option>
              <option value="suspensao">Suspensão</option>
              <option value="transmissao">Transmissão</option>
              <option value="sistema-eletrico">Sistema Elétrico</option>
              <option value="sistema-arrefecimento">Sistema de Arrefecimento</option>
              <option value="filtros">Filtros</option>
              <option value="acessorios">Acessórios</option>
              <option value="carrocaria">Carroçaria</option>
              <option value="vidros">Vidros</option>
              <option value="pneus-rodas">Pneus e Rodas</option>
              <option value="lubrificantes">Lubrificantes</option>
              <option value="exaustao">Exaustão</option>
              <option value="direcao">Direção</option>
              <option value="ar-condicionado">Ar Condicionado</option>
            </select>
            <select
              value={filters.stock || ''}
              onChange={(e) => setFilter('stock', e.target.value)}
              className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-4 py-2"
            >
              <option value="">Status de Stock</option>
              <option value="em_stock">Em Stock</option>
              <option value="baixo_stock">Baixo Stock</option>
              <option value="esgotado">Esgotado</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">A carregar peças...</div>
          </div>
        ) : (
          <PartsTable 
            parts={paginatedParts} 
            onEdit={(part) => {
              setEditingPart(part);
              openModal('isEditModalOpen');
            }}
            onReferenceClick={(part) => {
              setSelectedPart(part);
              openModal('isPartDetailsModalOpen');
            }}
          />
        )}

        {/* Pagination */}
        {!loading && filteredParts.length > 0 && (
          <div className="mt-4 bg-gray-800 px-4 py-3 border border-gray-600 flex items-center justify-between rounded-lg">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{endIndex}</span> de <span className="font-medium text-gray-200">{filteredParts.length}</span> peças
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
      </main>

      {/* Modals */}
      <AddPartModal
        isOpen={modals.isAddModalOpen}
        onClose={() => closeModal('isAddModalOpen')}
        onAddPart={handleAddPart}
      />

      <EditPartModal
        isOpen={modals.isEditModalOpen}
        onClose={() => {
          closeModal('isEditModalOpen');
          setEditingPart(null);
        }}
        onEdit={handleEditPart}
        part={editingPart}
      />

      <OrderPartsModal
        isOpen={modals.isOrderModalOpen}
        onClose={() => closeModal('isOrderModalOpen')}
        parts={parts}
        onOrderParts={handleOrderParts}
        initialSelectedParts={reorderSelectedParts ?? []}
        fornecedores={fornecedores}
      />

      <EncomendaModal
        isOpen={modals.isEncomendaModalOpen}
        onClose={() => closeModal('isEncomendaModalOpen')}
        onSuccess={() => {
          // Refetch would be done by cache invalidation in production
        }}
        fornecedores={fornecedores}
        pecas={parts.map(p => ({
          id: p.id,
          reference: p.reference,
          nome: p.name,
          preco: p.price,
          quantidade_stock: p.stock,
          nivel_stock_minimo: 5
        }))}
      />

      <OrdersModal
        isOpen={modals.isOrdersModalOpen}
        onClose={() => closeModal('isOrdersModalOpen')}
        parts={parts}
        onReorder={handleReorder}
      />

      {/* Part Details Modal */}
      {modals.isPartDetailsModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Detalhes da Peça</h3>
            <div className="space-y-2 text-gray-200">
              {Object.entries(selectedPart).map(([key, value]) => {
                const label = PART_DETAIL_LABELS[key] || key.replace(/_/g, ' ').toUpperCase();
                return (
                  <div className="text-gray-100" key={key}>
                    <span className="font-semibold">{label}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => closeModal('isPartDetailsModalOpen')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
