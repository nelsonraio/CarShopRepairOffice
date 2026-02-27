import React from 'react';

interface AppointmentDetailsModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentDetailsModal({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Dados do Agendamento</h3>
        <div className="space-y-2 text-gray-200">
          {Object.entries(appointment)
            .filter(([key]) => key.toUpperCase() !== 'CLIENTPHONE' && key.toUpperCase() !== 'CLIENTEMAIL')
            .map(([key, value]) => {
              const labels: { [key: string]: string } = {
                id: 'ID',
                clientId: 'ID do Cliente',
                client: 'Cliente',
                clientName: 'Cliente',
                marca: 'Marca',
                make: 'Marca',
                modelo: 'Modelo',
                model: 'Modelo',
                ano: 'Ano',
                year: 'Ano',
                matricula: 'Matrícula',
                licensePlate: 'Matrícula',
                title: 'Título',
                date: 'Data',
                time: 'Hora',
                mechanic: 'Mecânico',
                mecanico_nome: 'Mecânico',
                tipoServico: 'Tipo de Serviço',
                descricao: 'Descrição',
                description: 'Descrição',
                contacto_nome: 'Nome de Contacto',
                contacto_telefone: 'Telefone de Contacto',
                contacto_email: 'Email de Contacto',
                notas: 'Notas',
                openDate: 'Data de Abertura',
                closeDate: 'Data de Encerramento',
                priority: 'Prioridade',
                problem: 'Itens da OT',
                plate: 'Matrícula',
                vehicle: 'Veículo',
                items: 'Itens',
                status: 'Estado',
                // Adicione mais traduções conforme necessário
              };
              const label = labels[key] || key.replace(/_/g, ' ');
              return (
                <div className="text-gray-100" key={key}>
                  <span className="font-semibold">{label}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
                </div>
              );
            })}
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
