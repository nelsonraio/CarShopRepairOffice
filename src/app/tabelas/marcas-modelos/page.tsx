"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface Marca {
  id: number;
  nome: string;
  pais_origem: string | null;
  ativo: boolean;
}

interface Modelo {
  id: number;
  marca_id: number;
  nome: string;
  tipo_veiculo: string | null;
  ativo: boolean;
  marca?: {
    id: number;
    nome: string;
  };
}

const marcasColumns: ColumnDef<Marca>[] = [
  {
    key: 'nome',
    header: 'Nome',
    type: 'text',
    required: true,
    width: '40%'
  },
  {
    key: 'pais_origem',
    header: 'País de Origem',
    type: 'text',
    width: '40%'
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

export default function MarcasModelosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'marcas' | 'modelos'>('marcas');
  
  // Marcas state
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(true);
  const [showInactiveMarcas, setShowInactiveMarcas] = useState(false);
  
  // Modelos state
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loadingModelos, setLoadingModelos] = useState(true);
  const [showInactiveModelos, setShowInactiveModelos] = useState(false);
  const [selectedMarcaFilter, setSelectedMarcaFilter] = useState<number | null>(null);

  // Modelos columns (with marca selector)
  const modelosColumns: ColumnDef<Modelo>[] = [
    {
      key: 'marca_id',
      header: 'Marca',
      type: 'select',
      required: true,
      width: '25%',
      options: marcas.filter(m => m.ativo).map(m => ({ value: m.id, label: m.nome })),
      render: (value, row) => row.marca?.nome || '-'
    },
    {
      key: 'nome',
      header: 'Modelo',
      type: 'text',
      required: true,
      width: '30%'
    },
    {
      key: 'tipo_veiculo',
      header: 'Tipo de Veículo',
      type: 'text',
      width: '25%'
    },
    {
      key: 'ativo',
      header: 'Ativo',
      type: 'boolean',
      width: '10%'
    }
  ];

  const fetchMarcas = async () => {
    setLoadingMarcas(true);
    try {
      const response = await fetch('/api/marcas?all=true');
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      }
    } catch (error) {
      console.error('Error fetching marcas:', error);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const fetchModelos = async () => {
    setLoadingModelos(true);
    try {
      const url = selectedMarcaFilter 
        ? `/api/modelos?all=true&marca_id=${selectedMarcaFilter}`
        : '/api/modelos?all=true';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setModelos(data);
      }
    } catch (error) {
      console.error('Error fetching modelos:', error);
    } finally {
      setLoadingModelos(false);
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  useEffect(() => {
    if (activeTab === 'modelos') {
      fetchModelos();
    }
  }, [activeTab, selectedMarcaFilter]);

  const handleSaveMarca = async (row: Marca, isNew: boolean) => {
    const url = isNew ? '/api/marcas' : `/api/marcas/${row.id}`;
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

    await fetchMarcas();
  };

  const handleToggleActiveMarca = async (id: number, active: boolean) => {
    const response = await fetch(`/api/marcas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchMarcas();
  };

  const handleSaveModelo = async (row: Modelo, isNew: boolean) => {
    const url = isNew ? '/api/modelos' : `/api/modelos/${row.id}`;
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

    await fetchModelos();
  };

  const handleToggleActiveModelo = async (id: number, active: boolean) => {
    const response = await fetch(`/api/modelos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle active');
    }

    await fetchModelos();
  };

  const filteredMarcas = showInactiveMarcas ? marcas : marcas.filter(m => m.ativo);
  const filteredModelos = showInactiveModelos ? modelos : modelos.filter(m => m.ativo);

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
            <h2 className="text-3xl font-bold text-gray-100">Marcas e Modelos</h2>
            <p className="mt-1 text-gray-400">Gerir marcas de veículos e respetivos modelos</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-600">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('marcas')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'marcas'
                  ? 'text-brand-yellow'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Marcas
              {activeTab === 'marcas' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('modelos')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'modelos'
                  ? 'text-brand-yellow'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Modelos
              {activeTab === 'modelos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow"></div>
              )}
            </button>
          </div>
        </div>

        {/* Marcas Tab */}
        {activeTab === 'marcas' && (
          <>
            {/* Filter Toggle */}
            <div className="mb-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactiveMarcas}
                  onChange={(e) => setShowInactiveMarcas(e.target.checked)}
                  className="w-4 h-4 text-brand-yellow bg-gray-800 border-gray-600 rounded focus:ring-brand-yellow"
                />
                <span className="text-sm">Mostrar inativos</span>
              </label>
              <span className="text-xs text-gray-500">
                ({filteredMarcas.length} de {marcas.length} registos)
              </span>
            </div>

            {/* Marcas Grid */}
            <EditableDataGrid
              columns={marcasColumns}
              data={filteredMarcas}
              idField="id"
              onSave={handleSaveMarca}
              onToggleActive={handleToggleActiveMarca}
              canAdd={true}
              canEdit={true}
              canDelete={false}
              canToggleActive={true}
              loading={loadingMarcas}
            />
          </>
        )}

        {/* Modelos Tab */}
        {activeTab === 'modelos' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Filtrar por Marca:</label>
                <select
                  value={selectedMarcaFilter || ''}
                  onChange={(e) => setSelectedMarcaFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                >
                  <option value="">Todas as marcas</option>
                  {marcas.filter(m => m.ativo).map(marca => (
                    <option key={marca.id} value={marca.id}>{marca.nome}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactiveModelos}
                  onChange={(e) => setShowInactiveModelos(e.target.checked)}
                  className="w-4 h-4 text-brand-yellow bg-gray-800 border-gray-600 rounded focus:ring-brand-yellow"
                />
                <span className="text-sm">Mostrar inativos</span>
              </label>
              
              <span className="text-xs text-gray-500">
                ({filteredModelos.length} de {modelos.length} registos)
              </span>
            </div>

            {/* Modelos Grid */}
            <EditableDataGrid
              columns={modelosColumns}
              data={filteredModelos}
              idField="id"
              onSave={handleSaveModelo}
              onToggleActive={handleToggleActiveModelo}
              canAdd={true}
              canEdit={true}
              canDelete={false}
              canToggleActive={true}
              loading={loadingModelos}
            />
          </>
        )}
      </main>
    </div>
  );
}
