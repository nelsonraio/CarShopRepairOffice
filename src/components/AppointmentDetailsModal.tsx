import React from 'react';

interface AppointmentDetailsModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentDetailsModal({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-brand-yellow w-full max-w-lg p-8 rounded-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-brand-yellow hover:text-yellow-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-xl font-bold text-brand-yellow mb-6">Dados do Agendamento</h2>
        <div className="space-y-3">
          {Object.entries(appointment)
            .filter(([key]) => key.toUpperCase() !== 'CLIENTPHONE' && key.toUpperCase() !== 'CLIENTEMAIL')
            .map(([key, value]) => {
              // Map English keys to Portuguese labels
              const labels: { [key: string]: string } = {
                id: 'ID',
                clientId: 'ID do Cliente',
                client: 'Cliente',
                marca: 'Marca',
                modelo: 'Modelo',
                ano: 'Ano',
                matricula: 'Matrícula',
                title: 'Título',
                date: 'Data',
                time: 'Hora',
                mechanic: 'Mecânico',
                tipoServico: 'Tipo de Serviço',
                status: 'Estado',
                descricao: 'Descrição',
                contacto_nome: 'Nome de Contacto',
                contacto_telefone: 'Telefone de Contacto',
                contacto_email: 'Email de Contacto',
                notas: 'Notas'
              };
              const label = labels[key] || key.replace(/_/g, ' ');
              return (
                <div className="text-gray-100" key={key}>
                  <span className="font-semibold text-brand-yellow">{label}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
