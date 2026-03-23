"use client";
import React from "react";

interface Vehicle {
  id: string;
  plate: string;
  makeModel: string;
  client: string;
  year: number;
  lastIntervention: string;
}

interface RepairHistory {
  id: string;
  proc: string;
  date: string;
  description: string;
  km: number;
  cost: number;
}

interface WorkOrder {
  id: string;
  ref_ordem_trabalho?: string;
  status: string;
  date: string;
  description: string;
  plate?: string; // Adicionado para filtrar por matrícula
  vehicle?: string; // Adicionado para corresponder ao uso em filtragem
  mechanic?: string;
  mecanico_nome?: string;
  veiculo_modelo?: string;
  items?: any[];
}

interface VehicleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}



const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({ isOpen, onClose, vehicle }) => {
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = React.useState<WorkOrder | null>(null);

  const formatCurrency = (value: unknown) => {
    const numericValue = Number(value) || 0;
    return numericValue.toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    });
  };

  const parseSortableDate = (value: string | undefined) => {
    if (!value) return 0;
    const parsed = new Date(value);
    const time = parsed.getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  React.useEffect(() => {
    if (isOpen && vehicle) {
      // Fetch work orders for this vehicle
      fetch(`/api/ordens-trabalho?vehicleId=${vehicle.id}&status=Concluída,Entregue`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setWorkOrders(Array.isArray(data) ? data : []));
    } else {
      setWorkOrders([]);
    }
  }, [isOpen, vehicle]);

  // Estado para histórico real
  const [repairHistory, setRepairHistory] = React.useState<RepairHistory[]>([]);

  React.useEffect(() => {
    if (isOpen && vehicle) {
      // Buscar histórico real por matrícula
      fetch(`/api/veiculos/history?plate=${encodeURIComponent(vehicle.plate)}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setRepairHistory(Array.isArray(data) ? data : []));
    } else {
      setRepairHistory([]);
    }
  }, [isOpen, vehicle]);

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          Histórico de Reparações
          {vehicle && (
            <span className="ml-4 text-brand-yellow text-base font-mono align-middle">
              {vehicle.plate} &mdash; {vehicle.makeModel}
            </span>
          )}
        </h3>
     
        <h4 className="text-lg font-bold text-brand-yellow mb-2">Ordens de Trabalho Concluídas/Entregues</h4>
        <div className="overflow-y-auto max-h-64 mb-8">
          {(() => {
            // Filtra as OTs pela matrícula do veículo selecionado, se disponível
            const filteredWorkOrders = vehicle && vehicle.plate
              ? workOrders.filter(wo => {
                  if (wo.plate === vehicle.plate) {
                    return true;
                  }

                  if ((wo as any).veiculo_matricula === vehicle.plate) {
                    return true;
                  }

                  // wo.vehicle pode ser "Marca Modelo | MATRICULA"
                  if (typeof wo.vehicle === 'string') {
                    const parts = wo.vehicle.split('|');
                    const otPlate = Array.isArray(parts) && parts.length > 1 && typeof parts[1] === 'string' ? parts[1].trim() : '';
                    return otPlate === vehicle.plate;
                  }
                  // fallback para wo.plate se existir
                  return wo.plate === vehicle.plate;
                })
              : workOrders;

            const sortedWorkOrders = [...filteredWorkOrders].sort(
              (a, b) => parseSortableDate(b.date) - parseSortableDate(a.date)
            );

            if (sortedWorkOrders.length === 0) {
              return <div className="text-gray-400">Nenhuma ordem de trabalho encontrada para este veículo.</div>;
            }
            return (
              <div className="space-y-6">
                {sortedWorkOrders.map((wo) => (
                  <div key={wo.id} className="border border-gray-700 rounded p-3 bg-gray-900">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-brand-yellow text-lg">OT: {wo.ref_ordem_trabalho || wo.id}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="text-gray-100">
                        <span className="font-semibold text-gray-400">Marca/Modelo:</span>{' '}
                        {wo.veiculo_modelo || wo.vehicle || '-'}
                      </div>
                      <div className="text-gray-100">
                        <span className="font-semibold text-gray-400">Data:</span>{' '}
                        {wo.date || '-'}
                      </div>
                      <div className="text-gray-100">
                        <span className="font-semibold text-gray-400">Mecânico:</span>{' '}
                        {wo.mechanic || wo.mecanico_nome || '-'}
                      </div>
                    </div>
                    {wo.items && Array.isArray(wo.items) && wo.items.length > 0 ? (
                      <table className="w-full text-xs text-left text-gray-300 border border-gray-700 rounded mb-2">
                        <thead className="bg-gray-800 text-gray-400">
                          <tr>
                            <th className="px-2 py-1">Tipo</th>
                            <th className="px-2 py-1">Descrição</th>
                            <th className="px-2 py-1">Qtd</th>
                            <th className="px-2 py-1">Preço Unit.</th>
                            <th className="px-2 py-1">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wo.items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t border-gray-700">
                              <td className="px-2 py-1">{item.tipo_item || '-'}</td>
                              <td className="px-2 py-1">{item.descricao || '-'}</td>
                              <td className="px-2 py-1">{item.quantidade || '-'}</td>
                              <td className="px-2 py-1">{formatCurrency(item.preco_unitario)}</td>
                              <td className="px-2 py-1">{formatCurrency(item.valor_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-500">Nenhum item nesta OT.</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
  
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleHistoryModal;
