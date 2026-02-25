'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import VehiclesTable, { type VehicleData } from '../../components/VehiclesTable';
import VehicleHistoryModal from '../../components/VehicleHistoryModal';

interface Vehicle {
  id: string;
  plate: string;
  makeModel: string;
  client: string;
  year: number;
  lastIntervention: string;
}

export default function VeiculosPage() {
    const [plateModalOpen, setPlateModalOpen] = useState(false);
    const [plateDetails, setPlateDetails] = useState<VehicleData | null>(null);

    const handlePlateClick = (vehicle: VehicleData) => {
      setPlateDetails(vehicle);
      setPlateModalOpen(true);
    };
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;


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

  // Reset pagination on data load
  useEffect(() => {
    setCurrentPage(1);
  }, [vehicles]);

  const filteredVehicles = vehicles;

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleViewHistory = (vehicle: VehicleData) => {
    const vehicleForModal: Vehicle = {
      id: vehicle.id,
      plate: vehicle.licensePlate,
      makeModel: `${vehicle.make} ${vehicle.model}`,
      client: vehicle.clientName || 'Cliente não encontrado',
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
          <>
            <VehiclesTable
              vehicles={paginatedVehicles}
              onViewHistory={handleViewHistory}
              onDelete={handleDelete}
              onPlateClick={handlePlateClick}
            />
            {/* Plate Details Modal */}
            {plateModalOpen && plateDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-gray-800 border border-brand-yellow w-full max-w-md p-8 rounded-lg shadow-2xl relative">
                  <button
                    onClick={() => setPlateModalOpen(false)}
                    className="absolute top-3 right-3 text-brand-yellow hover:text-yellow-400"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-brand-yellow mb-6">Detalhes do Veículo</h2>
                  <div className="space-y-3">
                    {Object.entries(plateDetails).map(([key, value]) => (
                      <div className="text-gray-100" key={key}>
                        <span className="font-semibold text-brand-yellow">{key.replace(/_/g, ' ').toUpperCase()}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredVehicles.length > 0 && (
              <div className="mt-4 bg-gray-700 px-4 py-3 border border-gray-600 flex items-center justify-between rounded">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredVehicles.length)}</span> de <span className="font-medium text-gray-200">{filteredVehicles.length}</span> veículos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-3">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      <VehicleHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} vehicle={selectedVehicle} />

    </div>
  );
}
