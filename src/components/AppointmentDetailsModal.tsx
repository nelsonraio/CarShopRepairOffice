import React from 'react';

interface AppointmentDetailsModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentDetailsModal({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) {
  if (!isOpen || !appointment) return null;

  // Info principal para card
  const mainInfo = {
    Hora: appointment.time || appointment.hora || appointment.date || '',
    Veículo: appointment.car || appointment.vehicle || appointment.modelo || appointment.model || '',
    Matrícula: appointment.plate || appointment.matricula || appointment.licensePlate || '',
    Cliente: appointment.client || appointment.clientName || appointment.cliente_nome || '',
    Descrição: appointment.descricao || appointment.description || '',
    Mecânico: appointment.mechanic || appointment.mecanico_nome || '',
    Prioridade: appointment.priority || '',
    Estado: appointment.status || '',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
        {/* Card para todos os tamanhos (forçado para teste) */}
        <div className="flex flex-col gap-2">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-brand-yellow text-lg">{mainInfo.Hora}</span>
              <span className="bg-blue-900 text-blue-200 px-2 py-1 text-xs font-bold rounded">{mainInfo.Estado}</span>
            </div>
            <div className="text-gray-100 font-bold text-base">{mainInfo.Veículo}</div>
            <div className="font-mono text-gray-300 text-xs">Matrícula: {mainInfo.Matrícula}</div>
            <div className="text-gray-200 text-sm">Cliente: {mainInfo.Cliente}</div>
            {mainInfo.Descrição && <div className="text-xs text-gray-400">{mainInfo.Descrição}</div>}
            {mainInfo.Mecânico && <div className="text-xs text-gray-400">Mecânico: {mainInfo.Mecânico}</div>}
            {mainInfo.Prioridade && <div className="text-xs text-gray-400">Prioridade: {mainInfo.Prioridade}</div>}
          </div>
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
  );
}
