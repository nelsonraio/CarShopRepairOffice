import React from 'react';

interface Appointment {
  time: string;
  car: string;
  plate: string;
  client: string;
}

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number | null;
  appointments: Appointment[];
  onEditAppointment?: (appointment: Appointment, index: number) => void;
  onDeleteAppointment?: (index: number) => void;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ isOpen, onClose, day, appointments, onEditAppointment, onDeleteAppointment }) => {
  if (!isOpen || !day) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h3 className="text-xl font-bold text-gray-100">Agendamentos do Dia <span className="text-brand-yellow">{day}</span></h3>
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

        <div className="overflow-y-auto max-h-[50vh] pr-2">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Veículo</th>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {appointments.map((appointment, index) => (
                <tr key={index} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 font-mono text-brand-yellow">{appointment.time}</td>
                  <td className="px-4 py-3 text-gray-100 font-bold">{appointment.car}</td>
                  <td className="px-4 py-3 font-mono">{appointment.plate}</td>
                  <td className="px-4 py-3">{appointment.client}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEditAppointment?.(appointment, index)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar agendamento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja apagar este agendamento?')) {
                            onDeleteAppointment?.(index);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Apagar agendamento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DayDetailsModal;
