"use client";

import { useState, useEffect } from "react";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  endereco: string;
  perfil: 'Normal' | 'TVDE Interno' | 'TVDE Externo' | 'Empresa';
  veiculos: number;
  dataRegistro: string;
  totalGasto: number;
  visitas: number;
}

interface PerfilCliente {
  id: string;
  nome: string;
  descricao: string | null;
  desconto: number;
  ativo: boolean;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Omit<Cliente, 'id' | 'dataRegistro' | 'totalGasto' | 'visitas'>) => void;
  client?: Cliente | null;
}

export default function ClientModal({ isOpen, onClose, onAddClient, client }: ClientModalProps) {
  const [perfis, setPerfis] = useState<PerfilCliente[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    telefone: '',
    email: '',
    endereco: '',
    perfil: 'Normal'
  });

  // Fetch perfis from API
  useEffect(() => {
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

    if (isOpen) {
      fetchPerfis();
    }
  }, [isOpen]);


  useEffect(() => {
    if (client) {
      setFormData({
        nome: client.nome,
        nif: client.nif,
        telefone: client.telefone,
        email: client.email,
        endereco: client.endereco || '',
        perfil: client.perfil || 'Normal'
      });
    } else {
      setFormData({
        nome: '',
        nif: '',
        telefone: '',
        email: '',
        endereco: '',
        perfil: 'Normal'
      });
    }
  }, [client, isOpen]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Omit<Cliente, 'id' | 'dataRegistro' | 'totalGasto' | 'visitas'> = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      nif: formData.nif,
      endereco: formData.endereco,
      perfil: formData.perfil as 'Normal' | 'TVDE Interno' | 'TVDE Externo' | 'Empresa',
      veiculos: 0
    };
    onAddClient(newClient);
    setFormData({
      nome: '',
      nif: '',
      telefone: '',
      email: '',
      endereco: '',
      perfil: 'Normal'
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <h3 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-2">
          {client ? 'Editar Cliente' : 'Novo Cliente'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
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
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telefone *</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
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
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Morada</label>
            <textarea
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              rows={2}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Perfil de Cliente</label>
            <select
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
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

          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
            >
              {client ? 'Atualizar' : 'Guardar'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
