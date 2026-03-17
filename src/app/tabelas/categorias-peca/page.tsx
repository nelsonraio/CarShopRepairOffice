"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

interface CategoriaPeca {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

const columns: ColumnDef<CategoriaPeca>[] = [
  {
    key: 'nome',
    header: 'Nome',
    type: 'text',
    required: true,
    width: '30%'
  },
  {
    key: 'descricao',
    header: 'Descrição',
    type: 'text',
    width: '55%'
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

export default function CategoriasPecaPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<CategoriaPeca[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categorias-pecas');
      if (response.ok) {
        // O endpoint retorna apenas categorias ativas, sem campo 'ativo'.
        const data = await response.json();
        // Adiciona ativo: true para compatibilidade com a grelha
        setCategorias(data.map((cat: any) => ({ ...cat, ativo: true })));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSave = async (row: CategoriaPeca, isNew: boolean) => {
    console.log('row:', row, 'isNew:', isNew);
    let url = '';
    let method = '';
    let body: any = {};
    if (isNew) {
      url = '/api/categorias-pecas';
      method = 'POST';
      body = { nome: row.nome, descricao: row.descricao };
    } else {
      url = `/api/categorias-pecas/${row.id}`;
      method = 'PUT';
      body = { nome: row.nome, descricao: row.descricao };
    }
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let error = { error: 'Erro ao guardar categoria.' };
      try {
        const text = await response.text();
        if (text) error = JSON.parse(text);
      } catch {}
      alert(error.error || 'Erro ao guardar categoria.');
    } else {
      fetchCategorias();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem a certeza que deseja eliminar esta categoria?')) return;
    const response = await fetch(`/api/categorias-pecas/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const error = await response.json();
      alert(error.error || 'Erro ao eliminar categoria.');
    } else {
      fetchCategorias();
    }
  };

  const handleToggleActive = async (id: number, active: boolean) => {
    const response = await fetch(`/api/categorias-pecas/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: active })
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.error || 'Erro ao atualizar estado.');
    } else {
      fetchCategorias();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-800">
      <Sidebar activePage="tabelas" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Categorias de Peças</h1>
        <EditableDataGrid
          columns={columns}
          data={categorias.filter(c => showInactive || c.ativo)}
          onSave={handleSave}
          canAdd={true}
          canEdit={true}
          canDelete={true}
          canToggleActive={true}
          loading={loading}
        />
        <div className="mt-4">
          <label className="inline-flex items-center text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox mr-2"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
            />
            Mostrar inativos
          </label>
        </div>
      </main>
    </div>
  );
}
