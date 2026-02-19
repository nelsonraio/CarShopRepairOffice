"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface PerfilCliente {
  id: number;
  nome: string;
  descricao: string | null;
  perclucro: number;
  ativo: boolean;
}

const columns: ColumnDef<PerfilCliente>[] = [
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
    width: '40%'
  },
  {
    key: 'perclucro',
    header: '% Lucro',
    type: 'decimal',
    required: true,
    width: '15%',
    format: (value) => `${parseFloat(value || 0).toFixed(2)}%`
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

export default function PerfisClientesPage() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<PerfilCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchPerfis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/perfis-clientes?all=true');
      if (response.ok) {
        const data = await response.json();
        setPerfis(data);
      }
    } catch (error) {
      console.error('Error fetching perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfis();
  }, []);

  const handleSave = async (row: PerfilCliente, isNew: boolean) => {
    const url = isNew ? '/api/perfis-clientes' : `/api/perfis-clientes/${row.id}`;
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

    await fetchPerfis();
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    const response = await fetch(`/api/perfis-clientes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchPerfis();
  };

  const filteredData = showInactive ? perfis : perfis.filter(p => p.ativo);

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
            <h2 className="text-3xl font-bold text-gray-100">Perfis de Clientes</h2>
            <p className="mt-1 text-gray-400">Gerir perfis (Normal, TVDE Interno, TVDE Externo, etc)</p>
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
            ({filteredData.length} de {perfis.length} registos)
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
