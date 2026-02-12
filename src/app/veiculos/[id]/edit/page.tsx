'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../../components/Sidebar';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  nif: string;
  endereco: string;
  perfil: string;
}

interface Brand {
  id: string;
  nome: string;
}

interface Model {
  id: string;
  nome: string;
}

interface ClientProfile {
  id: string;
  nome: string;
  descricao: string | null;
  desconto: number;
  ativo: boolean;
}


const EditVehiclePage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientSearch: '',
    clientPhone: '',
    clientEmail: '',
    clientNif: '',
    clientAddress: '',
    clientProfile: 'Normal',
    make: '',
    model: '',
    licensePlate: '',
    year: '',
    vin: ''
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);

  const [models, setModels] = useState<Model[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<Brand[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [modelSuggestions, setModelSuggestions] = useState<Model[]>([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [perfis, setPerfis] = useState<ClientProfile[]>([]);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [licensePlateExists, setLicensePlateExists] = useState(false);


  useEffect(() => {
    document.title = 'Editar Veículo';
    fetchBrands();
    fetchPerfis();
    fetchVehicle();
  }, []);


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

  const fetchPerfis = async () => {
    try {
      const response = await fetch('/api/perfis-clientes');
      if (response.ok) {
        const data = await response.json();
        setPerfis(data);
      }
    } catch (error) {
      console.error('Failed to fetch perfis:', error);
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

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/veiculos/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Set selected client from the vehicle data
        setSelectedClient({
          id: data.clientId,
          nome: data.clientName,
          telefone: data.clientPhone,
          email: data.clientEmail || '',
          nif: data.clientNif || '',
          endereco: data.clientAddress || '',
          perfil: data.clientProfile || 'Normal'
        });

        setFormData({
          clientSearch: data.clientName || '',
          clientPhone: data.clientPhone || '',
          clientEmail: data.clientEmail || '',
          clientNif: data.clientNif || '',
          clientAddress: data.clientAddress || '',
          clientProfile: data.clientProfile || 'Normal',
          make: data.make || '',
          model: data.model || '',
          licensePlate: data.licensePlate || '',
          year: data.year?.toString() || '',
          vin: data.vin || ''
        });

        // Fetch models for the selected brand
        if (data.make) {
          const selectedBrand = brands.find(b => b.nome === data.make);
          if (selectedBrand) {
            fetchModels(selectedBrand.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchClients = async (query: string) => {
    try {
      const response = await fetch(`/api/clientes/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setClientSuggestions(data);
        setShowClientSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to search clients:', error);
    }
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
      const selectedBrand = brands.find(brand => brand.nome === formData.make);
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

  const checkLicensePlateExists = async (matricula: string) => {
    try {
      const response = await fetch(`/api/veiculos/search?matricula=${encodeURIComponent(matricula)}`);
      if (response.ok) {
        const data = await response.json();
        setLicensePlateExists(data.found);
      } else {
        setLicensePlateExists(false);
      }
    } catch (error) {
      console.error('Failed to check license plate existence:', error);
      setLicensePlateExists(false);
    }
  };

  const searchAppointmentData = async (matricula: string) => {
    try {
      const response = await fetch(`/api/agendamentos/search?matricula=${encodeURIComponent(matricula)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.found && !licensePlateExists) {
          setAppointmentData(data);
          // Auto-fill vehicle data
          setFormData(prev => ({
            ...prev,
            make: data.marca || prev.make,
            model: data.modelo || prev.model,
            year: data.ano || prev.year
          }));

          // Auto-fill client data if available
          if (data.cliente) {
            setFormData(prev => ({
              ...prev,
              clientSearch: data.cliente.nome,
              clientPhone: data.cliente.telefone,
              clientEmail: data.cliente.email || '',
              clientNif: data.cliente.nif || '',
              clientAddress: data.cliente.endereco || '',
              clientProfile: data.cliente.perfil || 'Normal'
            }));
            setSelectedClient({
              id: data.cliente.id,
              nome: data.cliente.nome,
              telefone: data.cliente.telefone,
              email: data.cliente.email || '',
              nif: data.cliente.nif || '',
              endereco: data.cliente.endereco || '',
              perfil: data.cliente.perfil || 'Normal'
            });
          }
        } else {
          setAppointmentData(null);
        }
      }
    } catch (error) {
      console.error('Failed to search appointment data:', error);
      setAppointmentData(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle client search
    if (name === 'clientSearch' && value && value.length >= 2) {
      searchClients(value);
    } else if (name === 'clientSearch' && (!value || value.length < 2)) {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
    }

    // Handle brand search
    if (name === 'make' && value && value.length >= 2) {
      searchBrands(value);
    } else if (name === 'make' && (!value || value.length < 2)) {
      setBrandSuggestions([]);
      setShowBrandSuggestions(false);
      setModelSuggestions([]);
      setShowModelSuggestions(false);
      setFormData(prev => ({
        ...prev,
        model: ''
      }));
    }

    // Handle model search
    if (name === 'model' && value && value.length >= 2) {
      searchModels(value);
    } else if (name === 'model' && (!value || value.length < 2)) {
      setModelSuggestions([]);
      setShowModelSuggestions(false);
    }

    // Handle license plate formatting
    if (name === 'licensePlate') {
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

      // Check if license plate exists in vehicles and search appointments
      if (formatted && formatted.length >= 6) { // Minimum length for a formatted plate
        checkLicensePlateExists(formatted).then(() => {
          searchAppointmentData(formatted);
        });
      } else {
        setLicensePlateExists(false);
        setAppointmentData(null);
      }
      return;
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setIsNewClient(false);
    setFormData(prev => ({
      ...prev,
      clientSearch: client.nome,
      clientPhone: client.telefone || '',
      clientEmail: client.email || '',
      clientNif: client.nif || '',
      clientAddress: client.endereco || '',
      clientProfile: client.perfil || 'Normal'
    }));
    setClientSuggestions([]);
    setShowClientSuggestions(false);
  };

  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      clientSearch: value,
      clientPhone: '',
      clientEmail: '',
      clientNif: '',
      clientAddress: '',
      clientProfile: 'Normal'
    }));
    setSelectedClient(null);
    setIsNewClient(true);
    
    if (value && value.length >= 2) {
      searchClients(value);
    } else {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
    }
  };



  const selectBrand = (brand: Brand) => {
    setFormData(prev => ({
      ...prev,
      make: brand.nome,
      model: ''
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
      model: model.nome
    }));
    setModelSuggestions([]);
    setShowModelSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/veiculos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Veículo atualizado com sucesso!');
        router.push('/veiculos');
      } else {
        alert('Erro ao atualizar veículo');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Erro ao atualizar veículo');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-800">
        <Sidebar activePage="veiculos" />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-400">Carregando...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="veiculos" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <header className="bg-gray-900 rounded-t-none p-6 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Editar Veículo</h1>
              </div>
              <div className="flex space-x-3">
                <Link href="/veiculos" className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Voltar
                </Link>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Guardar Alterações
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Vehicle Information */}
              <div className="border-b border-gray-600 pb-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-4">Dados do Veículo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Marca *</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="Pesquisar marca..."
                      required
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Modelo *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      disabled={!formData.make}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={formData.make ? "Pesquisar modelo..." : "Selecione uma marca primeiro"}
                      required
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Matrícula *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="XX-XX-XX"
                      required
                    />
                    {licensePlateExists && (
                      <p className="text-red-400 text-sm mt-1">Esta matrícula já existe na tabela de veículos.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ano</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="Ano"
                    />
                  </div>
                </div>
              </div>
              
              {/* Client Information */}
              <div className="border-b border-gray-600 pb-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-4">Dados do Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cliente *</label>
                    <input
                      type="text"
                      name="clientSearch"
                      value={formData.clientSearch}
                      onChange={handleClientSearchChange}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="Pesquisar cliente existente ou digite um novo..."
                      required
                    />

                    {showClientSuggestions && clientSuggestions.length > 0 && (
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
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Telefone {isNewClient && <span className="text-brand-yellow">*</span>}</label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      disabled={!isNewClient}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={isNewClient ? "Número de telefone" : "Selecione um cliente existente ou digite um novo"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      disabled={!isNewClient}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={isNewClient ? "endereço de email" : "Selecione um cliente existente ou digite um novo"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">NIF</label>
                    <input
                      type="text"
                      name="clientNif"
                      value={formData.clientNif}
                      onChange={handleInputChange}
                      disabled={!isNewClient}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={isNewClient ? "Número de Identificação Fiscal" : "Selecione um cliente existente ou digite um novo"}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Morada</label>
                    <textarea
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleInputChange}
                      disabled={!isNewClient}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={isNewClient ? "Morada completa" : "Selecione um cliente existente ou digite um novo"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Perfil de Cliente</label>
                    <select
                      name="clientProfile"
                      value={formData.clientProfile}
                      onChange={handleInputChange}
                      disabled={!isNewClient}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {perfis.map((perfil) => (
                        <option key={perfil.id} value={perfil.nome}>
                          {perfil.nome} {perfil.desconto > 0 && `(-${perfil.desconto}%)`}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const selectedPerfil = perfis.find(p => p.nome === formData.clientProfile);
                      return selectedPerfil && selectedPerfil.desconto && selectedPerfil.desconto > 0 ? (
                        <p className="text-xs text-brand-yellow mt-1">
                          Desconto de {selectedPerfil.desconto}% aplicado a este perfil
                        </p>
                      ) : <></>;
                    })()}
                  </div>
                </div>
              </div>

           

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Número do Chassis (VIN)</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Número do chassis"
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditVehiclePage;
