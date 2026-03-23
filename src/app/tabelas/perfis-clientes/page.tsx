"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import EditableDataGrid, { type ColumnDef } from "@/components/EditableDataGrid";

/**
 * Estrutura de dados para Perfil de Cliente
 * Define percentagem de lucro padrão aplicada a clientes deste perfil
 */
interface PerfilCliente {
  id: number;
  nome: string;
  descricao: string | null;
  perclucro: number; // Percentagem de lucro (ex: 55 = 55%)
  ativo: boolean;
}


const parsePercent = (value: unknown): number => {
  // Caso 1: Já é número
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  // Caso 2: String ('55' ou '55,00' ou '55.00')
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim(); // PT usa vírgula
    if (!normalized) return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Caso 3: Objeto Decimal 
  if (value && typeof value === 'object' && typeof (value as { toString?: () => string }).toString === 'function') {
    const stringValue = (value as { toString: () => string }).toString();
    const normalized = stringValue.replace(',', '.').trim();
    if (!normalized) return 0;
    const parsedObject = Number(normalized);
    return Number.isFinite(parsedObject) ? parsedObject : 0;
  }

  // Caso 4: Tentativa genérica de conversão
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Definição das colunas para o EditableDataGrid
 * Configura validações, formatações e tipos de input
 */
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
    // Validação customizada para percentagem
    validate: (value) => {
      if (value === null || value === undefined || value === '') return null;
      const numeric = parsePercent(value);
      if (!Number.isFinite(numeric)) return 'Percentagem de lucro inválida';
      if (numeric < 0) return 'Percentagem de lucro não pode ser negativa';
      return null;
    },
    // Formatação para visualização: 55.00%
    format: (value) => {
      const safeValue = parsePercent(value);
      return `${safeValue.toFixed(2)}%`;
    }
  },
  {
    key: 'ativo',
    header: 'Ativo',
    type: 'boolean',
    width: '10%'
  }
];

/**
 * Página de gestão de Perfis de Clientes
 * 
 * Permite:
 * - Visualizar perfis de clientes (ativos e inativos)
 * - Criar novos perfis
 * - Editar perfis existentes (inline editing)
 * - Activar/desactivar perfis
 * - Validação de percentagens com suporte a vírgula decimal
 * 
 * IMPORTANTE: Esta página lida com Decimal que precisa de normalização
 * para evitar exibição de NaN ou 0.00%
 */
export default function PerfisClientesPage() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<PerfilCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  /**
   * Carrega todos os perfis da API (ativos e inativos)
   * 
   * IMPORTANTE: Normaliza perclucro de Decimal para number
   *  retorna Decimal que precisa ser convertido para evitar bugs de exibição
   */
  const fetchPerfis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/perfis-clientes?all=true');
      if (response.ok) {
        const data = await response.json();
        // Normalizar Decimal para number em cada perfil
        const normalized = Array.isArray(data)
          ? data.map((perfil) => {
              const numeric = typeof perfil?.perclucro === 'number'
                ? perfil.perclucro
                : parsePercent(perfil?.perclucro);

              return {
                ...perfil,
                perclucro: Number.isFinite(numeric) ? numeric : 0,
              };
            })
          : [];

        setPerfis(normalized);
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

  /**
   * Grava perfil (novo ou editado)
   * 
   * Processo:
   * 1. Determina URL e método (POST para novo, PUT para edição)
   * 2. Sanitiza percentagem usando parsePercent
   * 3. Envia para API
   * 4. Recarrega dados se sucesso
   * 5. Lança erro se falhar (capturado por EditableDataGrid)
   */
  const handleSave = async (row: PerfilCliente, isNew: boolean) => {
    const url = isNew ? '/api/perfis-clientes' : `/api/perfis-clientes/${row.id}`;
    const method = isNew ? 'POST' : 'PUT';

    // Sanitizar percentagem para garantir número válido
    const numeric = parsePercent(row.perclucro);
    const sanitizedRow: PerfilCliente = {
      ...row,
      perclucro: Number.isFinite(numeric) ? numeric : 0,
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedRow)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Ignore parse errors and keep fallback message
        }
      }

      throw new Error(errorMessage);
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
