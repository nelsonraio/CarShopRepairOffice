"use client";

import Link from "next/link";
import { Cliente } from "../data/mockData";

interface ClientTableProps {
  clients: Cliente[];
}

export default function ClientTable({ clients }: ClientTableProps) {
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
                  <Link href={`/clientes/${client.id}`} className="text-brand-yellow hover:text-brand-yellow-light font-medium transition-colors">
                    Ver Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
