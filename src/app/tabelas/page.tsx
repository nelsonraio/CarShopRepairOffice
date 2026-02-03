"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface SystemTable {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  icon: string;
}

const systemTables: SystemTable[] = [
  {
    id: "mecanicos",
    name: "Mecânicos",
    description: "Gerir equipa técnica, especialidades e disponibilidade.",
    recordCount: 3,
    icon: "users"
  },
  {
    id: "categorias-pecas",
    name: "Categorias de Peças",
    description: "Definir categorias para organização do inventário.",
    recordCount: 5,
    icon: "tag"
  },
  {
    id: "tipos-servico",
    name: "Tipos de Serviço",
    description: "Configurar tipos de intervenção e tempos estimados.",
    recordCount: 8,
    icon: "settings"
  },
  {
    id: "marcas-modelos",
    name: "Marcas e Modelos",
    description: "Gerir lista de marcas de veículos suportadas.",
    recordCount: 12,
    icon: "zap"
  },
  {
    id: "taxas-iva",
    name: "Taxas de IVA",
    description: "Configurar taxas de imposto aplicáveis.",
    recordCount: 3,
    icon: "calculator"
  },
  {
    id: "perfis-clientes",
    name: "Perfis de Clientes",
    description: "Gerir perfis (Normal, TVDE Interno, TVDE Externo, etc).",
    recordCount: 4,
    icon: "user"
  },
  {
    id: "fornecedores",
    name: "Fornecedores",
    description: "Gerir lista de fornecedores de peças e contactos.",
    recordCount: 15,
    icon: "building"
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "users":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      );
    case "tag":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      );
    case "settings":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      );
    case "zap":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      );
    case "calculator":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    case "user":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      );
    case "building":
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
  }
};

export default function TabelasPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTables = systemTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageTable = (tableId: string) => {
    // In a real app, this would navigate to the specific table management page
    console.log(`Managing table: ${tableId}`);
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="tabelas" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Tabelas de Sistema</h2>
            <p className="mt-1 text-gray-400">Gestão de tabelas auxiliares e configurações</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-700 border border-gray-600 p-4 mb-6 rounded-none">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar tabelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-gray-700 border border-gray-600 p-6 hover:border-brand-yellow transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-600 transition-colors">
                  {getIcon(table.icon)}
                </div>
                <span className="text-xs font-mono text-gray-400">{table.recordCount} Registos</span>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">{table.name}</h3>
              <p className="text-sm text-gray-400 mb-6">{table.description}</p>
              <button
                onClick={() => handleManageTable(table.id)}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-brand-yellow hover:text-gray-900 text-gray-300 font-medium transition-colors border border-gray-600 rounded-none"
              >
                Gerir Tabela
              </button>
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Nenhuma tabela encontrada com os critérios de pesquisa.</p>
          </div>
        )}
      </main>
    </div>
  );
}
