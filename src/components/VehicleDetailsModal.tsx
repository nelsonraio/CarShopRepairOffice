import React from 'react';

interface ApiVehicle {
  id: string;
  licensePlate: string;
  clientName?: string;
  clientProfile?: string;
  make: string;
  model: string;
  status: string;
  lastIntervention?: string;
  year?: string | number;
}

interface VehicleDetailsModalProps {
  vehicle: ApiVehicle;
  onClose: () => void;
}

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

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose }) => {
  if (typeof window === 'undefined') return null;
  alert('Modal!');
  console.log('VehicleDetailsModal vehicle:', vehicle);
  return (
    <React.Fragment>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-lg mx-4">
                <h3 className="text-xl font-bold text-white mb-4">Detalhes do Veículo</h3>
                <div className="mb-4 p-3 bg-yellow-600 text-white rounded text-center font-bold">VehicleDetailsModal chamado!</div>
                <div className="space-y-2 text-gray-200">
                  <div><span className="font-semibold">ID:</span> <span>{vehicle.id || '-'}</span></div>
                  <div><span className="font-semibold">Nome do cliente:</span> <span>{vehicle.clientName || '-'}</span></div>
                  <div><span className="font-semibold">Perfil do cliente:</span> <span>{vehicle.clientProfile || '-'}</span></div>
                  <div><span className="font-semibold">Marca:</span> <span>{vehicle.make ? vehicle.make.charAt(0).toUpperCase() + vehicle.make.slice(1).toLowerCase() : '-'}</span></div>
                  <div><span className="font-semibold">Modelo:</span> <span>{vehicle.model ? vehicle.model.charAt(0).toUpperCase() + vehicle.model.slice(1).toLowerCase() : '-'}</span></div>
                  <div><span className="font-semibold">Matrícula:</span> <span>{vehicle.licensePlate || '-'}</span></div>
                  <div><span className="font-semibold">Ano:</span> <span>{vehicle.year || '-'}</span></div>
                  <div><span className="font-semibold">Estado:</span> <span>{getStatusLabel(vehicle.status)}</span></div>
                  <div><span className="font-semibold">Última intervenção:</span> <span>{vehicle.lastIntervention || '-'}</span></div>
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    </React.Fragment>
);
};

export default VehicleDetailsModal;
