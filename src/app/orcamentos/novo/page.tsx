'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import Link from 'next/link';

interface Client {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  nif: string;
  endereco: string;
  perfil: string;
}

interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  licensePlate: string;
  year: number;
  status: string;
  lastIntervention: string;
}

interface CatalogItem {
  id: string;
  name: string;
  type: 'service' | 'part';
  price: number;
  unit: string;
}

interface BudgetItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
  type: 'service' | 'part';
}

const NewBudgetPage = () => {
  const [clientType, setClientType] = useState('C');
  const [budgetId, setBudgetId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const [services, setServices] = useState<CatalogItem[]>([]);
  const [parts, setParts] = useState<CatalogItem[]>([]);
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [isVehicleAutoFilled, setIsVehicleAutoFilled] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [customItem, setCustomItem] = useState({
    name: '',
    quantity: 1,
    unitPrice: 0
  });
  const [formData, setFormData] = useState({
    matricula: '',
    marca: '',
    modelo: '',
    ano: '',
    cliente: ''
  });



  useEffect(() => {
    updateIdPreview();
  }, [clientType]);

  useEffect(() => {
    const newTotal = budgetItems.reduce((sum, item) => sum + item.total, 0);
    setTotal(newTotal);
  }, [budgetItems]);

  useEffect(() => {
    fetchServices();
    fetchParts();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/servicos');
      if (response.ok) {
        const data = await response.json();
        const formattedServices: CatalogItem[] = data.map((service: any) => ({
          id: service.id,
          name: service.nome,
          type: 'service' as const,
          price: service.preco_base || 0,
          unit: 'h'
        }));
        setServices(formattedServices);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/pecas');
      if (response.ok) {
        const data = await response.json();
        const formattedParts: CatalogItem[] = data.map((part: any) => ({
          id: part.id,
          name: part.nome,
          type: 'part' as const,
          price: parseFloat(part.preco_venda) || 0,
          unit: 'un'
        }));
        setParts(formattedParts);
      }
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    }
  };

  const searchCatalogItems = async (query: string) => {
    try {
      const [servicesResponse, partsResponse] = await Promise.all([
        fetch(`/api/servicos/search?q=${encodeURIComponent(query)}`),
        fetch(`/api/pecas/search?q=${encodeURIComponent(query)}`)
      ]);

      const servicesData = servicesResponse.ok ? await servicesResponse.json() : [];
      const partsData = partsResponse.ok ? await partsResponse.json() : [];

      const formattedServices: CatalogItem[] = servicesData.map((service: any) => ({
        id: service.id,
        name: service.nome,
        type: 'service' as const,
        price: parseFloat(service.preco_base) || 0,
        unit: 'h'
      }));

      const formattedParts: CatalogItem[] = partsData.map((part: any) => ({
        id: part.id,
        name: part.nome,
        type: 'part' as const,
        price: parseFloat(part.preco_venda) || 0,
        unit: 'un'
      }));

      const combinedResults = [...formattedServices, ...formattedParts];
      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Failed to search catalog items:', error);
      setSearchResults([]);
    }
  };

  const updateIdPreview = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();

    if (clientType === 'TVDE') {
      setBudgetId(`OR-${year}-TVDE${randomNum}`);
    } else {
      setBudgetId(`OR-${year}-C${randomNum}`);
    }
  };



  const addItemToBudget = (item: CatalogItem) => {
    const newItem: BudgetItem = {
      id: item.id,
      name: item.name,
      quantity: 1,
      unitPrice: item.price,
      unit: item.unit,
      total: item.price,
      type: item.type
    };
    setBudgetItems([...budgetItems, newItem]);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...budgetItems];
    const item = updatedItems[index];
    if (!item) return;
    item.quantity = quantity;
    item.total = quantity * item.unitPrice;
    setBudgetItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = budgetItems.filter((_, i) => i !== index);
    setBudgetItems(updatedItems);
  };

  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientSearch(value);

    if (value && value.length >= 2) {
      searchClients(value);
    } else {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
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

  const fetchClientVehicles = async (clientId: string) => {
    try {
      const response = await fetch(`/api/veiculos?cliente_id=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setClientVehicles(data);
      }
    } catch (error) {
      console.error('Failed to fetch client vehicles:', error);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.nome);
    setClientSuggestions([]);
    setShowClientSuggestions(false);
    fetchClientVehicles(client.id.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle license plate formatting and auto-fill
    if (name === 'matricula') {
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      let formatted = cleaned;
      if (cleaned.length > 2 && cleaned.length <= 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
      } else if (cleaned.length > 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6);
      }

      setFormData(prev => ({ ...prev, matricula: formatted }));

      // Auto-fill vehicle data when license plate is complete
      if (formatted.length >= 6) {
        searchVehicleByLicensePlate(formatted);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const searchVehicleByLicensePlate = async (licensePlate: string) => {
    try {
      const response = await fetch(`/api/veiculos/search?matricula=${encodeURIComponent(licensePlate)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.found) {
          const vehicle = data.vehicle;
          const client = data.client;
          setFormData(prev => ({
            ...prev,
            marca: vehicle.marca || '',
            modelo: vehicle.modelo || '',
            ano: vehicle.ano || ''
          }));
          setIsVehicleAutoFilled(true);
          setSelectedVehicle(vehicle.id);
          // Select client associated with the vehicle
          selectClient(client);
        } else {
          // Vehicle not found, clear auto-filled data
          setFormData(prev => ({
            ...prev,
            marca: '',
            modelo: '',
            ano: ''
          }));
          setIsVehicleAutoFilled(false);
          setSelectedVehicle('');
          setSelectedClient(null);
          setClientSearch('');
        }
      }
    } catch (error) {
      console.error('Failed to search vehicle:', error);
    }
  };

  const fetchClientById = async (clientId: number) => {
    try {
      const response = await fetch(`/api/clientes/${clientId}`);
      if (response.ok) {
        const client = await response.json();
        selectClient(client);
      }
    } catch (error) {
      console.error('Failed to fetch client:', error);
    }
  };

  const createBudget = async () => {
    if (budgetItems.length === 0) {
      alert('Adicione pelo menos um item ao orçamento antes de criar.');
      return;
    }

    if (!selectedClient) {
      alert('Selecione um cliente antes de criar o orçamento.');
      return;
    }

    try {
      // Calculate totals
      const totalPecas = budgetItems
        .filter(item => item.type === 'part')
        .reduce((sum, item) => sum + item.total, 0);

      const totalMaoObra = budgetItems
        .filter(item => item.type === 'service')
        .reduce((sum, item) => sum + item.total, 0);

      const budgetData = {
        ref_orcamento: budgetId,
        cliente_id: selectedClient.id,
        veiculo_id: selectedVehicle ? parseInt(selectedVehicle) : null,
        preparado_por: null, // TODO: Add user ID when authentication is implemented
        data_emissao: new Date().toISOString().split('T')[0],
        data_expiracao: null,
        estado: 'pendente',
        total_pecas: totalPecas,
        total_mao_obra: totalMaoObra,
        total_desconto: 0,
        total_imposto: 0,
        total_geral: total,
        notas: '',
        items: budgetItems.map(item => ({
          type: item.type,
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        }))
      };

      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Orçamento ${budgetId} criado com sucesso!\nTotal: €${total.toFixed(2)}\nItens: ${budgetItems.length}`);

        // Reset form after creation
        setBudgetItems([]);
        setTotal(0);
        setSelectedClient(null);
        setClientSearch('');
        updateIdPreview();
      } else {
        const error = await response.json();
        alert(`Erro ao criar orçamento: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Erro ao criar orçamento. Verifique a conexão com o servidor.');
    }
  };

  const approveBudget = () => {
    if (budgetItems.length === 0) {
      alert('Adicione pelo menos um item ao orçamento antes de aprovar.');
      return;
    }

    const budgetData = {
      id: budgetId,
      clientType,
      items: budgetItems,
      total,
      status: 'Aprovado',
      date: new Date().toISOString().split('T')[0]
    };

    console.log('Approving budget:', budgetData);
    alert(`Orçamento ${budgetId} aprovado com sucesso!\nTotal: €${total.toFixed(2)}\nEstado: Aprovado`);

    // Reset form after approval
    setBudgetItems([]);
    setTotal(0);
    setSelectedClient(null);
    setClientSearch('');
    updateIdPreview();
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="orcamentos" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <header className="bg-gray-900 rounded-t-none p-6 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Novo Orçamento</h1>
                <p className="text-sm text-gray-400 mt-1">ID: <span className="font-mono text-brand-yellow">{budgetId}</span></p>
              </div>
              <div className="flex space-x-3">
                <Link href="/orcamentos" className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Voltar
                </Link>
                <button className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Imprimir
                </button>
                
                <button
                  onClick={createBudget}
                  className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Criar Orçamento
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">

            {/* Vehicle Data Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Dados do Veículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Matrícula *</label>
                  <input
                    type="text"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                    placeholder="Digite a matrícula..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Marca</label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    readOnly={isVehicleAutoFilled}
                    className={`w-full ${isVehicleAutoFilled ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-900'} border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600`}
                    placeholder="Marca do veículo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    readOnly={isVehicleAutoFilled}
                    className={`w-full ${isVehicleAutoFilled ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-900'} border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600`}
                    placeholder="Modelo do veículo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Ano</label>
                  <input
                    type="text"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    readOnly={isVehicleAutoFilled}
                    className={`w-full ${isVehicleAutoFilled ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-900'} border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600`}
                    placeholder="Ano do veículo"
                  />
                </div>
              </div>
            </div>

            {/* Client Data Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cliente *</label>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={handleClientSearchChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                    placeholder="Pesquisar cliente..."
                    required
                  />
                  {showClientSuggestions && clientSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 shadow-lg max-h-60 overflow-y-auto mt-1">
                      {clientSuggestions.map(client => (
                        <div
                          key={client.id}
                          className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-0"
                          onClick={() => selectClient(client)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-200">{client.nome}</div>
                              <div className="text-xs text-gray-400">{client.telefone} • {client.email}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Client Details */}
            {selectedClient && (
              <div className="bg-gray-800 p-4 border border-gray-600 rounded-none mb-8">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">Dados do Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                    <input
                      type="text"
                      value={selectedClient?.nome || ''}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-600 text-gray-400 px-3 py-2 rounded-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={selectedClient?.telefone || ''}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-600 text-gray-400 px-3 py-2 rounded-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input
                      type="text"
                      value={selectedClient?.email || ''}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-600 text-gray-400 px-3 py-2 rounded-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">NIF</label>
                    <input
                      type="text"
                      value={selectedClient?.nif || ''}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-600 text-gray-400 px-3 py-2 rounded-none cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Endereço</label>
                    <input
                      type="text"
                      value={selectedClient?.endereco || ''}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-600 text-gray-400 px-3 py-2 rounded-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Perfil</label>
                    <input
                      type="text"
                      value={selectedClient?.perfil || ''}
                      readOnly
                      className="w-full bg-gray-900 border border-gray-600 text-gray-400 px-3 py-2 rounded-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-gray-600 mb-6" />

            {/* Items Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Itens do Orçamento</h3>

              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar peça ou serviço para adicionar..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    if (value.length >= 2) {
                      searchCatalogItems(value);
                      setShowSearchResults(true);
                    } else {
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {showSearchResults && (
                  <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(item => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-0"
                        onClick={() => addItemToBudget(item)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-200">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.id} • {item.type === 'service' ? 'Serviço' : 'Peça'}</div>
                          </div>
                          <div className="text-brand-yellow font-mono">€{item.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Item Form */}
              <div className="bg-gray-800 p-4 border border-gray-600 rounded-none mb-4">
                <h4 className="text-lg font-semibold text-gray-200 mb-4">Adicionar Item Personalizado</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Descrição *</label>
                    <input
                      type="text"
                      value={customItem.name}
                      onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="Descrição do item personalizado"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Quantidade *</label>
                    <input
                      type="number"
                      value={customItem.quantity}
                      onChange={(e) => setCustomItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                      min="0.1"
                      step="0.1"
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Preço Unitário *</label>
                    <input
                      type="number"
                      value={customItem.unitPrice}
                      onChange={(e) => setCustomItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 mb-2"
                      placeholder="0.00"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!customItem.name.trim()) {
                          alert('Por favor, insira uma descrição para o item.');
                          return;
                        }
                        if (customItem.unitPrice <= 0) {
                          alert('Por favor, insira um preço válido.');
                          return;
                        }

                        const newItem: BudgetItem = {
                          id: `custom-${Date.now()}`,
                          name: customItem.name,
                          quantity: customItem.quantity,
                          unitPrice: customItem.unitPrice,
                          unit: 'h',
                          total: customItem.quantity * customItem.unitPrice,
                          type: 'service'
                        };

                        setBudgetItems([...budgetItems, newItem]);
                        setCustomItem({ name: '', quantity: 1, unitPrice: 0 });
                      }}
                      className="w-full px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-none border border-gray-600">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 w-1/2">Descrição</th>
                      <th className="px-6 py-3 text-right">Qtd/Horas</th>
                      <th className="px-6 py-3 text-right">Preço Unit.</th>
                      <th className="px-6 py-3 text-right">Total</th>
                      <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {budgetItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                          </svg>
                          <p>Nenhum item adicionado.</p>
                          <p className="text-xs mt-1">Utilize a pesquisa acima para adicionar peças ou serviços.</p>
                        </td>
                      </tr>
                    ) : (
                      budgetItems.map((item, index) => (
                        <tr key={index} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-200">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.id}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <input
                              type="number"
                              value={item.quantity}
                              min="0.1"
                              step="0.1"
                              className="w-20 bg-gray-900 border border-gray-600 text-white px-2 py-1 text-right rounded-none focus:ring-1 focus:ring-brand-yellow outline-none"
                              onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400">
                            €{item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-200">
                            €{item.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 bg-gray-800 p-4 border border-gray-600 rounded-none">
                <div className="flex justify-between py-3 mt-2">
                  <span className="text-xl font-bold text-gray-100">Total Final</span>
                  <span className="text-xl font-bold text-brand-yellow">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewBudgetPage;
