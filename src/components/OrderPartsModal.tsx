"use client";

import { useState, useEffect } from "react";

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

interface OrderItem {
  part: Part;
  quantity: number;
  selected: boolean;
}

interface OrderPartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: Part[];
  onOrderParts: (selectedParts: Array<{part: Part, quantity: number}>) => void;
  initialSelectedParts?: Array<{part: Part, quantity: number}>;
}

export default function OrderPartsModal({ isOpen, onClose, parts, onOrderParts, initialSelectedParts }: OrderPartsModalProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderText, setOrderText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPartForm, setShowNewPartForm] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    reference: "",
    supplier: "",
    quantity: 1
  });

  useEffect(() => {
    if (isOpen) {
      const initialItems: OrderItem[] = parts.map(part => {
        const initialPart = initialSelectedParts?.find(isp => isp.part.id === part.id);
        return {
          part,
          quantity: initialPart ? initialPart.quantity : 1,
          selected: !!initialPart
        };
      });
      setOrderItems(initialItems);
    }
  }, [isOpen, parts, initialSelectedParts]);

  useEffect(() => {
    const selectedItems = orderItems.filter(item => item.selected);

    if (selectedItems.length === 0) {
      setOrderText("Selecione peças da lista acima para gerar o pedido.");
      return;
    }

    let text = "Olá, gostaria de encomendar as seguintes peças:\n\n";
    selectedItems.forEach(item => {
      text += `- ${item.quantity}x ${item.part.name} (Ref: ${item.part.reference})\n`;
    });

    text += "\nObrigado,\nMQAuto";
    setOrderText(text);
  }, [orderItems]);

  const handleItemToggle = (partId: string) => {
    setOrderItems(currentItems =>
      currentItems.map(item =>
        item.part.id === partId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleQuantityChange = (partId: string, quantity: number) => {
    setOrderItems(currentItems =>
      currentItems.map(item =>
        item.part.id === partId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(orderText);
    // You could add a toast notification here
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(orderText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredItems = orderItems.filter(item =>
    item.part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.part.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.part.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewPart = () => {
    if (newPart.name && newPart.supplier) {
      const customPart: Part = {
        id: `custom-${Date.now()}`,
        reference: newPart.reference || "N/A",
        name: newPart.name,
        category: "custom",
        supplier: newPart.supplier,
        stock: 0,
        price: 0,
        stockStatus: "esgotado"
      };

      const newOrderItem: OrderItem = {
        part: customPart,
        quantity: newPart.quantity,
        selected: true
      };

      setOrderItems(prevItems => [...prevItems, newOrderItem]);
      setNewPart({ name: "", reference: "", supplier: "", quantity: 1 });
      setShowNewPartForm(false);
    }
  };

  const handleOrder = () => {
    const selectedParts = orderItems
      .filter(item => item.selected)
      .map(item => ({ part: item.part, quantity: item.quantity }));

    onOrderParts(selectedParts);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-7xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        <h3 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">Encomendar Peças</h3>

        <div className="flex-1 flex mt-2 overflow-hidden gap-6">
          {/* --- LEFT COLUMN: AVAILABLE PARTS --- */}
          <div className="w-7/12 flex flex-col">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar peças..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setShowNewPartForm(!showNewPartForm)}
                className="px-4 py-2 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors rounded-none flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nova Peça
              </button>
            </div>

            {showNewPartForm && (
              <div className="mb-4 p-4 bg-gray-700 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-4">Adicionar Nova Peça à Encomenda</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nome da Peça *</label>
                    <input type="text" value={newPart.name} onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} className="w-full bg-gray-800 border border-gray-500 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow outline-none" placeholder="Ex: Filtro de Óleo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Referência</label>
                    <input type="text" value={newPart.reference} onChange={(e) => setNewPart({ ...newPart, reference: e.target.value })} className="w-full bg-gray-800 border border-gray-500 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow outline-none" placeholder="Ex: BOS-0986452058" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Fornecedor *</label>
                    <input type="text" value={newPart.supplier} onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })} className="w-full bg-gray-800 border border-gray-500 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow outline-none" placeholder="Ex: Bosch Portugal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Quantidade *</label>
                    <input type="number" min="1" value={newPart.quantity} onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })} className="w-full bg-gray-800 border border-gray-500 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow outline-none" />
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button onClick={() => setShowNewPartForm(false)} className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-500 transition-colors rounded-none">Cancelar</button>
                  <button onClick={handleAddNewPart} className="px-4 py-2 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors rounded-none">Adicionar</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {filteredItems.filter(item => !item.selected).map((item) => (
                <div key={item.part.id} className="flex items-center justify-between bg-gray-700 p-3 border border-gray-600">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{item.part.name}</p>
                    <p className="text-xs text-gray-400">Ref: {item.part.reference} | Fornecedor: {item.part.supplier}</p>
                  </div>
                  <button onClick={() => handleItemToggle(item.part.id)} className="px-3 py-1 bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors rounded-none flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add
                  </button>
                </div>
              ))}
              {filteredItems.filter(item => !item.selected).length === 0 && !showNewPartForm && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhuma peça encontrada ou todas já foram adicionadas.</p>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="w-5/12 flex flex-col pl-6 border-l border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">Resumo da Encomenda</h4>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {orderItems.filter(item => item.selected).map((item) => (
                <div key={item.part.id} className="bg-gray-900/50 p-3 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{item.part.name}</p>
                      <p className="text-xs text-gray-400">Ref: {item.part.reference}</p>
                    </div>
                    <button onClick={() => handleItemToggle(item.part.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <label className="text-xs text-gray-400 mr-2">Qtd:</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.part.id, parseInt(e.target.value) || 1)} className="w-20 bg-gray-800 border border-gray-500 text-white text-sm px-2 py-1 rounded-none focus:ring-1 focus:ring-brand-yellow outline-none" />
                  </div>
                </div>
              ))}
              {orderItems.filter(item => item.selected).length === 0 && (
                <div className="flex-1 flex items-center justify-center text-center h-full">
                  <div className="p-4 border-2 border-dashed border-gray-700">
                    <svg className="mx-auto h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p className="mt-2 text-sm text-gray-500">Adicione peças da lista à esquerda.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Texto para Envio</label>
              <textarea value={orderText} readOnly rows={5} className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none font-mono text-sm" />
              <div className="flex justify-end space-x-2 mt-2">
                <button type="button" onClick={handleCopyText} className="px-3 py-1 bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors rounded-none flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  Copiar
                </button>
                <button type="button" onClick={handleSendWhatsApp} className="px-3 py-1 bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors rounded-none flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.536 0 1.52 1.115 2.988 1.264 3.186.149.198 2.19 3.349 5.302 4.695.742.32 1.321.51 1.771.653.742.236 1.418.203 1.95.124.595-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleOrder}
            disabled={orderItems.filter(item => item.selected).length === 0}
            className="px-6 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Criar Encomenda
          </button>
        </div>
      </div>
    </div>
  );
}
