import React, { useState, useEffect } from 'react';

interface Agendamento {
  id?: string;

  clientId?: string;
  client?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  matricula?: string;
  title?: string;
  date?: string;
  time?: string;
  mechanic?: string;
  tipoServico?: string;
  status?: string;
  notas?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Agendamento | null;
  onSave?: (data: any) => Promise<void>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointment, onSave }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    marca: '',
    modelo: '',
    ano: '',
    matricula: '',
    data: '',
    hora: '',
    tipoServico: 'Revisão Geral',
    mecanico: '',
    notas: ''
  });
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [serviceSuggestions, setServiceSuggestions] = useState<any[]>([]);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<any[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [modelSuggestions, setModelSuggestions] = useState<any[]>([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [mechanicSuggestions, setMechanicSuggestions] = useState<any[]>([]);
  const [showMechanicSuggestions, setShowMechanicSuggestions] = useState(false);

  const fetchMechanics = async () => {
    try {
      const response = await fetch('/api/mecanicos');
      if (response.ok) {
        const data = await response.json();
        setMechanics(data);
      }
    } catch (error) {
      console.error('Failed to fetch mechanics:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/servicos');
      if (response.ok) {
        const data = await response.json();
        // Add "Outro" option to the services list
        const servicesWithOutro = [...data, { id: 'outro', nome: 'Outro' }];
        setServices(servicesWithOutro);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/marcas');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchModels = async (marcaId: string) => {
    try {
      const response = await fetch(`/api/modelos?marca_id=${marcaId}`);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
    return [];
  };

  useEffect(() => {
    if (isOpen) {
      fetchMechanics();
      fetchServices();
      fetchBrands();
    }
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      // Pre-fill form with appointment data
      let dateStrValue = '';
      let timeStrValue = '';

      if (appointment.date) {
        // Parse date from DD/MM/YYYY format
        const dateParts = appointment.date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0]!, 10);
          const month = parseInt(dateParts[1]!, 10);
          const year = parseInt(dateParts[2]!, 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            dateStrValue = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          }
        }
      }

      if (appointment.time) {
        timeStrValue = appointment.time;
      }

      setFormData({
        cliente: appointment.client ?? '',
        marca: appointment.marca ?? '',
        modelo: appointment.modelo ?? '',
        ano: (appointment.ano ?? '').toString(),
        matricula: appointment.matricula ?? '',
        data: dateStrValue,
        hora: timeStrValue,
        tipoServico: appointment.tipoServico ?? 'Revisão Geral',
        mecanico: appointment.mechanic ?? '',
        notas: appointment.notas ?? ''
      });
    } else {
      // Reset form for new appointment
      setFormData({
        cliente: '',
        marca: '',
        modelo: '',
        ano: '',
        matricula: '',
        data: '',
        hora: '',
        tipoServico: 'Revisão Geral',
        mecanico: '',
        notas: ''
      });
    }
    // Reset suggestions when modal opens/closes
    setClientSuggestions([]);
    setShowSuggestions(false);
  }, [appointment, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle client search
    if (name === 'cliente' && value && value.length >= 2) {
      searchClients(value);
    } else if (name === 'cliente' && (!value || value.length < 2)) {
      setClientSuggestions([]);
      setShowSuggestions(false);
    }

    // Handle brand search
    if (name === 'marca' && value && value.length >= 2) {
      searchBrands(value);
      // Auto-fill model if brand matches exactly
      const matchingBrand = brands.find(brand => brand.nome.toLowerCase() === value.toLowerCase());
      if (matchingBrand) {
        fetchModels(matchingBrand.id.toString()).then(models => {
          if (models && models.length > 0) {
            setModelSuggestions(models);
            setShowModelSuggestions(true);
            setFormData(prev => ({
              ...prev,
              modelo: models[0].nome
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              modelo: ''
            }));
          }
        });
      } else {
        setFormData(prev => ({
          ...prev,
          modelo: ''
        }));
      }
    } else if (name === 'marca' && (!value || value.length < 2)) {
      setBrandSuggestions([]);
      setShowBrandSuggestions(false);
      setModelSuggestions([]);
      setShowModelSuggestions(false);
      setFormData(prev => ({
        ...prev,
        modelo: ''
      }));
    }

    // Handle model search
    if (name === 'modelo' && value && value.length >= 2) {
      searchModels(value);
    } else if (name === 'modelo' && (!value || value.length < 2)) {
      setModelSuggestions([]);
      setShowModelSuggestions(false);
    }

    // Handle license plate formatting
    if (name === 'matricula') {
      // Remove all non-alphanumeric characters and convert to uppercase
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      // Format as XX-XX-XX
      let formatted = cleaned;
      if (cleaned.length > 2 && cleaned.length <= 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
      } else if (cleaned.length > 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6);
      }
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }

  };

  const searchClients = async (query: string) => {
    try {
      const response = await fetch(`/api/clientes/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setClientSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search clients:', error);
    }
  };

  const selectClient = (client: any) => {
    setFormData(prev => ({
      ...prev,
      cliente: client.nome
    }));
    setClientSuggestions([]);
    setShowSuggestions(false);
  };

  const searchServices = async (query: string) => {
    try {
      const response = await fetch(`/api/servicos/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Add "Outro" option to the services list
        const servicesWithOutro = [...data, { id: 'outro', nome: 'Outro' }];
        setServiceSuggestions(servicesWithOutro);
        setShowServiceSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search services:', error);
    }
  };

  const selectService = (service: any) => {
    setFormData(prev => ({
      ...prev,
      tipoServico: service.nome
    }));
    setServiceSuggestions([]);
    setShowServiceSuggestions(false);
  };

  const searchBrands = async (query: string) => {
    try {
      const response = await fetch(`/api/marcas/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setBrandSuggestions(data);
        setShowBrandSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search brands:', error);
    }
  };

  const selectBrand = (brand: any) => {
    setFormData(prev => ({
      ...prev,
      marca: brand.nome,
      modelo: '' // Clear model when brand changes
    }));
    setBrandSuggestions([]);
    setShowBrandSuggestions(false);
    // Fetch models for selected brand and auto-fill first model
    fetchModels(brand.id).then(models => {
      if (models && models.length > 0) {
        setModelSuggestions(models);
        setShowModelSuggestions(true);
        // Auto-fill with first model
        setFormData(prev => ({
          ...prev,
          modelo: models[0].nome
        }));
      }
    });
  };

  const searchModels = async (query: string) => {
    try {
      const selectedBrand = brands.find(brand => brand.nome === formData.marca);
      const marcaId = selectedBrand ? selectedBrand.id : '';
      const response = await fetch(`/api/modelos/search?q=${encodeURIComponent(query)}&marca_id=${marcaId}`);
      if (response.ok) {
        const data = await response.json();
        setModelSuggestions(data);
        setShowModelSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search models:', error);
    }
  };

  const selectModel = (model: any) => {
    setFormData(prev => ({
      ...prev,
      modelo: model.nome
    }));
    setModelSuggestions([]);
    setShowModelSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that notes are required when "Outro" is selected
    if (formData.tipoServico === 'Outro' && !formData.notas.trim()) {
      alert('As notas são obrigatórias quando o tipo de serviço é "Outro".');
      return;
    }

    if (onSave) {
      try {
        await onSave(formData);
      } catch (err) {
        console.error('Failed to save appointment', err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">

        <h3 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-2">
          {appointment ? `Editar Agendamento - ${appointment.client} - ${appointment.date}` : 'Novo Agendamento'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="relative">
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
            {showSuggestions && clientSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 mt-1 max-h-40 overflow-y-auto">
                {clientSuggestions.map((client) => (
                  <div
                    key={client.id}
                    className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white"
                    onClick={() => selectClient(client)}
                  >
                    <div className="font-medium">{client.nome}</div>
                    <div className="text-sm text-gray-400">
                      {client.telefone} {client.email && `• ${client.email}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                placeholder="Pesquisar marca..."
              />
              {showBrandSuggestions && brandSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 mt-1 max-h-40 overflow-y-auto">
                  {brandSuggestions.map((brand) => (
                    <div
                      key={brand.id}
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white"
                      onClick={() => selectBrand(brand)}
                    >
                      <div className="font-medium">{brand.nome}</div>
                      <div className="text-sm text-gray-400">{brand.pais_origem}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">Modelo</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                disabled={!formData.marca}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={formData.marca ? "Pesquisar modelo..." : "Selecione uma marca primeiro"}
              />
              {showModelSuggestions && modelSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 mt-1 max-h-40 overflow-y-auto">
                  {modelSuggestions.map((model) => (
                    <div
                      key={model.id}
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white"
                      onClick={() => selectModel(model)}
                    >
                      <div className="font-medium">{model.nome}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Ano</label>
              <input
                type="number"
                name="ano"
                value={formData.ano}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                placeholder="Ano"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Matrícula</label>
              <input
                type="text"
                name="matricula"
                value={formData.matricula}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                placeholder="Matrícula"
              />
            </div>


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
              {services.map((service) => (
                <option key={service.id} value={service.nome}>
                  {service.nome}
                </option>
              ))}
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
              {mechanics.map((mechanic) => (
                <option key={mechanic.id} value={mechanic.nome}>
                  {mechanic.nome}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Notas {formData.tipoServico === 'Outro' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              rows={2}
              required={formData.tipoServico === 'Outro'}
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
              className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
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
