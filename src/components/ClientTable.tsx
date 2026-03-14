"use client";

import Link from "next/link";

export interface ClienteRecord {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  endereco?: string;
  perfil_id?: string;
  perfil?: string;
  veiculos: number;
  dataRegistro?: string;
  totalGasto?: number;
  visitas?: number;
}

interface ClientTableProps {
  clients: ClienteRecord[];
  onEdit?: (client: ClienteRecord) => void;
  onDelete?: (id: string) => void;
  onClientClick?: (client: ClienteRecord) => void;
}

// Função utilitária para cor do perfil
function getPerfilColor(perfil?: string) {
  switch ((perfil || '').toLowerCase()) {
    case 'empresa':
      return 'bg-blue-900 text-blue-200 border-blue-400';
    case 'tvde interno':
      return 'bg-green-900 text-green-200 border-green-400';
    case 'tvde externo':
      return 'bg-yellow-900 text-yellow-200 border-yellow-400';
    case 'normal':
    default:
      return 'bg-gray-900 text-gray-200 border-gray-600';
  }
}

export default function ClientTable({ clients, onEdit, onDelete, onClientClick }: ClientTableProps) {

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
      {/* Tabela para desktop */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Contactos</th>
                <th scope="col" className="px-6 py-3">NIF</th>
                <th scope="col" className="px-6 py-3 text-center">Perfil</th>
                <th scope="col" className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-600 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-100">
                    <button
                      className="underline text-brand-yellow hover:text-yellow-400 focus:outline-none"
                      onClick={() => onClientClick?.(client)}
                    >
                      {client.nome}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-200">{client.email}</div>
                    <div className="text-xs text-gray-500">{client.telefone}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">{client.nif}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-bold border rounded ${getPerfilColor(client.perfil)}`}>
                      {client.perfil || 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        href={`/clientes/${client.id}/edit`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar cliente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja apagar este cliente?')) {
                            onDelete?.(client.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Apagar cliente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards para mobile */}
      <div className="md:hidden flex flex-col gap-4 p-2">
        {clients.map(client => (
          <div key={client.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                className="font-bold text-brand-yellow underline text-lg"
                onClick={() => onClientClick?.(client)}
              >
                {client.nome}
              </button>
              <span className={`px-2 py-1 text-xs font-bold border rounded ${getPerfilColor(client.perfil)}`}>
                {client.perfil || 'Normal'}
              </span>
            </div>
            <div className="text-gray-200 text-sm">{client.email}</div>
            <div className="text-xs text-gray-400">{client.telefone}</div>
            <div className="font-mono text-gray-300 text-xs">NIF: {client.nif}</div>
            <div className="flex justify-end gap-2 mt-2">
              <Link
                href={`/clientes/${client.id}/edit`}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Editar cliente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja apagar este cliente?')) {
                    onDelete?.(client.id);
                  }
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Apagar cliente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
