import React from 'react';

interface ApiVehicle {
  id: string;
  licensePlate: string;
  clientName?: string;
  make: string;
  model: string;
  status: string;
  lastIntervention?: string;
}

interface VehicleTableProps {
  filter: string;
  vehicles?: ApiVehicle[];
}

const VehicleTable: React.FC<VehicleTableProps> = ({ filter, vehicles = [] }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'na_oficina':
        return 'Na Oficina';
      case 'disponivel':
        return 'Disponível';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'na_oficina':
        return 'text-yellow-400 bg-yellow-800/50';
      case 'disponivel':
        return 'text-green-400 bg-green-800/50';
      default:
        return 'text-gray-400 bg-gray-800/50';
    }
  };

  const filteredVehicles = filter === 'todos'
    ? vehicles
    : vehicles.filter(vehicle => vehicle.status === filter);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Matrícula</th>
            <th className="px-6 py-3">Cliente</th>
            <th className="px-6 py-3">Modelo</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Últ. Intervenção</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map((vehicle) => (
            <tr key={vehicle.id} className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="px-6 py-4 font-medium text-white">{vehicle.id}</td>
              <td className="px-6 py-4">{vehicle.licensePlate}</td>
              <td className="px-6 py-4">{vehicle.clientName || ''}</td>
              <td className="px-6 py-4">{vehicle.make} {vehicle.model}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-none ${getStatusColor(vehicle.status)}`}>
                  {getStatusLabel(vehicle.status)}
                </span>
              </td>
              <td className="px-6 py-4">{vehicle.lastIntervention || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
