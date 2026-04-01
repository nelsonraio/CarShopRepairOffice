'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react'; // Type-only imports para TS verbatimModuleSyntax
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '../../../../components/Sidebar';
import { useFetch } from '@/hooks';

/**
 * Interface para resposta da API ao buscar dados de cliente
 */
interface ClientApiResponse {
  client: {
    id: string;
    nome: string;
    nif: string;
    telefone: string;
    email: string;
    endereco: string;
    perfil: string;
    perfil_id: string;
  };
}

/**
 * Interface para perfis de clientes
 */
interface ProfileApiResponse {
  id: string;
  nome: string;
  descricao: string | null;
  desconto: number;
  ativo: boolean;
}

/**
 * Página de Edição de Cliente
 * 
 * Uso de hooks customizados:
 * - useFetch: Carrega dados do cliente e lista de perfis
 * - useParams: Obtém ID do cliente da URL (/clientes/[id]/edit)
 * 
 * Processo:
 * 1. Carrega cliente existente via API
 * 2. Popula formulário com dados atuais
 * 3. Permite edição de campos
 * 4. Envia PUT para /api/clientes/{id}
 * 5. Redireciona para lista após sucesso
 */
const EditClientPage = () => {
  const params = useParams();
  const id = params.id as string;

  // Memoiza URL para evitar re-fetches desnecessários
  const clientUrl = useMemo(() => `/api/clientes/${id}`, [id]);
  
  // Carrega dados do cliente via useFetch hook
  const { data: clientData, loading: loadingClient, error: clientError } = useFetch<ClientApiResponse>(clientUrl);

  const loading = loadingClient;
  const error = clientError;

  // Estado do formulário - inicializado vazio
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    telefone: '',
    email: '',
    endereco: '',
    perfilId: '' // perfil_id
  });

  // Estado para perfis
  const [perfis, setPerfis] = useState<ProfileApiResponse[]>([]);

  /**
   * Popula formulário quando dados do cliente são carregados
   * Executa apenas quando clientData muda
   */
  useEffect(() => {
    const client = clientData?.client;
    if (!client) return;

    setFormData({
      nome: client.nome || '',
      nif: client.nif || '',
      telefone: client.telefone || '',
      email: client.email || '',
      endereco: client.endereco || '',
      perfilId: client.perfil_id || ''
    });
  }, [clientData]);

  /**
   * Fetch perfis de clientes
   */
  useEffect(() => {
    fetch('/api/perfis-clientes').then(res => res.json()).then(data => setPerfis(data));
  }, []);

  /**
   * Handler para mudanças em campos do formulário
   * Atualiza formData preservando outros campos
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Submete formulário de edição
   * 
   * Processo:
   * 1. Previne submit padrão do formulário
   * 2. Envia PUT para /api/clientes/{id} com dados do formulário
   * 3. Se sucesso: alerta e redireciona para lista
   * 4. Se erro: mostra mensagem de erro
   */
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    if (!formData.nome.trim()) {
      setSubmitError('O nome do cliente é obrigatório.');
      return;
    }
    const payload = {
      ...formData,
      perfil_id: formData.perfilId || null,
    };
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setSubmitError('Erro ao atualizar cliente');
        return;
      }
      setSubmitSuccess('Cliente atualizado com sucesso!');
      setTimeout(() => { window.location.href = '/clientes'; }, 1200);
    } catch (error) {
      console.error('Error updating client:', error);
      setSubmitError('Erro ao atualizar cliente');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-800">
        <Sidebar activePage="clientes" />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400">Carregando cliente...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-800">
        <Sidebar activePage="clientes" />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
          <div className="max-w-5xl mx-auto bg-red-900 border border-red-700 text-red-100 p-4">
            Erro ao carregar dados do cliente: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="clientes" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <header className="bg-gray-900 rounded-t-none p-6 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Editar Cliente</h1>
                <p className="text-sm text-gray-400 mt-1">
                  ID: <span className="font-mono text-brand-yellow">{id}</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/clientes" className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Voltar
                </Link>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Atualizar Cliente
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && <div className="text-red-400 text-sm mb-2">{submitError}</div>}
              {submitSuccess && <div className="text-green-400 text-sm mb-2">{submitSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Nome completo do cliente"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">NIF</label>
                  <input
                    type="text"
                    name="nif"
                    value={formData.nif}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                    placeholder="Número de Identificação Fiscal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                    placeholder="Número de telefone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="endereço de email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Morada</label>
                <textarea
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Morada completa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Perfil de Cliente</label>
                <select
                  name="perfilId"
                  value={formData.perfilId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                >
                  <option value="">Selecione o perfil</option>
                  {perfis.map((perfil) => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.nome} {perfil.desconto > 0 && `(-${perfil.desconto}%)`}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditClientPage;
