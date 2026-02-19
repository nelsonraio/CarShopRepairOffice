"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PartsTable from "@/components/PartsTable";
import AddPartModal from "@/components/AddPartModal";
import EditPartModal from "@/components/EditPartModal";
import OrderPartsModal from "@/components/OrderPartsModal";
import EncomendaModal from "@/components/EncomendaModal";
import OrdersModal from "@/components/OrdersModal";

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
}

const ITEMS_PER_PAGE = 20;

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEncomendaModalOpen, setIsEncomendaModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [reorderSelectedParts, setReorderSelectedParts] = useState<Array<{part: Part, quantity: number}> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch parts from database on mount
  useEffect(() => {
    fetchParts();
    fetchFornecedores();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter]);

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/pecas');
      if (response.ok) {
        const data = await response.json();
        // Map the database format to the component's Part interface
        const mappedParts: Part[] = data.map((peca: any) => ({
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
                      (peca.quantidade_stock || 0) <= (peca.nivel_stock_minimo || 0) ? 'baixo_stock' : 'em_stock'
        }));
        setParts(mappedParts);
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores');
      if (response.ok) {
        const data = await response.json();
        setFornecedores(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const filteredParts = parts.filter(part => {
    const matchesSearch = searchTerm === "" ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "" || part.category === categoryFilter;
    const matchesStock = stockFilter === "" || part.stockStatus === stockFilter;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Pagination
  const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedParts = filteredParts.slice(startIndex, endIndex);

  const handleAddPart = async (newPart: Omit<Part, 'id'>) => {
    try {
      const response = await fetch('/api/pecas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: newPart.name,
          referencia: newPart.reference,
          categoria: newPart.category,
          stock: newPart.stock,
          minStock: 0,
          price: newPart.price,
          fornecedor_id: newPart.supplierId ? parseInt(newPart.supplierId) : null,
          supplierName: newPart.supplierName,
        }),
      });

      if (response.ok) {
        const savedPart = await response.json();
        const partToAdd: Part = {
          id: savedPart.id,
          reference: savedPart.referencia,
          name: savedPart.nome,
          category: savedPart.categoria,
          supplier: savedPart.supplierName || '',
          supplierId: savedPart.fornecedor_id ? String(savedPart.fornecedor_id) : '',
          supplierName: savedPart.supplierName || '',
          stock: savedPart.stock,
          price: parseFloat(savedPart.price),
          stockStatus: savedPart.stockStatus
        };
        setParts(prevParts => [...prevParts, partToAdd]);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao adicionar peça');
        return;
      }
    } catch (error) {
      console.error('Error adding part:', error);
      alert('Erro ao adicionar peça');
      return;
    }
    setIsAddModalOpen(false);
  };

  const handleEditPart = async (updatedPart: Part) => {
    try {
      const response = await fetch('/api/pecas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
        }),
      });

      if (response.ok) {
        const savedPart = await response.json();
        // Update the parts state with the edited part
        setParts(prevParts => prevParts.map(part => {
          if (part.id === updatedPart.id) {
            const updatedPartData: Part = {
              ...part,
              name: savedPart.nome || updatedPart.name,
              reference: savedPart.referencia || updatedPart.reference,
              category: savedPart.categoria || updatedPart.category,
              stock: savedPart.quantidade_stock ?? updatedPart.stock,
              minStock: savedPart.nivel_stock_minimo ?? updatedPart.minStock,
              price: parseFloat(savedPart.preco_venda) ?? updatedPart.price,
              supplier: savedPart.supplierName || updatedPart.supplierName,
              supplierName: savedPart.supplierName || updatedPart.supplierName,
              stockStatus: savedPart.stockStatus || updatedPart.stockStatus
            };
            
            if (savedPart.fornecedor_id) {
              updatedPartData.supplierId = String(savedPart.fornecedor_id);
            } else if (updatedPart.supplierId) {
              updatedPartData.supplierId = updatedPart.supplierId;
            }
            
            return updatedPartData;
          }
          return part;
        }));
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar peça');
        return;
      }
    } catch (error) {
      console.error('Error updating part:', error);
      alert('Erro ao atualizar peça');
      return;
    }
    setIsEditModalOpen(false);
    setEditingPart(null);
  };

  const handleOrderParts = (selectedParts: Array<{part: Part, quantity: number}>) => {
    // In a real app, this would process the order
    console.log("Ordering parts:", selectedParts);
    setIsOrderModalOpen(false);
    setReorderSelectedParts(undefined);
  };

  const handleReorder = (selectedParts: Array<{part: Part, quantity: number}>) => {
    setReorderSelectedParts(selectedParts);
    setIsOrderModalOpen(true);
    setIsOrdersModalOpen(false);
  };

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
              onClick={() => setIsOrdersModalOpen(true)}
              className="px-4 py-2 bg-blue-700 text-gray-200 font-bold hover:bg-blue-600 transition-colors rounded-none flex items-center shadow-md border border-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Ver Encomendas
            </button>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 py-2 bg-gray-700 text-gray-200 font-bold hover:bg-gray-600 transition-colors rounded-none flex items-center shadow-md border border-gray-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              Gerar Encomenda
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">A carregar peças...</div>
          </div>
        ) : (
          <PartsTable 
            parts={paginatedParts} 
            onEdit={(part) => {
              setEditingPart(part);
              setIsEditModalOpen(true);
            }}
          />
        )}

        {/* Pagination */}
        {!isLoading && filteredParts.length > 0 && (
          <div className="mt-4 bg-gray-800 px-4 py-3 border border-gray-600 flex items-center justify-between rounded-lg">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredParts.length)}</span> de <span className="font-medium text-gray-200">{filteredParts.length}</span> peças
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
      </main>

      {/* Modals */}
      <AddPartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPart={handleAddPart}
      />

      <EditPartModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPart(null);
        }}
        onEdit={handleEditPart}
        part={editingPart}
      />

      <OrderPartsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        parts={parts}
        onOrderParts={handleOrderParts}
        initialSelectedParts={reorderSelectedParts ?? []}
        fornecedores={fornecedores}
      />

      <EncomendaModal
        isOpen={isEncomendaModalOpen}
        onClose={() => setIsEncomendaModalOpen(false)}
        onSuccess={() => {
          fetchParts();
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
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        parts={parts}
        onReorder={handleReorder}
      />
    </div>
  );
}
