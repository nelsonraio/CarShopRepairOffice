'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';

interface PerfilCliente {
  id: string;
  nome: string;
  descricao: string | null;
  desconto: number;
  ativo: boolean;
}

const NewClientPage = () => {
  const [perfis, setPerfis] = useState<PerfilCliente[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    telefone: '',
    email: '',
    endereco: '',
    perfil: 'Normal'
  });

  useEffect(() => {
    fetchPerfis();
  }, []);

  const fetchPerfis = async () => {
    try {
      const response = await fetch('/api/perfis-clientes');
      if (response.ok) {
        const data = await response.json();
        setPerfis(data);
      }
    } catch (error) {
      console.error('Failed to fetch perfis:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Cliente criado com sucesso!');
        // Reset form
        setFormData({
          nome: '',
          nif: '',
          telefone: '',
          email: '',
          endereco: '',
          perfil: 'Normal'
        });
      } else {
        alert('Erro ao criar cliente');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Erro ao criar cliente');
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="clientes" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <header className="bg-gray-900 rounded-t-none p-6 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Novo Cliente</h1>
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
                  Guardar Cliente
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone *</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                    placeholder="Número de telefone"
                    required
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
                  name="perfil"
                  value={formData.perfil}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                >
                  {perfis.map((perfil) => (
                    <option key={perfil.id} value={perfil.nome}>
                      {perfil.nome} {perfil.desconto > 0 && `(-${perfil.desconto}%)`}
                    </option>
                  ))}
                </select>
                {(() => {
                  const selectedPerfil = perfis.find(p => p.nome === formData.perfil);
                  return selectedPerfil && selectedPerfil.desconto && selectedPerfil.desconto > 0 ? (
                    <p className="text-xs text-brand-yellow mt-1">
                      Desconto de {selectedPerfil.desconto}% aplicado a este perfil
                    </p>
                  ) : null;
                })()}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewClientPage;
