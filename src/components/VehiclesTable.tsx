"use client";

import { Vehicle as VehicleData, getClientById } from "../data/mockData";

interface VehiclesTableProps {
  vehicles: VehicleData[];
  onViewHistory: (vehicle: VehicleData) => void;
}

export default function VehiclesTable({ vehicles, onViewHistory }: VehiclesTableProps) {
  return (
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
            {vehicles.map((vehicle) => {
              const client = getClientById(vehicle.clientId);
              return (
                <tr key={vehicle.id} className="hover:bg-gray-600 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-100 font-mono">{vehicle.licensePlate}</td>
                  <td className="px-6 py-4 text-gray-200">{`${vehicle.make} ${vehicle.model}`}</td>
                  <td className="px-6 py-4 text-gray-300">{client?.nome || 'Cliente não encontrado'}</td>
                  <td className="px-6 py-4 text-gray-400">{vehicle.year}</td>
                  <td className="px-6 py-4 text-gray-300">{vehicle.lastIntervention}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewHistory(vehicle)}
                      className="text-brand-yellow hover:text-brand-yellow-light font-medium transition-colors flex items-center justify-center mx-auto"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Histórico
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
