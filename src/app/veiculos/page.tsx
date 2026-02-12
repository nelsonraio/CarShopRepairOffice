'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import VehiclesTable from '../../components/VehiclesTable';
import VehicleHistoryModal from '../../components/VehicleHistoryModal';
import { getClientById } from '../../data/mockData';

interface Vehicle {
  id: string;
  plate: string;
  makeModel: string;
  client: string;
  year: number;
  lastIntervention: string;
}

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);


  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/veiculos');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        setError('Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles;

  const handleViewHistory = (vehicle: any) => {
    const vehicleForModal: Vehicle = {
      id: vehicle.id,
      plate: vehicle.licensePlate,
      makeModel: `${vehicle.make} ${vehicle.model}`,
      client: getClientById(vehicle.clientId)?.nome || 'Cliente não encontrado',
      year: vehicle.year,
      lastIntervention: vehicle.lastIntervention,
    };
    setSelectedVehicle(vehicleForModal);
    setIsHistoryModalOpen(true);
  };

  const handleDelete = async (id: string) => {

    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setVehicles(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="veiculos" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Veículos</h2>
            <p className="mt-1 text-gray-400">Gerencie a frota de veículos</p>
          </div>
          <Link
            href="/veiculos/novo"
            className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Veículo
          </Link>

        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-400">Carregando veículos...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
            Erro ao carregar veículos: {error}
          </div>
        ) : (
          <VehiclesTable
            vehicles={filteredVehicles}
            onViewHistory={handleViewHistory}
            onDelete={handleDelete}
          />
        )}

      </main>

      <VehicleHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} vehicle={selectedVehicle} />

    </div>
  );
}
