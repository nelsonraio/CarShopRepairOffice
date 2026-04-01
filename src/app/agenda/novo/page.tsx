'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';

interface Brand {
  id: string;
  nome: string;
}

interface Model {
  id: string;
  nome: string;
}

interface Mechanic {
  id: string;
  nome: string;
}

interface Service {
  id: string;
  nome: string;
  descricao: string;
}

const NewAppointmentPage = () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    matricula: '',
    data: todayStr,
    hora: '',
    tipoServico: 'Revisão Geral',
    mecanico: '',
    notas: '',
    contacto_nome: '',
    contacto_telefone: '',
    contacto_email: ''
  });
  const [vehicleFound, setVehicleFound] = useState<boolean>(true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<Brand[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [modelSuggestions, setModelSuggestions] = useState<Model[]>([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [showServiceSearchResults, setShowServiceSearchResults] = useState(false);
  const [serviceSearchResults, setServiceSearchResults] = useState<Service[]>([]);

  useEffect(() => {
    fetchMechanics();
    fetchServices();
    fetchBrands();
  }, []);

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

  const fetchModels = async (brandId: string) => {
    try {
      const response = await fetch(`/api/modelos?marca_id=${brandId}`);
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

  const searchModels = async (query: string) => {
    try {
      const selectedBrand = brands.find(brand => brand.nome === formData.marca);
      const brandId = selectedBrand ? selectedBrand.id : '';
      const response = await fetch(`/api/modelos/search?q=${encodeURIComponent(query)}&marca_id=${brandId}`);
      if (response.ok) {
        const data = await response.json();
        setModelSuggestions(data);
        setShowModelSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search models:', error);
    }
  };

  const searchVehicleByLicensePlate = async (matricula: string) => {
    try {
      const response = await fetch(`/api/veiculos/search?matricula=${encodeURIComponent(matricula)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.found) {
          setVehicleFound(true);
          setFormData(prev => ({
            ...prev,
            marca: data.vehicle.marca,
            modelo: data.vehicle.modelo,
            ano: data.vehicle.ano ? data.vehicle.ano.toString() : '',
            // Preserve contact fields if already filled
            contacto_nome: prev.contacto_nome || '',
            contacto_telefone: prev.contacto_telefone || '',
            contacto_email: prev.contacto_email || ''
          }));
        } else {
          setVehicleFound(false);
        }
      }
    } catch (error) {
      console.error('Failed to search vehicle:', error);
      setVehicleFound(false);
    }
  };

  const searchServices = async (query: string) => {
    try {
      const response = await fetch(`/api/servicos/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setServiceSearchResults(data);
        setShowServiceSearchResults(true);
      }
    } catch (error) {
      console.error('Failed to search services:', error);
      setServiceSearchResults([]);
    }
  };

  const addServiceDescription = (service: Service) => {
    const serviceText = `- ${service.nome}`;
    setFormData(prev => ({
      ...prev,
      notas: prev.notas ? prev.notas + '\n' + serviceText : serviceText
    }));
    setServiceSearchTerm('');
    setShowServiceSearchResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle brand search
    if (name === 'marca' && value && value.length >= 2) {
      searchBrands(value);
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

    // Handle service selection and description append
    if (name === 'tipoServico') {
      const selectedService = services.find(service => service.nome === value);
      if (selectedService && selectedService.descricao) {
        setFormData(prev => ({
          ...prev,
          notas: prev.notas ? prev.notas + '\n\n' + selectedService.descricao : selectedService.descricao
        }));
      }
    }

    // Handle license plate formatting and auto-fill
    if (name === 'matricula') {
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
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

      // Auto-fill if license plate is complete (XX-XX-XX format)
      if (formatted.length >= 8 && formatted.includes('-')) {
        searchVehicleByLicensePlate(formatted);
      }
      return;
    }
  };

  const selectBrand = (brand: Brand) => {
    setFormData(prev => ({
      ...prev,
      marca: brand.nome,
      modelo: ''
    }));
    setBrandSuggestions([]);
    setShowBrandSuggestions(false);
    fetchModels(brand.id).then(models => {
      if (models && models.length > 0) {
        setModelSuggestions(models);
        setShowModelSuggestions(true);
      }
    });
  };

  const selectModel = (model: Model) => {
    setFormData(prev => ({
      ...prev,
      modelo: model.nome
    }));
    setModelSuggestions([]);
    setShowModelSuggestions(false);
  };


  // Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Debug: Verificar valor enviado no campo data
    console.log('Data enviada para API:', formData.data);

    // Validação inline
    const errors: { [key: string]: string } = {};
    if (!formData.contacto_nome.trim()) {
      errors.contacto_nome = 'O nome de contacto é obrigatório.';
    }
    if (formData.tipoServico === 'Outro' && !formData.notas.trim()) {
      errors.notas = 'A descrição é obrigatória para o tipo de serviço "Outro".';
    }
    if (!vehicleFound && !formData.contacto_telefone.trim()) {
      errors.contacto_telefone = 'O telefone é obrigatório quando o veículo não está registado.';
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });


      if (response.ok) {
        // Redireciona após sucesso
        window.location.href = '/agenda';
      } else {
        setValidationErrors({ geral: 'Erro ao criar agendamento' });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setValidationErrors({ geral: 'Erro ao criar agendamento' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="agenda" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Mensagem de erro geral */}
        {validationErrors.geral && (
          <div className="mb-4 text-center text-red-500 font-semibold">{validationErrors.geral}</div>
        )}
        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <header className="bg-gray-900 rounded-t-none p-6 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Novo Agendamento</h1>
              </div>
              <div className="flex space-x-3">
                <Link href="/agenda" className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Voltar
                </Link>
              </div>
            </div>
          </header>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Matrícula *</label>
                  <input
                    type="text"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                    placeholder="XX-XX-XX"
                    required
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data *</label>
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Hora *</label>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar serviço para adicionar descrição..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition placeholder-gray-500"
                    value={serviceSearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setServiceSearchTerm(value);
                      if (value.length >= 2) {
                        searchServices(value);
                        setShowServiceSearchResults(true);
                      } else {
                        setServiceSearchResults([]);
                        setShowServiceSearchResults(false);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowServiceSearchResults(false), 200)}
                  />
                  {showServiceSearchResults && (
                    <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 shadow-lg max-h-60 overflow-y-auto">
                      {serviceSearchResults.map(service => (
                        <div
                          key={service.id}
                          className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-0"
                          onClick={() => addServiceDescription(service)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-200">{service.nome}</div>
                              <div className="text-xs text-gray-400">{service.id}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

              {/* Contacto Section */}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Informações de Contacto</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nome de Contacto *</label>
                    <input
                      type="text"
                      name="contacto_nome"
                      value={formData.contacto_nome}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${validationErrors.contacto_nome ? 'border-red-500' : 'border-gray-600'} text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600`}
                      placeholder="Nome do contacto"
                      required
                    />
                    {validationErrors.contacto_nome && (
                      <p className="text-xs text-red-400 mt-1">{validationErrors.contacto_nome}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Telefone {!vehicleFound && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      name="contacto_telefone"
                      value={formData.contacto_telefone}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-900 border ${(validationErrors.contacto_telefone) ? 'border-red-500' : 'border-gray-600'} text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600`}
                      placeholder="Telefone de contacto"
                      required={false}
                    />
                    {!vehicleFound && (
                      <p className="text-xs text-orange-400 mt-1">⚠ Obrigatório - Veículo não registado</p>
                    )}
                    {validationErrors.contacto_telefone && (
                      <p className="text-xs text-red-400 mt-1">{validationErrors.contacto_telefone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="contacto_email"
                      value={formData.contacto_email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="Email de contacto"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Descrição {formData.tipoServico === 'Outro' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full bg-gray-900 border ${(validationErrors.notas) ? 'border-red-500' : 'border-gray-600'} text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600`}
                  required={formData.tipoServico === 'Outro'}
                />
                {validationErrors.notas && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.notas}</p>
                )}
              </div>
                {/* Botões apenas no final do formulário */}
              <div className="flex justify-between items-center mb-4">
                <Link href="/agenda" className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Voltar
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewAppointmentPage;
