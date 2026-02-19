"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface Fornecedor {
  id: number;
  nome: string;
  pessoa_contato: string | null;
  email: string | null;
  telefone: string | null;
  nif: string | null;
  endereco: string | null;
  termos_pagamento: string | null;
  ativo: boolean;
}

const columns: ColumnDef<Fornecedor>[] = [
  {
    key: 'nome',
    header: 'Nome',
    type: 'text',
    required: true,
    width: '18%'
  },
  {
    key: 'pessoa_contato',
    header: 'Pessoa de Contacto',
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
    width: '15%',
    validate: (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Email inválido';
      }
      return null;
    }
  },
  {
    key: 'nif',
    header: 'NIF',
    type: 'text',
    width: '10%'
  },
  {
    key: 'termos_pagamento',
    header: 'Termos Pagamento',
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

export default function FornecedoresPage() {
  const router = useRouter();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchFornecedores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fornecedores?all=true');
      if (response.ok) {
        const data = await response.json();
        setFornecedores(data);
      }
    } catch (error) {
      console.error('Error fetching fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const handleSave = async (row: Fornecedor, isNew: boolean) => {
    const url = isNew ? '/api/fornecedores' : `/api/fornecedores/${row.id}`;
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

    await fetchFornecedores();
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    const response = await fetch(`/api/fornecedores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchFornecedores();
  };

  const filteredData = showInactive ? fornecedores : fornecedores.filter(f => f.ativo);

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
            <h2 className="text-3xl font-bold text-gray-100">Fornecedores</h2>
            <p className="mt-1 text-gray-400">Gerir lista de fornecedores de peças e contactos</p>
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
            ({filteredData.length} de {fornecedores.length} registos)
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
