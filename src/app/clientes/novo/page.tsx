'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';

const NewClientPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    telefone: '',
    email: '',
    endereco: '',
    perfil_id: ''
  });

  const [perfis, setPerfis] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    // Buscar perfis de cliente da API
    fetch('/api/perfis-clientes')
      .then(res => res.json())
      .then(data => {
        setPerfis(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, perfil_id: String(data[0].id) }));
        }
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    if (!formData.nome.trim()) {
      setSubmitError('O nome do cliente é obrigatório.');
      return;
    }
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          perfil_id: formData.perfil_id ? Number(formData.perfil_id) : undefined
        }),
      });
      if (response.ok) {
        setSubmitSuccess('Cliente criado com sucesso!');
        setTimeout(() => { window.location.href = '/clientes'; }, 1200);
      } else {
        const error = await response.json();
        setSubmitError(`Erro ao criar cliente: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setSubmitError('Erro ao criar cliente.');
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
                  name="perfil_id"
                  value={formData.perfil_id}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  required
                >
                  {perfis.map(perfil => (
                    <option key={perfil.id} value={perfil.id}>{perfil.nome}</option>
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

export default NewClientPage;
