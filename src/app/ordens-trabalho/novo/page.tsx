'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';

interface WorkOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
}

// Mock de orçamentos aprovados para demonstração
const approvedQuotes = [
  { 
    id: '1', number: 'ORC-2024-001', clientId: '1', vehicleId: '1', total: 147.60, 
    items: [
      { id: 'PART-001', name: 'Filtro de Óleo Bosch', quantity: 1, unitPrice: 12.50, unit: 'un', total: 12.50 },
      { id: 'SERV-001', name: 'Mão de Obra (Hora)', quantity: 2, unitPrice: 45.00, unit: 'h', total: 90.00 }
    ]
  },
  { 
    id: '2', number: 'ORC-2024-002', clientId: '2', vehicleId: '2', total: 104.55, 
    items: [
      { id: 'SERV-002', name: 'Inspeção Periódica', quantity: 1, unitPrice: 85.00, unit: 'un', total: 85.00 }
    ]
  }
];

const NewWorkOrderPage = () => {
  const [workOrderId, setWorkOrderId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedQuote, setSelectedQuote] = useState('');

  useEffect(() => {
    updateIdPreview();
  }, []);

  useEffect(() => {
    const newTotal = workOrderItems.reduce((sum, item) => sum + item.total, 0);
    setTotal(newTotal);
  }, [workOrderItems]);

  const updateIdPreview = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setWorkOrderId(`OT-${year}-${String(randomNum).padStart(3, '0')}`);
  };

  const catalogItems = [
    { id: 'SERV-001', name: 'Mão de Obra (Hora)', type: 'service', price: 45.00, unit: 'h' },
    { id: 'SERV-002', name: 'Diagnóstico Computorizado', type: 'service', price: 35.00, unit: 'un' },
    { id: 'SERV-003', name: 'Alinhamento de Direção', type: 'service', price: 40.00, unit: 'un' },
    { id: 'PART-001', name: 'Filtro de Óleo Bosch', type: 'part', price: 12.50, unit: 'un' },
    { id: 'PART-002', name: 'Óleo Castrol Edge 5W30 (5L)', type: 'part', price: 55.00, unit: 'un' },
    { id: 'PART-003', name: 'Pastilhas Travão Brembo (Frente)', type: 'part', price: 45.90, unit: 'un' },
    { id: 'PART-004', name: 'Filtro de Ar Mann', type: 'part', price: 15.80, unit: 'un' },
    { id: 'PART-005', name: 'Vela de Ignição NGK', type: 'part', price: 18.20, unit: 'un' }
  ];

  const filteredItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToWorkOrder = (item: any) => {
    const newItem: WorkOrderItem = {
      id: item.id,
      name: item.name,
      quantity: 1,
      unitPrice: item.price,
      unit: item.unit,
      total: item.price
    };
    setWorkOrderItems([...workOrderItems, newItem]);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...workOrderItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = quantity * updatedItems[index].unitPrice;
    setWorkOrderItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = workOrderItems.filter((_, i) => i !== index);
    setWorkOrderItems(updatedItems);
  };

  const handleQuoteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quoteId = e.target.value;
    setSelectedQuote(quoteId);
    
    if (quoteId) {
      const quote = approvedQuotes.find(q => q.id === quoteId);
      if (quote) {
        setSelectedClient(quote.clientId);
        setSelectedVehicle(quote.vehicleId);
        // Converter itens do orçamento para itens da OT
        setWorkOrderItems(quote.items.map(item => ({
          ...item,
          id: item.id // Garantir que o ID corresponde
        })));
      }
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
                <p className="text-sm text-gray-400 mt-1">Nº OT: <span className="font-mono text-brand-yellow">{workOrderId}</span></p>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Imprimir
                </button>
                <button className="px-4 py-2 bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors rounded-none">Voltar</button>
                <button className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Guardar
                </button>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Form Header */}
            <div className="mb-6 bg-gray-800 p-4 border border-gray-600 rounded-none">
              <label className="block text-sm font-medium text-brand-yellow mb-2">Importar de Orçamento Aprovado</label>
              <select 
                className="w-full bg-gray-700 border border-gray-500 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                value={selectedQuote}
                onChange={handleQuoteSelection}
              >
                <option value="">Selecione um orçamento para converter...</option>
                {approvedQuotes.map(quote => (
                  <option key={quote.id} value={quote.id}>{quote.number} - Total: €{quote.total.toFixed(2)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  <option value="1">João Silva</option>
                  <option value="2">Maria Santos</option>
                  <option value="3">Pedro Costa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Veículo</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  <option value="">Selecione um veículo...</option>
                  <option value="1">Peugeot 308 | 45-GH-23</option>
                  <option value="2">Renault Clio | 12-AB-34</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mecânico Responsável</label>
                <select className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors">
                  <option value="">Selecione um mecânico...</option>
                  <option value="1">Carlos P.</option>
                  <option value="2">Rui Alves</option>
                  <option value="3">Joaquim F.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data de Abertura</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prioridade</label>
                <select className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors">
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                <select className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors">
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Descrição do Problema</label>
              <textarea
                rows={4}
                placeholder="Descreva o problema relatado pelo cliente..."
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors resize-none"
              />
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
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.length >= 2);
                  }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {showSearchResults && (
                  <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 shadow-lg max-h-60 overflow-y-auto">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
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

            {/* Solution Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Descrição da Solução</label>
              <textarea
                rows={4}
                placeholder="Descreva a solução implementada..."
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors resize-none"
              />
            </div>

            {/* Observations */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Observações</label>
              <textarea
                rows={3}
                placeholder="Observações adicionais..."
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none transition-colors resize-none"
              />
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 bg-gray-800 p-4 border border-gray-600 rounded-none">
                <div className="flex justify-between py-3 mt-2">
                  <span className="text-xl font-bold text-gray-100">Total Estimado</span>
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
