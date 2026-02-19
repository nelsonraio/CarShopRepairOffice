"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  preco_base: number | null;
  duracao_estimada: string | null;
  requer_pecas: boolean;
  ativo: boolean;
}

const columns: ColumnDef<Servico>[] = [
  {
    key: 'nome',
    header: 'Nome',
    type: 'text',
    required: true,
    width: '22%'
  },
  {
    key: 'descricao',
    header: 'Descrição',
    type: 'text',
    width: '28%'
  },
  {
    key: 'preco_base',
    header: 'Preço Base (€)',
    type: 'decimal',
    width: '12%',
    format: (value) => value ? `€${parseFloat(value).toFixed(2)}` : '-'
  },
  {
    key: 'duracao_estimada',
    header: 'Duração',
    type: 'text',
    width: '12%'
  },
  {
    key: 'requer_pecas',
    header: 'Requer Peças',
    type: 'boolean',
    width: '12%'
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

export default function ServicosPage() {
  const router = useRouter();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/servicos?all=true');
      if (response.ok) {
        const data = await response.json();
        setServicos(data);
      }
    } catch (error) {
      console.error('Error fetching servicos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleSave = async (row: Servico, isNew: boolean) => {
    const url = isNew ? '/api/servicos' : `/api/servicos/${row.id}`;
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

    await fetchServicos();
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    const response = await fetch(`/api/servicos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchServicos();
  };

  const filteredData = showInactive ? servicos : servicos.filter(s => s.ativo);

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
            <h2 className="text-3xl font-bold text-gray-100">Tipos de Serviço</h2>
            <p className="mt-1 text-gray-400">Configurar tipos de intervenção e tempos estimados</p>
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
            ({filteredData.length} de {servicos.length} registos)
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
