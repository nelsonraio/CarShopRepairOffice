"use client";

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

interface VehicleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

const mockHistory: RepairHistory[] = [
  {
    id: "1",
    proc: "C2045",
    date: "28/10/2024",
    description: "Revisão Geral + Mudança de Óleo",
    km: 125000,
    cost: 250.00
  },
  {
    id: "2",
    proc: "C1980",
    date: "15/05/2024",
    description: "Substituição Pastilhas Travão (Frente)",
    km: 118000,
    cost: 120.50
  },
  {
    id: "3",
    proc: "TVDE055",
    date: "10/01/2024",
    description: "Bateria Nova",
    km: 112000,
    cost: 95.00
  }
];

export default function VehicleHistoryModal({ isOpen, onClose, vehicle }: VehicleHistoryModalProps) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-3xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-100">Histórico de Reparações</h3>
            <p className="text-sm text-brand-yellow font-mono mt-1">
              {vehicle.plate} - {vehicle.makeModel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900 sticky top-0">
              <tr>
                <th className="px-4 py-3">N. Proc.</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Km</th>
                <th className="px-4 py-3 text-right">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {mockHistory.map((repair) => (
                <tr key={repair.id}>
                  <td className="px-4 py-3 font-mono text-brand-yellow">{repair.proc}</td>
                  <td className="px-4 py-3">{repair.date}</td>
                  <td className="px-4 py-3 text-gray-200">{repair.description}</td>
                  <td className="px-4 py-3">{repair.km.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-200">
                    €{repair.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
