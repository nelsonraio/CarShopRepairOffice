'use client';

import React, { useState, useEffect } from 'react';

interface Fornecedor {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

interface Peca {
  codigo: string;
  reference: string;
  nome: string;
  preco: number;
  quantidade_stock: number;
  nivel_stock_minimo: number;
}

interface ItemEncomenda {
  peca_id: string;
  peca_nome?: string;
  quantidade_encomendada: number;
  preco_unitario: number;
}

interface EncomendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  fornecedores: Fornecedor[];
  pecas: Peca[];
}

const EncomendaModal: React.FC<EncomendaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  fornecedores,
  pecas,
}) => {
  const [formData, setFormData] = useState({
    fornecedor_id: '',
    data_entrega_estimada: '',
  });
  const [items, setItems] = useState<ItemEncomenda[]>([]);
  const [selectedPecaId, setSelectedPecaId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFormData({ fornecedor_id: '', data_entrega_estimada: '' });
      setItems([]);
      setSelectedPecaId('');
      setSelectedQuantity(1);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleAddItem = () => {
    if (!selectedPecaId) {
      setError('Selecione uma peça');
      return;
    }

    const peca = pecas.find(p => p.codigo === selectedPecaId);
    if (!peca) return;

    // Check if already added
    if (items.some(item => item.peca_id === selectedPecaId)) {
      setError('Esta peça já foi adicionada');
      return;
    }

    const newItem: ItemEncomenda = {
      peca_id: selectedPecaId,
      peca_nome: peca.nome,
      quantidade_encomendada: selectedQuantity,
      preco_unitario: peca.preco,
    };

    setItems([...items, newItem]);
    setSelectedPecaId('');
    setSelectedQuantity(1);
    setError('');
  };

  const handleRemoveItem = (pecaId: string) => {
    setItems(items.filter(item => item.peca_id !== pecaId));
  };

  const handleQuantityChange = (pecaId: string, quantity: number) => {
    setItems(
      items.map(item =>
        item.peca_id === pecaId
          ? { ...item, quantidade_encomendada: Math.max(1, quantity) }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce(
      (sum, item) => sum + item.quantidade_encomendada * item.preco_unitario,
      0
    );
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    console.log('🔵 handleSubmit iniciado');
    console.log('Fornecedor selecionado:', formData.fornecedor_id);
    console.log('Itens:', items.length);

    if (!formData.fornecedor_id) {
      setError('Selecione um fornecedor');
      console.warn('⚠️ Validação falhou: Fornecedor não selecionado');
      return;
    }

    if (items.length === 0) {
      setError('Adicione pelo menos uma peça');
      console.warn('⚠️ Validação falhou: Nenhuma peça adicionada');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fornecedor_id: formData.fornecedor_id,
        data_entrega_estimada: formData.data_entrega_estimada || null,
        itens: items,
      };
      
      console.log('📤 Enviando encomenda:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/encomendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 Resposta da API - Status:', response.status);
      
      const data = await response.json();
      console.log('📋 Dados recebidos:', data);

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Erro HTTP ${response.status}`;
        console.error('❌ Erro na resposta:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data?.id) {
        console.error('❌ Erro: Resposta sem ID', data);
        throw new Error('Resposta da API inválida (falta ID)');
      }

      // Success
      const successMsg = `✅ Encomenda ${data.numero_encomenda} criada com sucesso!`;
      console.log(successMsg);
      setSuccess(successMsg);
      setFormData({ fornecedor_id: '', data_entrega_estimada: '' });
      setItems([]);
      
      // Call success callback
      console.log('🔄 Chamando onSuccess...');
      await onSuccess?.();
      console.log('✅ onSuccess concluído');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        console.log('🔄 Fechando modal...');
        onClose();
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('🚨 Erro na criação da encomenda:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const selectedPeca = pecas.find(p => p.codigo === selectedPecaId);
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Nova Encomenda</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-400 p-4 rounded-lg font-medium">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-lg font-medium">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <div>
                  <p className="font-bold">{success}</p>
                  <p className="text-sm text-green-400">A modalfechará em 2 segundos...</p>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <>
          {/* Fornecedor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fornecedor *
            </label>
            <select
              value={formData.fornecedor_id}
              onChange={(e) =>
                setFormData({ ...formData, fornecedor_id: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 text-white rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
            >
              <option value="">Selecione um fornecedor...</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data de Entrega Estimada
            </label>
            <input
              type="date"
              value={formData.data_entrega_estimada}
              onChange={(e) =>
                setFormData({ ...formData, data_entrega_estimada: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 text-white rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
            />
          </div>

          {/* Item Selection */}
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Adicionar Peças</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Peça
                </label>
                <select
                  value={selectedPecaId}
                  onChange={(e) => setSelectedPecaId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 text-white rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                >
                  <option value="">Selecione uma peça...</option>
                  {pecas.map(p => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.nome} (Ref: {p.reference}) - €{p.preco?.toFixed(2) ?? '0.00'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 text-white rounded focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-yellow-400 transition-colors rounded"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {selectedPeca && (
                <div className="bg-gray-900 p-2 text-sm text-gray-400">
                  Subtotal: €{(selectedQuantity * selectedPeca.preco).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="bg-gray-700 p-4 rounded border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Peças na Encomenda</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div
                    key={item.peca_id}
                    className="bg-gray-800 p-3 flex justify-between items-center border border-gray-600 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.peca_nome}</p>
                      <p className="text-gray-400 text-sm">€{item.preco_unitario?.toFixed(2) ?? '0.00'}/un</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade_encomendada}
                        onChange={(e) =>
                          handleQuantityChange(item.peca_id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 px-2 py-1 bg-gray-900 border border-gray-600 text-white rounded text-center"
                      />
                      <span className="text-white font-medium w-20 text-right">
                        €{(item.quantidade_encomendada * item.preco_unitario).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.peca_id)}
                        className="p-1 text-red-400 hover:bg-red-900/50 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Total:</span>
                <span className="text-white text-xl font-bold">€{total.toFixed(2)}</span>
              </div>
            </div>
          )}
          </>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
            {!success && (
              <>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Encomenda'}
            </button>
              </>
            )}
            {success && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors rounded"
              >
                Fechar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EncomendaModal;
