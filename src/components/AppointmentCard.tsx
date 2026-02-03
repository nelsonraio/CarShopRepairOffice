import React from 'react';

interface Appointment {
  id: string;
  title: string;
  client: string;
  plate: string;
  date: string;
  mechanic: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja apagar este agendamento?')) {
      onDelete?.(appointment);
    }
  };

  return (
    <div className="p-6 flex items-center justify-between">
      <div>
        <h4 className="text-base font-semibold text-gray-200">{appointment.title}</h4>
        <p className="text-sm text-gray-400">
          Cliente: {appointment.client} | Matrícula: {appointment.plate}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-200">{appointment.date}</p>
          <p className="text-sm text-gray-400">Mecânico: {appointment.mechanic}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(appointment)}
              className="p-2 text-gray-400 hover:text-brand-yellow transition-colors"
              title="Editar agendamento"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Apagar agendamento"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
