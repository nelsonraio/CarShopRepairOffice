"use client";

import Link from "next/link";
import type { Cliente } from "../data/mockData";

interface ClientTableProps {
  clients: Cliente[];
  onEdit?: (client: Cliente) => void;
  onDelete?: (id: string) => void;
}

export default function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
            <tr>
              <th scope="col" className="px-6 py-3">Nome</th>
              <th scope="col" className="px-6 py-3">Contactos</th>
              <th scope="col" className="px-6 py-3">NIF</th>
              <th scope="col" className="px-6 py-3 text-center">Perfil</th>
              <th scope="col" className="px-6 py-3 text-center">Veículos</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-600 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-100">{client.nome}</td>
                <td className="px-6 py-4">
                  <div className="text-gray-200">{client.email}</div>
                  <div className="text-xs text-gray-500">{client.telefone}</div>
                </td>
                <td className="px-6 py-4 font-mono">{client.nif}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs font-bold border border-gray-600 ${
                    client.perfil === 'Normal' ? 'bg-blue-900 text-blue-200' :
                    client.perfil === 'TVDE Interno' ? 'bg-green-900 text-green-200' :
                    client.perfil === 'Empresa' ? 'bg-purple-900 text-purple-200' :
                    'bg-gray-900 text-gray-200'
                  }`}>
                    {client.perfil || 'Normal'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600">
                    {client.veiculos}
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
  );
}
