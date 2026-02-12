"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PartsTable from "@/components/PartsTable";
import AddPartModal from "@/components/AddPartModal";
import OrderPartsModal from "@/components/OrderPartsModal";
import OrdersModal from "@/components/OrdersModal";

interface Part {
  id: string;
  reference: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
}

const mockParts: Part[] = [
  {
    id: "1",
    reference: "BOS-0986452058",
    name: "Filtro de Óleo Bosch",
    category: "filtros",
    supplier: "Bosch Portugal",
    stock: 45,
    price: 12.50,
    stockStatus: "em_stock"
  },
  {
    id: "2",
    reference: "BRE-P85020",
    name: "Pastilhas Travão Brembo (Frente)",
    category: "travoes",
    supplier: "AutoParts SA",
    stock: 4,
    price: 45.90,
    stockStatus: "baixo_stock"
  },
  {
    id: "3",
    reference: "CAS-EDGE-5W30",
    name: "Óleo Castrol Edge 5W30 (5L)",
    category: "motor",
    supplier: "LubriNorte",
    stock: 12,
    price: 55.00,
    stockStatus: "em_stock"
  },
  {
    id: "4",
    reference: "NGK-96588",
    name: "Vela de Ignição NGK Laser Iridium",
    category: "motor",
    supplier: "NGK Spark Plugs",
    stock: 0,
    price: 18.20,
    stockStatus: "esgotado"
  },
  {
    id: "5",
    reference: "VAL-574623",
    name: "Escovas Limpa-Vidros Valeo Silencio",
    category: "acessorios",
    supplier: "Valeo Service",
    stock: 20,
    price: 28.50,
    stockStatus: "em_stock"
  }
];

export default function PartsPage() {
  const [parts] = useState<Part[]>(mockParts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [reorderSelectedParts, setReorderSelectedParts] = useState<Array<{part: Part, quantity: number}> | undefined>(undefined);

  const filteredParts = parts.filter(part => {
    const matchesSearch = searchTerm === "" ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "" || part.category === categoryFilter;
    const matchesStock = stockFilter === "" || part.stockStatus === stockFilter;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddPart = (newPart: Omit<Part, 'id'>) => {
    // In a real app, this would make an API call
    console.log("Adding new part:", newPart);
    setIsAddModalOpen(false);
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
              Encomendar Peças
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
        <PartsTable parts={filteredParts} />
      </main>

      {/* Modals */}
      <AddPartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPart={handleAddPart}
      />

      <OrderPartsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        parts={parts}
        onOrderParts={handleOrderParts}
        initialSelectedParts={reorderSelectedParts ?? []}
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
