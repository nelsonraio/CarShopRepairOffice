"use client";

import { useState } from "react";
import { Cliente } from "../data/mockData";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Omit<Cliente, 'id' | 'dataRegistro' | 'totalGasto' | 'visitas'>) => void;
}

export default function ClientModal({ isOpen, onClose, onAddClient }: ClientModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    nif: '',
    telefone: '',
    email: '',
    endereco: '',
    perfil: 'Normal' as 'Normal' | 'TVDE Interno' | 'Empresa'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Omit<Cliente, 'id' | 'dataRegistro' | 'totalGasto' | 'visitas'> = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      nif: formData.nif,
      endereco: formData.endereco,
      perfil: formData.perfil,
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-lg p-6 shadow-2xl relative">
        <h3 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-2">Novo Cliente</h3>
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
              <option value="Normal">Normal</option>
              <option value="TVDE Interno">TVDE Interno</option>
              <option value="Empresa">Empresa</option>
            </select>
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
              className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
