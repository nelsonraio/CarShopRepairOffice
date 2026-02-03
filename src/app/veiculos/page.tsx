'use client';

import { useState, useEffect } from 'react';
import VehiclesTable from '../../components/VehiclesTable';
import NewVehicleModal from '../../components/NewVehicleModal';
import VehicleHistoryModal from '../../components/VehicleHistoryModal';
import { Vehicle as VehicleData, getClientById } from '../../data/mockData';

interface Vehicle {
  id: string;
  plate: string;
  makeModel: string;
  client: string;
  year: number;
  lastIntervention: string;
}

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/veiculos');
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles;

  const handleViewHistory = (vehicle: VehicleData) => {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Veículos</h1>
      <button onClick={() => setIsNewVehicleModalOpen(true)}>Novo Veículo</button>
      <VehiclesTable vehicles={filteredVehicles} onViewHistory={handleViewHistory} />
      <NewVehicleModal isOpen={isNewVehicleModalOpen} onClose={() => setIsNewVehicleModalOpen(false)} />
      <VehicleHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} vehicle={selectedVehicle} />
    </div>
  );
}
