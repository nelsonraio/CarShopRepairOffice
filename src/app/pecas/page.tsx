"use client";

import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Sidebar from "@/components/Sidebar";
import PartsTable from "@/components/PartsTable";
import AddPartModal from "@/components/AddPartModal";
import EditPartModal from "@/components/EditPartModal";
import OrderPartsModal from "@/components/OrderPartsModal";
import EncomendaModal from "@/components/EncomendaModal";
import OrdersModal from "@/components/OrdersModal";
import { useFetch, useModals, usePagination, useFilters, filterPredicates } from "@/hooks";

interface Part {
  id: string | number;
  reference: string;
  name: string;
  category: { id: number; nome: string };
  stock: number;
  minStock?: number;
  price: number;
  custo_unitario?: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
  margem_lucro?: number;
  notas?: string;
  supplier?: string;
  supplierName?: string;
  ativo?: boolean | number;
}

const ITEMS_PER_PAGE = 20;

function toNumber(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function isInactive(value: unknown): boolean {
  return value === false || value === 0 || value === '0';
}

function getPartStockStatus(peca: any): Part['stockStatus'] {
  const stock = toNumber(peca.quantidade_stock);
  const minStock = toNumber(peca.nivel_stock_minimo);

  if (isInactive(peca.ativo) || stock <= 0) {
    return 'esgotado';
  }

  if (stock <= minStock) {
    return 'baixo_stock';
  }

  return 'em_stock';
}

// Part detail labels
const PART_DETAIL_LABELS: Record<string, string> = {
  id: 'ID',
  reference: 'Referência',
  name: 'Nome',
  category: 'Categoria',
  minStock: 'Stock Mínimo',
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
  const { data: categorias = [] } = useFetch<string[]>('/api/categorias-pecas');

  // Map raw API data to Part interface
  const parts: Part[] = (rawParts || []).map((peca: any) => {
    const stock = toNumber(peca.quantidade_stock);
    const minStock = toNumber(peca.nivel_stock_minimo);

    return {
      id: peca.id,
      reference: peca.referencia,
      name: peca.nome,
      category: typeof peca.category === 'object' && peca.category !== null
        ? { id: Number(peca.category.id ?? 0), nome: String(peca.category.nome ?? '') }
        : { id: 0, nome: '' },
      supplier: peca.fornecedor_nome || '',
      supplierId: peca.fornecedor_id ? String(peca.fornecedor_id) : '',
      supplierName: peca.fornecedor_nome || '',
      stock,
      minStock,
      price: toNumber(peca.preco_venda),
      custo_unitario: toNumber(peca.custo_unitario),
      stockStatus: getPartStockStatus(peca),
      ativo: peca.ativo,
      margem_lucro: typeof peca.margem_lucro === 'number' ? peca.margem_lucro : toNumber(peca.margem_lucro),
      notas: peca.notas ?? ''
    };
  });

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
    search: filterPredicates.search<Part>(['name', 'reference', 'notas']),
    category: (part: Part, value: string | number) => {
      return !value || value === '' || value === 'todas' || value === 'all' || part.category.id === Number(value);
    },
    stock: filterPredicates.exact('stockStatus'),
  };

  const { filters, setFilter, filteredItems: filteredParts } = useFilters(parts, filterConfig);

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
          categoriaId: newPart.category.id,
          stock: newPart.stock,
          minStock: newPart.minStock || 0,
          price: newPart.price,
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

  const handleEditPart = async (updatedPart: Part & { categoriaId?: string | number }) => {
    try {
      const response = await fetch('/api/pecas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedPart.id,
          nome: updatedPart.name,
          referencia: updatedPart.reference,
          categoriaId: updatedPart.categoriaId,
          stock: updatedPart.stock,
          minStock: updatedPart.minStock || 0,
          price: updatedPart.price,
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

  // Export para Excel no formato AT (SAF-T PT / Portaria 321-A/2007)
  const exportToExcel = () => {
    const IVA_RATE = 23; // Taxa normal IVA Portugal (pecas auto)
    const VALUATION_METHOD = 'CMP'; // Custo Medio Ponderado
    const UNIT = 'un.';
    const TIPO_ARTIGO = 'M'; // M = Mercadoria

    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'N/D';
    const companyNIF = process.env.NEXT_PUBLIC_COMPANY_NIF || 'N/D';
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-PT');
    const dateISO = today.toISOString().slice(0, 10);

    // Calcular totais
    let totalQty = 0;
    let totalValorSemIVA = 0;
    let totalIVA = 0;
    let totalValorComIVA = 0;

    const dataRows = filteredParts.map((p: any) => {
      const qty = Number(p.stock) || 0;
      const custo = Number(p.custo_unitario) || 0;
      const valorSemIVA = Math.round(qty * custo * 100) / 100;
      const valorIVA = Math.round(valorSemIVA * IVA_RATE) / 100;
      const valorComIVA = Math.round((valorSemIVA + valorIVA) * 100) / 100;

      totalQty += qty;
      totalValorSemIVA += valorSemIVA;
      totalIVA += valorIVA;
      totalValorComIVA += valorComIVA;

      return [
        p.reference,
        p.name,
        p.category?.nome || '',
        TIPO_ARTIGO,
        UNIT,
        p.supplierName || p.supplier || '',
        qty,
        Number(p.minStock) || 0,
        custo,
        valorSemIVA,
        IVA_RATE,
        Math.round(valorIVA * 100) / 100,
        valorComIVA,
        Number(p.price) || 0,
        p.margem_lucro != null ? Number(p.margem_lucro) : '',
        p.ativo === false || p.ativo === 0 || p.ativo === '0' ? 'Inativo' : 'Ativo',
        VALUATION_METHOD,
        p.notas || '',
        dateISO,
      ];
    });

    const headers = [
      'Código do Artigo',
      'Descrição do Artigo',
      'Categoria',
      'Tipo',
      'Unidade de Medida',
      'Fornecedor',
      'Quantidade em Stock',
      'Nível Mínimo de Stock',
      'Custo Unitário (€)',
      'Valor Inventário s/ IVA (€)',
      'Taxa IVA (%)',
      'Valor IVA (€)',
      'Valor Inventário c/ IVA (€)',
      'Preço de Venda (€)',
      'Margem de Lucro (%)',
      'Estado',
      'Método de Valorização',
      'Notas',
      'Data de Referência',
    ];

    const totalsRow = [
      'TOTAIS',
      '',
      '',
      '',
      '',
      `${filteredParts.length} artigo(s)`,
      totalQty,
      '',
      '',
      Math.round(totalValorSemIVA * 100) / 100,
      '',
      Math.round(totalIVA * 100) / 100,
      Math.round(totalValorComIVA * 100) / 100,
      '',
      '',
      '',
      '',
      '',
      '',
    ];

    // Construir folha com cabecalho AT
    const sheetData: any[][] = [
      [`LISTAGEM DE EXISTÊNCIAS - ${companyName}`],
      [`NIF: ${companyNIF} | Data do Inventário: ${dateStr} | Método de Valorização: ${VALUATION_METHOD} | Regime IVA: Normal`],
      [`Documento gerado para efeitos da Portaria n.º 321-A/2007 de 26 de Março (SAF-T PT)`],
      [], // linha em branco
      headers,
      ...dataRows,
      [], // linha em branco
      totalsRow,
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Larguras das colunas
    ws['!cols'] = [
      { wch: 18 }, // Codigo
      { wch: 35 }, // Descricao
      { wch: 20 }, // Categoria
      { wch: 6  }, // Tipo
      { wch: 8  }, // Unidade
      { wch: 25 }, // Fornecedor
      { wch: 10 }, // Qty
      { wch: 10 }, // MinStock
      { wch: 14 }, // Custo Unit
      { wch: 18 }, // Valor s/IVA
      { wch: 10 }, // Taxa IVA
      { wch: 14 }, // Valor IVA
      { wch: 18 }, // Valor c/IVA
      { wch: 14 }, // Preco Venda
      { wch: 14 }, // Margem
      { wch: 10 }, // Estado
      { wch: 20 }, // Metodo Valorizacao
      { wch: 30 }, // Notas
      { wch: 16 }, // Data
    ];

    // Merge do titulo nas primeiras 3 linhas
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Listagem de Existências');

    XLSX.writeFile(wb, `listagem-existencias-${dateISO}.xlsx`);
  };

  // Pagination info
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredParts.length);

  useEffect(() => {
    console.log('DEBUG parts:', parts);
    console.log('DEBUG filters:', filters);
    console.log('DEBUG rawParts:', rawParts);
  }, [parts, filters, rawParts]);

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
              onClick={exportToExcel}
              disabled={filteredParts.length === 0}
              className="px-4 py-2 bg-green-700 text-gray-200 font-bold hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-none flex items-center shadow-md border border-green-600"
              title={`Exportar ${filteredParts.length} peças para Excel`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar Excel
            </button>
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
              {(categorias || []).map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
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
            onDelete={async (part) => {
              if (!window.confirm('Tem certeza que deseja apagar esta peça?')) return;
              try {
                const response = await fetch(`/api/pecas?id=${part.id}`, { method: 'DELETE' });
                const data = await response.json();
                if (!response.ok) {
                  alert(data.error || 'Não é possível apagar a peça.');
                } else {
                  await refetch();
                  alert('Peça apagada com sucesso!');
                }
              } catch (err) {
                alert('Erro ao apagar peça.');
              }
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
        onClose={async () => {
          closeModal('isOrderModalOpen');
          await refetch();
        }}
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
          codigo: String(p.id),
          reference: p.reference,
          nome: p.name,
          preco: p.price,
          quantidade_stock: p.stock,
          nivel_stock_minimo: 5
        }))}
      />

      <OrdersModal
        isOpen={modals.isOrdersModalOpen}
        onClose={async () => {
          closeModal('isOrdersModalOpen');
          await refetch();
        }}
        parts={parts}
        onReorder={handleReorder}
      />

      {/* Part Details Modal */}
      {modals.isPartDetailsModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Detalhes da Peça</h3>
            <div className="space-y-2 text-gray-200">
              {Object.entries(selectedPart)
                .filter(([key]) => !['supplier', 'supplierId', 'supplierName', 'SUPPLIER', 'SUPPLIERID', 'SUPPLIERNAME'].includes(key))
                .map(([key, value]) => {
                  const label = PART_DETAIL_LABELS[key] || key.replace(/_/g, ' ').toUpperCase();
                  let displayValue = value;
                  if (key === 'category') {
                    if (value && typeof value === 'object' && 'nome' in value) {
                      displayValue = value.nome;
                    }
                  } else if (typeof value === 'number') {
                    displayValue = value.toFixed(2);
                  }
                  return (
                    <div className="text-gray-100" key={key}>
                      <span className="font-semibold">{label}:</span> {typeof displayValue === 'string' || typeof displayValue === 'number' ? displayValue : JSON.stringify(displayValue)}
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
