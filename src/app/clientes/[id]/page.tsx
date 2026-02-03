"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import VehicleHistoryModal from "@/components/VehicleHistoryModal";
import {
  mockClients,
  mockVehicles,
  mockServiceHistory,
  getClientById,
  getVehiclesByClientId,
  getServiceHistoryByVehicleId,
  getClientStats,
  Cliente,
  Vehicle,
  ServiceHistory,
  ModalVehicle,
  ClientStats
} from "@/data/mockData";

export default function ClientDetailsPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Cliente | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [note, setNote] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<ModalVehicle | null>(null);

  useEffect(() => {
    // In a real app, fetch data from API
    const foundClient = mockClients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
      setVehicles(mockVehicles);
      setServiceHistory(mockServiceHistory);
      setStats(getClientStats(clientId));
    }
  }, [clientId]);

  const handleSaveNote = () => {
    // In a real app, save note to API
    console.log("Saving note:", note);
    setNote("");
  };

  const handleViewHistory = (vehicle: Vehicle) => {
    // Transform vehicle data to match modal interface
    const vehicleForModal = {
      id: vehicle.id,
      plate: vehicle.licensePlate,
      makeModel: `${vehicle.make} ${vehicle.model}`,
      client: client?.nome || '',
      year: vehicle.year,
      lastIntervention: '28/10/2024' // Mock data
    };
    setSelectedVehicle(vehicleForModal);
    setIsHistoryModalOpen(true);
  };

  if (!client) {
    return (
      <div className="flex h-screen bg-gray-800">
        <Sidebar activePage="clientes" />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Cliente não encontrado</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="clientes" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">{client.nome}</h2>
            <p className="mt-1 text-gray-400">Cliente #{client.id} • Registado em {client.dataRegistro}</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors rounded-none flex items-center justify-center">
              Editar Dados
            </button>
            <button className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Novo Veículo
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Info & Stats */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Info */}
            <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 border-b border-gray-600 pb-2">Dados de Contacto</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-gray-400 text-xs uppercase tracking-wider">Email</span>
                  <span className="text-gray-200 font-medium">{client.email}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs uppercase tracking-wider">Telefone</span>
                  <span className="text-gray-200 font-medium">{client.telefone}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs uppercase tracking-wider">NIF</span>
                  <span className="text-gray-200 font-medium">{client.nif}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs uppercase tracking-wider">Morada</span>
                  <span className="text-gray-200 font-medium">{client.endereco}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 border-b border-gray-600 pb-2">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800 border border-gray-600">
                    <span className="block text-3xl font-bold text-brand-yellow">{stats.visits}</span>
                    <span className="text-xs text-gray-400 uppercase">Visitas</span>
                  </div>
                  <div className="text-center p-4 bg-gray-800 border border-gray-600">
                    <span className="block text-3xl font-bold text-brand-yellow">€{stats.totalSpent}</span>
                    <span className="text-xs text-gray-400 uppercase">Total Gasto</span>
                  </div>
                </div>

                {/* Simple Line Chart */}
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Evolução de Gastos (12 Meses)</h4>
                  <div className="relative w-full h-32">
                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="0" y1="75" x2="300" y2="75" stroke="#4b5563" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#4b5563" strokeWidth="1" strokeDasharray="4" />
                      <line x1="0" y1="25" x2="300" y2="25" stroke="#4b5563" strokeWidth="1" strokeDasharray="4" />

                      {/* Chart Line */}
                      <polyline
                        fill="none"
                        stroke="#facc15"
                        strokeWidth="2"
                        points={stats.monthlyExpenses.map((value, index) => {
                          const x = (index / (stats.monthlyExpenses.length - 1)) * 300;
                          const y = 100 - (value / Math.max(...stats.monthlyExpenses)) * 80;
                          return `${x},${y}`;
                        }).join(' ')}
                      />

                      {/* Dots */}
                      {stats.monthlyExpenses.map((value, index) => {
                        const x = (index / (stats.monthlyExpenses.length - 1)) * 300;
                        const y = 100 - (value / Math.max(...stats.monthlyExpenses)) * 80;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#374151"
                            stroke="#facc15"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
                      <span>JAN</span>
                      <span>JUN</span>
                      <span>DEZ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Notes */}
            <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 border-b border-gray-600 pb-2">Notas Rápidas</h3>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSaveNote(); }}>
                <textarea
                  className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm p-3 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500 outline-none"
                  rows={3}
                  placeholder="Adicionar nota informal..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors text-sm font-medium rounded-none"
                >
                  Guardar Nota
                </button>
              </form>
              <div className="mt-4 space-y-3">
                <div className="bg-gray-800 p-3 border-l-2 border-brand-yellow">
                  <p className="text-xs text-gray-400 mb-1">10/10/2023</p>
                  <p className="text-sm text-gray-300">Cliente prefere contacto via email durante o horário laboral.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Vehicles & History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vehicles */}
            <div className="bg-gray-700 border border-gray-600 rounded-none">
              <div className="p-6 border-b border-gray-600 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-100">Veículos Associados ({vehicles.length})</h3>
              </div>
              <div className="p-6 grid gap-4">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className={`flex items-center justify-between p-4 border-l-4 ${vehicle.status === 'na_oficina' ? 'border-brand-yellow bg-gray-800' : 'border-gray-600 bg-gray-800 hover:border-gray-500 transition-colors'}`}>
                    <div>
                      <h4 className="font-bold text-lg text-gray-100">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-sm text-gray-400">{vehicle.licensePlate} • {vehicle.year}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {vehicle.status === 'na_oficina' && (
                        <span className="px-3 py-1 text-xs font-bold bg-green-900 text-green-200 border border-green-700">NA OFICINA</span>
                      )}
                      <button
                        className="text-sm text-gray-400 hover:text-brand-yellow transition-colors"
                        onClick={() => handleViewHistory(vehicle)}
                      >
                        Ver Histórico &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-gray-700 border border-gray-600 rounded-none">
              <div className="p-6 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-gray-100">Histórico de Serviços</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                    <tr>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Veículo</th>
                      <th className="px-6 py-3">Serviço</th>
                      <th className="px-6 py-3 text-right">Valor</th>
                      <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {serviceHistory.map(service => (
                      <tr key={service.id} className="hover:bg-gray-600 transition-colors">
                        <td className="px-6 py-4">{service.date}</td>
                        <td className="px-6 py-4">{service.vehicle}</td>
                        <td className="px-6 py-4">{service.service}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-200">€{service.value.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <a href="#" className="text-brand-yellow hover:underline">Ver</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VehicleHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
