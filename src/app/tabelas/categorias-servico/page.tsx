"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface CategoriaServico {
  id: number;
  nome: string;
  descricao: string | null;
  duracao_estimada: string | null;
  ativo: boolean;
}

const columns: ColumnDef<CategoriaServico>[] = [
  {
    key: 'nome',
    header: 'Nome',
    type: 'text',
    required: true,
    width: '25%'
  },
  {
    key: 'descricao',
    header: 'Descrição',
    type: 'text',
    width: '45%'
  },
  {
    key: 'duracao_estimada',
    header: 'Duração Estimada',
    type: 'text',
    width: '15%'
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

export default function CategoriasServicoPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<CategoriaServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categorias-servico?all=true');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error fetching categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSave = async (row: CategoriaServico, isNew: boolean) => {
    const url = isNew ? '/api/categorias-servico' : `/api/categorias-servico/${row.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save');
    }

    await fetchCategorias();
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    const response = await fetch(`/api/categorias-servico/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchCategorias();
  };

  const filteredData = showInactive ? categorias : categorias.filter(c => c.ativo);

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="tabelas" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push('/tabelas')}
              className="text-gray-400 hover:text-brand-yellow mb-2 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Voltar
            </button>
            <h2 className="text-3xl font-bold text-gray-100">Categorias de Serviço</h2>
            <p className="mt-1 text-gray-400">Definir categorias para organização de serviços</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-brand-yellow bg-gray-800 border-gray-600 rounded focus:ring-brand-yellow"
            />
            <span className="text-sm">Mostrar inativos</span>
          </label>
          <span className="text-xs text-gray-500">
            ({filteredData.length} de {categorias.length} registos)
          </span>
        </div>

        {/* Data Grid */}
        <EditableDataGrid
          columns={columns}
          data={filteredData}
          idField="id"
          onSave={handleSave}
          onToggleActive={handleToggleActive}
          canAdd={true}
          canEdit={true}
          canDelete={false}
          canToggleActive={true}
          loading={loading}
        />
      </main>
    </div>
  );
}
