import React from 'react';

interface Vehicle {
  id: string;
  matricula: string;
  cliente: string;
  modelo: string;
  mecanico: string;
  status: string;
  entrada: string;
}

interface VehicleTableProps {
  filter: string;
}

const VehicleTable: React.FC<VehicleTableProps> = ({ filter }) => {
  // Sample data - in a real app, this would come from an API
  const vehicles: Vehicle[] = [
    {
      id: '001',
      matricula: 'AA-12-BB',
      cliente: 'João Silva',
      modelo: 'Renault Clio',
      mecanico: 'Carlos Mendes',
      status: 'aguarda_pecas',
      entrada: '2024-01-15'
    },
    {
      id: '002',
      matricula: 'BB-34-CC',
      cliente: 'Maria Santos',
      modelo: 'Volkswagen Golf',
      mecanico: 'Ana Costa',
      status: 'pronto',
      entrada: '2024-01-10'
    },
    {
      id: '003',
      matricula: 'CC-56-DD',
      cliente: 'Pedro Alves',
      modelo: 'Ford Focus',
      mecanico: 'Rui Pereira',
      status: 'aguarda_pecas',
      entrada: '2024-01-12'
    },
    {
      id: '004',
      matricula: 'DD-78-EE',
      cliente: 'Sofia Rodrigues',
      modelo: 'Opel Astra',
      mecanico: 'Miguel Ferreira',
      status: 'pronto',
      entrada: '2024-01-08'
    },
    {
      id: '005',
      matricula: 'EE-90-FF',
      cliente: 'Rui Alves',
      modelo: 'Peugeot 208',
      mecanico: 'Carlos Mendes',
      status: 'a_reparar',
      entrada: '2024-01-14'
    }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguarda_pecas':
        return 'Aguarda Peças';
      case 'pronto':
        return 'Pronto';
      case 'a_reparar':
        return 'A Reparar';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguarda_pecas':
        return 'text-yellow-400 bg-yellow-800/50';
      case 'pronto':
        return 'text-green-400 bg-green-800/50';
      case 'a_reparar':
        return 'text-blue-400 bg-blue-800/50';
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
            <th className="px-6 py-3">N. Proc.</th>
            <th className="px-6 py-3">Matrícula</th>
            <th className="px-6 py-3">Cliente</th>
            <th className="px-6 py-3">Modelo</th>
            <th className="px-6 py-3">Mecânico</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Entrada</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map((vehicle) => (
            <tr key={vehicle.id} className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="px-6 py-4 font-medium text-white">{vehicle.id}</td>
              <td className="px-6 py-4">{vehicle.matricula}</td>
              <td className="px-6 py-4">{vehicle.cliente}</td>
              <td className="px-6 py-4">{vehicle.modelo}</td>
              <td className="px-6 py-4">{vehicle.mecanico}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-none ${getStatusColor(vehicle.status)}`}>
                  {getStatusLabel(vehicle.status)}
                </span>
              </td>
              <td className="px-6 py-4">{vehicle.entrada}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
