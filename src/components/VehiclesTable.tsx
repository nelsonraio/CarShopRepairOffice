'use client';

import { useState } from "react";
import Link from "next/link";
import type { Vehicle as VehicleData } from "../data/mockData";
import { getClientById } from "../data/mockData";




interface VehiclesTableProps {
  vehicles: VehicleData[];
  onViewHistory: (vehicle: VehicleData) => void;
  onEdit?: (vehicle: VehicleData) => void;
  onDelete?: (id: string) => void;
}

export default function VehiclesTable({ vehicles, onViewHistory, onEdit, onDelete }: VehiclesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVehicles = vehicles.filter(vehicle => {
    const client = getClientById(vehicle.clientId);
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.licensePlate.toLowerCase().includes(searchLower) ||
      (client?.nome || '').toLowerCase().includes(searchLower) ||
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-gray-700 border border-gray-600 p-4 rounded-none flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Pesquisar por matrícula, cliente, marca ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">Matrícula</th>
                <th scope="col" className="px-6 py-3">Marca / Modelo</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Ano</th>
                <th scope="col" className="px-6 py-3">Última Intervenção</th>
                <th scope="col" className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredVehicles.map((vehicle) => {
                // Use clientName from API data if available, otherwise fall back to mock data lookup
                const clientName = (vehicle as any).clientName || getClientById(vehicle.clientId)?.nome || 'Cliente não encontrado';
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-100 font-mono">{vehicle.licensePlate}</td>
                    <td className="px-6 py-4 text-gray-200">{`${vehicle.make} ${vehicle.model}`}</td>
                    <td className="px-6 py-4 text-gray-300">{clientName}</td>
                    <td className="px-6 py-4 text-gray-400">{vehicle.year}</td>
                    <td className="px-6 py-4 text-gray-300">{vehicle.lastIntervention}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onViewHistory(vehicle)}
                          className="text-brand-yellow hover:text-brand-yellow-light transition-colors"
                          title="Ver histórico"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                        <Link
                          href={`/veiculos/${vehicle.id}/edit`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar veículo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </Link>

                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja apagar este veículo?')) {
                              onDelete?.(vehicle.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Apagar veículo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
