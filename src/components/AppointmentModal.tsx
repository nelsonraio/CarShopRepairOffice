import React, { useState, useEffect } from 'react';

interface Appointment {
  id?: number;
  title?: string;
  client?: string;
  plate?: string;
  date?: string;
  mechanic?: string;
  tipoServico?: string;
  notas?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointment }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    veiculo: '',
    data: '',
    hora: '',
    tipoServico: 'Revisão Geral',
    mecanico: '',
    notas: ''
  });

  useEffect(() => {
    if (appointment) {
      // Pre-fill form with appointment data
      setFormData({
        cliente: appointment.client || '',
        veiculo: appointment.plate || '',
        data: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
        hora: appointment.date ? new Date(appointment.date).toTimeString().slice(0, 5) : '',
        tipoServico: appointment.tipoServico || 'Revisão Geral',
        mecanico: appointment.mechanic || '',
        notas: appointment.notas || ''
      });
    } else {
      // Reset form for new appointment
      setFormData({
        cliente: '',
        veiculo: '',
        data: '',
        hora: '',
        tipoServico: 'Revisão Geral',
        mecanico: '',
        notas: ''
      });
    }
  }, [appointment, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('New appointment:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-lg p-6 shadow-2xl relative">
        <h3 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-2">
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
              placeholder="Pesquisar cliente..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Veículo</label>
            <input
              type="text"
              name="veiculo"
              value={formData.veiculo}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
              placeholder="Matrícula ou Modelo"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Hora</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Serviço</label>
            <select
              name="tipoServico"
              value={formData.tipoServico}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
            >
              <option>Revisão Geral</option>
              <option>Mudança de Óleo</option>
              <option>Travões</option>
              <option>Diagnóstico</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Mecânico Preferencial</label>
            <select
              name="mecanico"
              value={formData.mecanico}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
            >
              <option value="">Qualquer</option>
              <option>Carlos P.</option>
              <option>Rui Alves</option>
              <option>Joaquim F.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none"
            >
              {appointment ? 'Atualizar' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
