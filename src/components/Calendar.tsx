import React, { useState } from 'react';

interface CalendarProps {
  onDayClick: (day: number, appointments: any[]) => void;
  onAppointmentClick?: (appointment: any, day: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDayClick, onAppointmentClick }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'today'>('month');

  // Sample appointments data
  const appointmentsData: { [key: number]: any[] } = {
    4: [{ time: '14:00', car: 'BMW X5', plate: '12-AB-34', client: 'João Silva' }],
    6: [{ time: '09:00', car: 'Audi A4', plate: '22-CC-44', client: 'Ana Costa' }],
    13: [{ time: '11:30', car: 'Peugeot 308', plate: '55-DD-66', client: 'Pedro Martins' }],
    21: [{ time: '10:00', car: 'Ferrari SF90', plate: '99-ZZ-00', client: 'Marco Polo' }],
    27: [{ time: '16:15', car: 'Mercedes C-Class', plate: '11-AA-22', client: 'Maria Joana' }]
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const calendarDays = [
    28, 29, 30, 31, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 1
  ];

  const getDayClass = (day: number) => {
    if (day <= 4 || day >= 28) return 'text-gray-500'; // Previous/next month
    if (appointmentsData[day]) {
      if (day === 21) return 'mx-auto flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow text-gray-900 font-bold cursor-pointer hover:bg-brand-yellow-dark transition-colors';
      return 'mx-auto flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-yellow text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors';
    }
    return 'text-center py-2 text-gray-200';
  };

  const handleDayClick = (day: number) => {
    if (appointmentsData[day]) {
      onDayClick(day, appointmentsData[day]);
    }
  };

  const renderTodayView = () => {
    const today = new Date().getDate();
    const todayAppointments = appointmentsData[today] || [];

    return (
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Agendamentos de Hoje</h4>
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-none border border-gray-600 hover:border-brand-yellow transition-colors cursor-pointer" onClick={() => onAppointmentClick ? onAppointmentClick(appointment, today) : onDayClick(today, todayAppointments)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-100">{appointment.time} - {appointment.car}</p>
                    <p className="text-sm text-gray-400">{appointment.plate} - {appointment.client}</p>
                  </div>
                  <div className="text-brand-yellow text-sm">
                    Clique para editar
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Nenhum agendamento para hoje.</p>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const startOfWeek = currentDay - currentDate.getDay(); // Start from Sunday

    const weekDays: number[] = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek + i;
      if (day > 0 && day <= 31) { // Assuming max 31 days
        weekDays.push(day);
      }
    }

    return (
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Vista Semanal</h4>
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((dayName, index) => {
            const dayNumber = weekDays[index];
            const dayAppointments = appointmentsData[dayNumber] || [];

            return (
              <div key={dayName} className="bg-gray-800 p-3 rounded-none border border-gray-600">
                <div className="text-center mb-2">
                  <div className="font-semibold text-gray-100">{dayName}</div>
                  <div className="text-sm text-gray-400">{dayNumber}</div>
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment, idx) => (
                    <div key={idx} className="text-xs bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => onAppointmentClick && onAppointmentClick(appointment, dayNumber)}>
                      <div className="font-medium text-gray-200">{appointment.time}</div>
                      <div className="text-gray-400 truncate">{appointment.car}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayAppointments.length - 2} mais</div>
                  )}
                </div>
                {dayAppointments.length > 0 && (
                  <button
                    onClick={() => handleDayClick(dayNumber)}
                    className="w-full mt-2 text-xs text-brand-yellow hover:text-brand-yellow-light transition-colors"
                  >
                    Ver Todos
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-4">
        {/* Days of the week */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-400">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={getDayClass(day)}
            onClick={() => handleDayClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-none shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">Calendário de Agendamentos</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 text-sm font-medium rounded-none transition-colors ${
                viewMode === 'today'
                  ? 'text-gray-900 bg-brand-yellow border border-brand-yellow hover:bg-brand-yellow-dark'
                  : 'text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium rounded-none transition-colors ${
                viewMode === 'week'
                  ? 'text-gray-900 bg-brand-yellow border border-brand-yellow hover:bg-brand-yellow-dark'
                  : 'text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium rounded-none transition-colors ${
                viewMode === 'month'
                  ? 'text-gray-900 bg-brand-yellow border border-brand-yellow hover:bg-brand-yellow-dark'
                  : 'text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'today' && renderTodayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </div>
  );
};

export default Calendar;
