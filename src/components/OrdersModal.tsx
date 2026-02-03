import React, { useState } from 'react';

interface Part {
  id: string;
  reference: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
}

interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  parts: Array<{
    part: Part;
    quantity: number;
  }>;
  orderDate: string;
  expectedDate: string;
  status: 'pendente' | 'em_transito' | 'recebido' | 'cancelado';
  totalValue: number;
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: Part[];
  onReorder?: (selectedParts: Array<{part: Part, quantity: number}>) => void;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, parts, onReorder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ENC-2024-001",
      supplier: "Bosch Portugal",
      parts: [
        { part: parts.find(p => p.id === "1")!, quantity: 20 },
        { part: parts.find(p => p.id === "4")!, quantity: 10 }
      ],
      orderDate: "2024-01-15",
      expectedDate: "2024-01-25",
      status: "recebido",
      totalValue: 320.00
    },
    {
      id: "2",
      orderNumber: "ENC-2024-002",
      supplier: "AutoParts SA",
      parts: [
        { part: parts.find(p => p.id === "2")!, quantity: 15 }
      ],
      orderDate: "2024-01-18",
      expectedDate: "2024-01-28",
      status: "em_transito",
      totalValue: 688.50
    },
    {
      id: "3",
      orderNumber: "ENC-2024-003",
      supplier: "LubriNorte",
      parts: [
        { part: parts.find(p => p.id === "3")!, quantity: 8 }
      ],
      orderDate: "2024-01-20",
      expectedDate: "2024-01-30",
      status: "pendente",
      totalValue: 440.00
    }
  ]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const filteredOrders = orders.filter(order =>
    (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'todos' || order.status === statusFilter)
  );

  const handleAddToInventory = (orderId: string, partId: string, quantity: number) => {
    // In a real app, this would update the inventory
    console.log(`Adding ${quantity} units of part ${partId} from order ${orderId} to inventory`);
    // Here you would typically call an API to update the inventory
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    // In a real app, this would update the order status via API
    console.log(`Changing status of order ${orderId} to ${newStatus}`);
    // Update the local state to reflect the change immediately
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // Here you would typically call an API to update the order status
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-400 bg-yellow-900/50';
      case 'em_transito': return 'text-blue-400 bg-blue-900/50';
      case 'recebido': return 'text-green-400 bg-green-900/50';
      case 'cancelado': return 'text-red-400 bg-red-900/50';
      default: return 'text-gray-400 bg-gray-900/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'todos': return 'Todos';
      case 'em_transito': return 'Em Trânsito';
      case 'recebido': return 'Recebido';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Encomendas de Peças</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Pesquisar por número de encomenda ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              {['todos', 'pendente', 'em_transito', 'recebido', 'cancelado'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-bold rounded-none border transition-colors ${statusFilter === status ? 'bg-brand-yellow text-gray-900 border-brand-yellow' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
                >
                  {getStatusText(status).charAt(0).toUpperCase() + getStatusText(status).slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-gray-700 border border-gray-600 rounded-none">
                <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-600/50" onClick={() => toggleOrderExpansion(order.id)}>
                  <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-400">{order.supplier}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400">Encomendado:</p>
                      <p className="text-gray-200 font-medium">{new Date(order.orderDate).toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400">Previsto:</p>
                      <p className="text-gray-200 font-medium">{new Date(order.expectedDate).toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-1 text-xs font-bold rounded-full border-0 bg-transparent cursor-pointer focus:ring-1 focus:ring-brand-yellow ${getStatusColor(order.status)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="pendente" className="bg-gray-800 text-yellow-400">Pendente</option>
                        <option value="em_transito" className="bg-gray-800 text-blue-400">Em Trânsito</option>
                        <option value="recebido" className="bg-gray-800 text-green-400">Recebido</option>
                        <option value="cancelado" className="bg-gray-800 text-red-400">Cancelado</option>
                      </select>
                    </div>
                  </div>
                  <div className="ml-4">
                     <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrders.includes(order.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                {expandedOrders.includes(order.id) && (
                  <div className="border-t border-gray-600 bg-gray-900/30">
                    <div className="p-4 space-y-3">
                      {order.parts.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-800 p-3 border border-gray-700">
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.part.name}</p>
                            <p className="text-gray-400 text-sm">Ref: {item.part.reference}</p>
                          </div>
                          <div className="text-right mr-6">
                            <p className="text-white">{item.quantity} un.</p>
                            <p className="text-gray-400 text-sm">€{(item.part.price * item.quantity).toFixed(2)}</p>
                          </div>
                          {order.status === 'recebido' && (
                            <button
                              onClick={() => handleAddToInventory(order.id, item.part.id, item.quantity)}
                              className="px-3 py-1 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors rounded-none flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                              Stock
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Total da Encomenda:</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-bold text-lg">€{order.totalValue.toFixed(2)}</span>
                        {onReorder && (
                          <button
                            onClick={() => onReorder(order.parts)}
                            className="px-4 py-2 bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-colors rounded-none flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 19v-5h-5M4 19h16M4 5h16"></path></svg>
                            Reencomendar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">Nenhuma encomenda encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">Tente ajustar a sua pesquisa ou filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
