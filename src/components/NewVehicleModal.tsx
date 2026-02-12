"use client";

import { useState, useEffect, useRef } from "react";

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  vehicle?: any; // For editing mode
}

export default function NewVehicleModal({ isOpen, onClose, onSuccess, vehicle }: NewVehicleModalProps) {
  const [formData, setFormData] = useState({
    licensePlate: "",
    vin: "",
    make: "",
    model: "",
    year: "",
    color: "",
    clientProfile: "Normal",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientNif: "",
    clientAddress: "",
    serviceType: "",
    priority: "normal"
  });
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNewClient, setIsNewClient] = useState(true);
  const [clientFieldsEditable, setClientFieldsEditable] = useState(true);

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<any[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [modelSuggestions, setModelSuggestions] = useState<any[]>([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [clientProfiles, setClientProfiles] = useState<any[]>([]);

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

  const fetchClientProfiles = async () => {
    try {
      const response = await fetch('/api/perfis-clientes');
      if (response.ok) {
        const data = await response.json();
        setClientProfiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch client profiles:', error);
    }
  };

  const fetchClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clientes/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        return data.client; // Extract the client property from the response
      }
    } catch (error) {
      console.error('Failed to fetch client:', error);
    }
    return null;
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
      fetchBrands();
      fetchClientProfiles();
      if (vehicle) {
        // If there's a client associated, fetch full client data first
        if (vehicle.clientId) {
          fetchClient(vehicle.clientId.toString()).then(client => {
            if (client) {
              setSelectedClient({
                id: client.id,
                nome: client.nome,
                telefone: client.telefone,
                email: client.email,
                nif: client.nif,
                endereco: client.endereco,
                perfil: client.perfil
              });
              setIsNewClient(false);
              setClientFieldsEditable(false); // Make client fields readonly initially for existing clients
              // Populate form with vehicle and client data
              setFormData({
                licensePlate: vehicle.licensePlate || "",
                vin: vehicle.vin || "",
                make: vehicle.make || "",
                model: vehicle.model || "",
                year: vehicle.year || "",
                color: vehicle.color || "",
                clientProfile: client.perfil || "Normal",
                clientName: client.nome || "",
                clientPhone: client.telefone || "",
                clientEmail: client.email || "",
                clientNif: client.nif || "",
                clientAddress: client.endereco || "",
                serviceType: "",
                priority: "normal"
              });
            }
          });
        } else {
          // No client associated, just populate vehicle data
          setFormData({
            licensePlate: vehicle.licensePlate || "",
            vin: vehicle.vin || "",
            make: vehicle.make || "",
            model: vehicle.model || "",
            year: vehicle.year || "",
            color: vehicle.color || "",
            clientProfile: vehicle.clientProfile || "Normal",
            clientName: vehicle.clientName || "",
            clientPhone: vehicle.clientPhone || "",
            clientEmail: vehicle.clientEmail || "",
            clientNif: vehicle.clientNif || "",
            clientAddress: vehicle.clientAddress || "",
            serviceType: "",
            priority: "normal"
          });
          setIsNewClient(true);
          setSelectedClient(null);
          setClientFieldsEditable(true); // Allow editing for new clients
        }
      } else {
        // Reset form for new vehicle
        setFormData({
          licensePlate: "",
          vin: "",
          make: "",
          model: "",
          year: "",
          color: "",
          clientProfile: "Normal",
          clientName: "",
          clientPhone: "",
          clientEmail: "",
          clientNif: "",
          clientAddress: "",
          serviceType: "",
          priority: "normal"
        });
        setSelectedClient(null);
        setIsNewClient(true);
      }
    }
  }, [isOpen, vehicle]);

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

  const selectClient = (client: any) => {
    setSelectedClient(client);
    setIsNewClient(false);
    setClientFieldsEditable(true); // Allow editing selected client's information
    setFormData(prev => ({
      ...prev,
      clientName: client.nome,
      clientPhone: client.telefone,
      clientEmail: client.email || '',
      clientNif: client.nif || '',
      clientAddress: client.endereco || '',
      clientProfile: client.perfil || 'Normal'
    }));
    setClientSuggestions([]);
    setShowClientSuggestions(false);
  };

  const searchAppointmentData = async (licensePlate: string) => {
    try {
      const response = await fetch(`/api/agendamentos/search?matricula=${encodeURIComponent(licensePlate)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.found) {
          setFormData(prev => ({
            ...prev,
            make: data.marca || '',
            model: data.modelo || '',
            year: data.ano || '',
            serviceType: data.tipoServico || ''
          }));
        }
      }
    } catch (error) {
      console.error('Failed to search appointment data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle client search
    if (name === 'clientName') {
      // If we have a selected client and fields are not editable (existing client mode)
      // and user starts typing, make fields editable to allow editing the existing client
      if (selectedClient && !clientFieldsEditable) {
        setClientFieldsEditable(true);
        setIsNewClient(false); // Keep as existing client mode
        // Update only the name, keep other fields
        setFormData(prev => ({
          ...prev,
          clientName: value
        }));
        // Search for clients if value is long enough
        if (value && value.length >= 2) {
          searchClients(value);
        } else {
          setClientSuggestions([]);
          setShowClientSuggestions(false);
        }
        return; // Prevent further processing since we updated formData
      }

      // If no selected client or fields are already editable
      // Normal client search behavior
      if (value && value.length >= 2) {
        searchClients(value);
      } else {
        setClientSuggestions([]);
        setShowClientSuggestions(false);
      }

      // Handle empty value
      if (!value) {
        setIsNewClient(true);
        setSelectedClient(null);
        setClientFieldsEditable(true);
        setFormData(prev => ({
          ...prev,
          clientName: "",
          clientPhone: "",
          clientEmail: "",
          clientNif: "",
          clientAddress: "",
          clientProfile: "Normal"
        }));
        return; // Prevent further processing
      }
    }

    // Handle brand search
    if (name === 'make') {
      if (value && value.length >= 2) {
        searchBrands(value);
        const matchingBrand = brands.find(brand => brand.nome.toLowerCase() === value.toLowerCase());
        if (matchingBrand) {
          fetchModels(matchingBrand.id.toString()).then(models => {
            if (models && models.length > 0) {
              setModelSuggestions(models);
              setShowModelSuggestions(true);
              setFormData(prev => ({
                ...prev,
                model: models[0].nome
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                model: ''
              }));
            }
          });
        } else {
          setFormData(prev => ({
            ...prev,
            model: ''
          }));
        }
      } else {
        setBrandSuggestions([]);
        setShowBrandSuggestions(false);
        setModelSuggestions([]);
        setShowModelSuggestions(false);
        setFormData(prev => ({
          ...prev,
          model: ''
        }));
      }
    }

    // Handle model search
    if (name === 'model') {
      if (value && value.length >= 2) {
        searchModels(value);
      } else {
        setModelSuggestions([]);
        setShowModelSuggestions(false);
      }
    }

    // Handle license plate formatting and auto-fill from appointments
    if (name === 'licensePlate') {
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

      // Auto-fill from appointments if license plate is complete (6+ characters)
      if (formatted.length >= 6) {
        searchAppointmentData(formatted);
      }
      return;
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

  const selectBrand = (brand: any) => {
    setFormData(prev => ({
      ...prev,
      make: brand.nome,
      model: '' // Clear model when brand changes
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
          model: models[0].nome
        }));
      }
    });
  };

  const searchModels = async (query: string) => {
    try {
      const selectedBrand = brands.find(brand => brand.nome === formData.make);
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
      model: model.nome
    }));
    setModelSuggestions([]);
    setShowModelSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        clientId: selectedClient ? selectedClient.id : null,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        clientNif: formData.clientNif,
        clientAddress: formData.clientAddress,
        clientProfile: formData.clientProfile,
        make: formData.make,
        model: formData.model,
        licensePlate: formData.licensePlate,
        vin: formData.vin,
        year: formData.year
      };

      const method = vehicle ? 'PUT' : 'POST';
      const url = vehicle ? `/api/veiculos/${vehicle.id}` : '/api/veiculos';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(vehicle ? "Veículo atualizado com sucesso!" : "Veículo registado com sucesso!");
        onClose();
        if (onSuccess) onSuccess(); // Call onSuccess callback to refresh the list
        setFormData({
          licensePlate: "",
          vin: "",
          make: "",
          model: "",
          year: "",
          color: "",
          clientProfile: "Normal",
          clientName: "",
          clientPhone: "",
          clientEmail: "",
          clientNif: "",
          clientAddress: "",
          serviceType: "",
          priority: "normal"
        });
        setSelectedClient(null);
        setIsNewClient(true);
      } else {
        const errorData = await response.json();
        alert(`Erro ao ${vehicle ? 'atualizar' : 'registar'} veículo: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      alert(`Erro ao ${vehicle ? 'atualizar' : 'registar'} veículo. Tente novamente.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-100">{vehicle ? 'Editar Veículo' : 'Novo Veículo'}</h3>
            <p className="text-sm text-brand-yellow font-mono mt-1">Registe um novo veículo na oficina</p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Information */}
          <div className="border-b border-gray-600 pb-6">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Dados do Veículo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-300">Matrícula *</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="AA-11-BB"
                  required
                />
              </div>
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-300">Número do Quadro (VIN)</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="1HGCM82633A123456"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="relative">
                <label htmlFor="make" className="block text-sm font-medium text-gray-300">Marca *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
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
                        <div className="text-sm text-gray-400">{brand.pais_origem}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <label htmlFor="model" className="block text-sm font-medium text-gray-300">Modelo *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  disabled={!formData.make}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label htmlFor="year" className="block text-sm font-medium text-gray-300">Ano</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="2020"
                  min="1900"
                  max="2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-300">Cor</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="Branco"
                />
              </div>
             
            </div>

           
          </div>

          {/* Client Information */}
          <div className="border-b border-gray-600 pb-6">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">
              Dados do Cliente
              {!isNewClient && selectedClient && (
                <span className="ml-2 text-sm text-brand-yellow font-normal">
                  (Cliente existente: {selectedClient.nome})
                </span>
              )}
              {isNewClient && formData.clientName && (
                <span className="ml-2 text-sm text-blue-400 font-normal">
                  (Novo cliente)
                </span>
              )}
            </h4>
            
            {/* Client Name with Autocomplete */}
            <div className="relative mb-6">
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-300">Nome do Cliente *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow"
                placeholder="Pesquisar cliente..."
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
                        {client.telefone} {client.email && `• ${client.email}`} {client.nif && `• NIF: ${client.nif}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="clientProfile" className="block text-sm font-medium text-gray-300">Perfil de Cliente</label>
                <select
                  id="clientProfile"
                  name="clientProfile"
                  value={formData.clientProfile}
                  onChange={handleInputChange}
                  disabled={!clientFieldsEditable}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clientProfiles.map(profile => (
                    <option key={profile.id} value={profile.nome}>{profile.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-300">Telefone *</label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  disabled={!clientFieldsEditable}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+351 912 345 678"
                  required
                />
              </div>
              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  disabled={!clientFieldsEditable}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="joao.silva@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="clientNif" className="block text-sm font-medium text-gray-300">NIF</label>
                <input
                  type="text"
                  id="clientNif"
                  name="clientNif"
                  value={formData.clientNif}
                  onChange={handleInputChange}
                  disabled={!clientFieldsEditable}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="123 456 789"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-300">Morada</label>
              <textarea
                id="clientAddress"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                disabled={!clientFieldsEditable}
                rows={2}
                className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Rua das Flores, 123, Porto"
              />
            </div>
          </div>



          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-none hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
            >
              {vehicle ? 'Atualizar Veículo' : 'Registar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
