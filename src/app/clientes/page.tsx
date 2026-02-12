"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import ClientTable from "../../components/ClientTable";
import ClientModal from "../../components/ClientModal";
import type { Cliente } from "../../data/mockData";

export default function ClientesPage() {
  const [clients, setClients] = useState<Cliente[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clientes');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleAddClient = async (newClient: Omit<Cliente, 'id' | 'dataRegistro' | 'totalGasto' | 'visitas'>) => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (response.ok) {
        const savedClient = await response.json();
        setClients(prev => [...prev, savedClient]);
      }
    } catch (err) {
      console.error('Failed to add client:', err);
    }
  };



  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setClients(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };


  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nif.includes(searchTerm) ||
    client.telefone.includes(searchTerm)
  );

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="clientes" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Clientes</h2>
            <p className="mt-1 text-gray-400">Gerencie a sua base de clientes</p>
          </div>
          <Link
            href="/clientes/novo"
            className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Cliente
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-gray-700 border border-gray-600 p-4 mb-6 rounded-none flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome, NIF ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400">Carregando clientes...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
            Erro ao carregar clientes: {error}
          </div>
        ) : (
          <ClientTable
            clients={filteredClients}
            onDelete={handleDelete}
          />

        )}
      </main>

    </div>

  );
}
