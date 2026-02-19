"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface Mecanico {
  id: number;
  nome: string;
  especialidade: string | null;
  telefone: string | null;
  email: string | null;
  tarifa_horaria: number | null;
  data_contratacao: string | null;
  ativo: boolean;
}

const columns: ColumnDef<Mecanico>[] = [
  {
    key: 'nome',
    header: 'Nome',
    type: 'text',
    required: true,
    width: '20%'
  },
  {
    key: 'especialidade',
    header: 'Especialidade',
    type: 'text',
    width: '15%'
  },
  {
    key: 'telefone',
    header: 'Telefone',
    type: 'text',
    width: '12%'
  },
  {
    key: 'email',
    header: 'Email',
    type: 'text',
    width: '18%',
    validate: (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Email inválido';
      }
      return null;
    }
  },
  {
    key: 'tarifa_horaria',
    header: 'Tarifa/Hora (€)',
    type: 'decimal',
    width: '12%',
    format: (value) => value ? `€${parseFloat(value).toFixed(2)}` : '-'
  },
  {
    key: 'data_contratacao',
    header: 'Data Contratação',
    type: 'date',
    width: '13%'
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

export default function MecanicosPage() {
  const router = useRouter();
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchMecanicos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mecanicos?all=true');
      if (response.ok) {
        const data = await response.json();
        setMecanicos(data);
      }
    } catch (error) {
      console.error('Error fetching mecanicos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMecanicos();
  }, []);

  const handleSave = async (row: Mecanico, isNew: boolean) => {
    const url = isNew ? '/api/mecanicos' : `/api/mecanicos/${row.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Save error:', error);
      throw new Error(error.details || error.error || 'Failed to save');
    }

    await fetchMecanicos();
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    const response = await fetch(`/api/mecanicos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchMecanicos();
  };

  const filteredData = showInactive ? mecanicos : mecanicos.filter(m => m.ativo);

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
            <h2 className="text-3xl font-bold text-gray-100">Mecânicos</h2>
            <p className="mt-1 text-gray-400">Gerir equipa técnica, especialidades e tarifas</p>
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
            ({filteredData.length} de {mecanicos.length} registos)
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
