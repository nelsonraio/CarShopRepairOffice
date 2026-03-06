'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface Mechanic {
  id: string;
  nome: string;
  especialidade: string;
}

interface CatalogItem {
  id: string;
  name: string;
  type: 'service' | 'part';
  price: number;
  unit: string;
}

interface WorkOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
  type: 'service' | 'part';
  servico_id?: string;
  peca_id?: string;
  descricao: string;
  tipo_item: string;
  aguarda_peca?: boolean;
}

const NewWorkOrderPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [clientVehicles, setClientVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');

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
    cliente: '',
    problemDescription: '',
    workDone: '',
    recommendations: '',
    priority: 'normal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const PARTS_MARKUP = 1.55;

  useEffect(() => {
    fetchServices();
    fetchParts();
    fetchMechanics();
  }, []);

  useEffect(() => {
    const newTotal = workOrderItems.reduce((sum, item) => sum + item.total, 0);
    setTotal(newTotal);
  }, [workOrderItems]);

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
        const formattedServices: CatalogItem[] = data.map((service: any) => ({
          id: service.id,
          name: service.nome,
          type: 'service' as const,
          price: parseFloat(service.preco_base) || 0,
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

  const addItemToWorkOrder = (item: CatalogItem) => {
    const markupPrice = item.type === 'part' ? item.price * PARTS_MARKUP : item.price;
    
    const newItem: WorkOrderItem = {
      id: item.id,
      name: item.name,
      quantity: 1,
      unitPrice: markupPrice,
      unit: item.unit,
      total: markupPrice,
      type: item.type,
      descricao: item.name,
      tipo_item: item.type === 'service' ? 'servico' : 'peca'
    };
    
    if (item.type === 'service') {
      newItem.servico_id = item.id;
    } else if (item.type === 'part') {
      newItem.peca_id = item.id;
    }
    
    setWorkOrderItems([...workOrderItems, newItem]);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...workOrderItems];
    const item = updatedItems[index];
    if (!item) return;
    item.quantity = quantity;
    item.total = quantity * item.unitPrice;
    setWorkOrderItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = workOrderItems.filter((_, i) => i !== index);
    setWorkOrderItems(updatedItems);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'matricula') {
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      let formatted = cleaned;
      if (cleaned.length > 2 && cleaned.length <= 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
      } else if (cleaned.length > 4) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6);
      }

      setFormData(prev => ({ ...prev, matricula: formatted }));

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
          selectClient(client);
        }
      }
    } catch (error) {
      console.error('Failed to search vehicle:', error);
    }
  };

  const createWorkOrder = async () => {
    if (workOrderItems.length === 0) {
      alert('Adicione pelo menos um item à ordem de trabalho antes de guardar.');
      return;
    }

    if (!selectedClient) {
      alert('Selecione um cliente antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      const totalPecas = workOrderItems
        .filter(item => item.type === 'part')
        .reduce((sum, item) => sum + item.total, 0);

      const totalMaoObra = workOrderItems
        .filter(item => item.type === 'service')
        .reduce((sum, item) => sum + item.total, 0);

      const workOrderData = {
        cliente_id: selectedClient.id,
        veiculo_id: selectedVehicle ? parseInt(selectedVehicle) : null,
        mecanico_id: selectedMechanic ? parseInt(selectedMechanic) : null,
        data_inicio: formData.startDate || new Date().toISOString().split('T')[0],
        data_conclusao: formData.endDate || null,
        prioridade: formData.priority,
        descricao_problema: formData.problemDescription,
        trabalho_realizado: formData.workDone,
        recomendacoes: formData.recommendations,
        total_pecas: totalPecas,
        total_mao_obra: totalMaoObra,
        total_desconto: 0,
        total_imposto: 0,
        total_geral: total,
        items: workOrderItems.map(item => ({
          tipo_item: item.tipo_item,
          servico_id: item.servico_id || null,
          peca_id: item.peca_id || null,
          descricao: item.name,
          quantidade: item.quantity,
          preco_unitario: item.unitPrice,
          valor_total: item.total
        }))
      };

      const response = await fetch('/api/ordens-trabalho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workOrderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Ordem de Trabalho criada com sucesso!\nID: ${result.ref_ordem_trabalho}\nTotal: €${total.toFixed(2)}\nItens: ${workOrderItems.length}`);
        router.push('/ordens-trabalho');
      } else {
        const error = await response.json();
        alert(`Erro ao criar ordem de trabalho: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      alert('Erro ao criar ordem de trabalho. Verifique a conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="ordens-trabalho" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        <div className="max-w-5xl mx-auto bg-gray-700 rounded-none shadow-lg border border-gray-600">
          <header className="bg-gray-900 rounded-t-none p-6 border-b border-gray-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Nova Ordem de Trabalho</h1>
                <p className="text-sm text-gray-400 mt-1">Preencha os campos abaixo para criar uma nova ordem de trabalho</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/ordens-trabalho" className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Voltar
                </Link>
              
                <button
                  onClick={createWorkOrder}
                  disabled={saving}
                  className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  {saving ? 'A guardar...' : 'Criar Ordem de Trabalho'}
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data de Início</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data de Conclusão</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Mechanic and Priority Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Mecânico e Prioridade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mecânico Responsável</label>
                  <select
                    name="mechanic"
                    value={selectedMechanic}
                    onChange={(e) => setSelectedMechanic(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  >
                    <option value="">Selecionar mecânico...</option>
                    {mechanics.map(mechanic => (
                      <option key={mechanic.id} value={mechanic.id}>
                        {mechanic.nome} {mechanic.especialidade ? `(${mechanic.especialidade})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Prioridade</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Problem Description Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Descrição do Problema</h3>
              <div>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Descreva o problema reportado pelo cliente..."
                />
              </div>
            </div>

            {/* Work Done Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Trabalho Realizado</h3>
              <div>
                <textarea
                  name="workDone"
                  value={formData.workDone}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Descreva o trabalho realizado..."
                />
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Recomendações</h3>
              <div>
                <textarea
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                  placeholder="Recomendações para o cliente..."
                />
              </div>
            </div>

            <hr className="border-gray-600 mb-6" />

            {/* Items Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Itens da Ordem de Trabalho</h3>

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
                        key={`${item.type}-${item.id}`}
                        className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-0"
                        onClick={() => addItemToWorkOrder(item)}
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

                        const newItem: WorkOrderItem = {
                          id: `custom-${Date.now()}`,
                          name: customItem.name,
                          quantity: customItem.quantity,
                          unitPrice: customItem.unitPrice,
                          unit: 'h',
                          total: customItem.quantity * customItem.unitPrice,
                          type: 'service',
                          servico_id: '',
                          peca_id: '',
                          descricao: customItem.name,
                          tipo_item: 'servico'
                        };

                        setWorkOrderItems([...workOrderItems, newItem]);
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
                    {workOrderItems.length === 0 ? (
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
                      workOrderItems.map((item, index) => (
                        <tr key={index} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-200">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.type === 'service' ? 'Serviço' : 'Peça'}</div>
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

export default NewWorkOrderPage;
