"use client";

import React, { useState, useEffect } from 'react';

interface OrdemTrabalho {
  id: number;
  ref_ordem_trabalho: string;
  cliente_nome: string;
  cliente_nif: string;
  cliente_id: number;
  matricula: string;
  veiculo_marca?: string;
  veiculo_modelo?: string;
  veiculo_id?: number;
  total_geral: number;
  data_conclusao: string;
}

interface VeiculoInfo {
  marca?: string;
  modelo?: string;
  matricula?: string;
}

interface FaturaFormData {
  cliente_id: number | '';
  ordem_trabalho_id: number | '';
  cliente_nif: string;
  data_emissao: string;
  data_vencimento: string;
  subtotal: number;
  valor_imposto: number;
  valor_desconto: number;
  valor_total: number;
  notas: string;
}

interface CriarFaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CriarFaturaModal({ isOpen, onClose, onSuccess }: CriarFaturaModalProps) {
  const [step, setStep] = useState<'selecionar_ordem' | 'preencher_dados'>('selecionar_ordem');
  const [ordensTrabalho, setOrdensTrabalho] = useState<OrdemTrabalho[]>([]);
  const [ordensLoading, setOrdensLoading] = useState(false);
  const [veiculoInfo, setVeiculoInfo] = useState<VeiculoInfo>({});
  const [formData, setFormData] = useState<FaturaFormData>({
    cliente_id: '',
    ordem_trabalho_id: '',
    cliente_nif: '',
    data_emissao: new Date().toISOString().split('T')[0] || '',
    data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    subtotal: 0,
    valor_imposto: 0,
    valor_desconto: 0,
    valor_total: 0,
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proximo_numero, setProximoNumero] = useState('');

  const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

  // Carregar ordens de trabalho
  useEffect(() => {
    if (isOpen) {
      carregarOrdensTrabalho();
      carregarProximoNumero();
    }
  }, [isOpen]);

  const carregarOrdensTrabalho = async () => {
    setOrdensLoading(true);
    setError('');
    try {
      const response = await fetch('/api/faturas/ordens-trabalho');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setOrdensTrabalho(data.data);
        if (data.data.length === 0) {
          setError('Nenhuma ordem de trabalho concluída encontrada');
        }
      } else {
        setError(data.error || 'Erro ao carregar ordens de trabalho');
      }
    } catch (err) {
      console.error('Erro ao carregar ordens de trabalho:', err);
      setError('Erro ao carregar ordens de trabalho. Verifique a console.');
    } finally {
      setOrdensLoading(false);
    }
  };

  const carregarProximoNumero = async () => {
    try {
      const response = await fetch('/api/faturas/proximo-numero');
      const data = await response.json();
      if (data.success) {
        setProximoNumero(data.data.numero_fatura);
      }
    } catch (err) {
      console.error('Erro ao carregar número de fatura:', err);
    }
  };

  const handleSelecionarOrdem = async (ordem: OrdemTrabalho) => {
    setLoading(true);
    try {
      const response = await fetch('/api/faturas/ordens-trabalho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem_trabalho_id: ordem.id })
      });

      const data = await response.json();
      if (data.success) {
        const dados = data.data;
        setVeiculoInfo({
          marca: dados.veiculo_marca,
          modelo: dados.veiculo_modelo,
          matricula: dados.matricula
        });
        setFormData({
          cliente_id: dados.cliente_id,
          ordem_trabalho_id: ordem.id,
          cliente_nif: dados.cliente_nif || '',
          data_emissao: new Date().toISOString().split('T')[0] || '',
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
          subtotal: round2(dados.total_mao_obra + dados.total_pecas),
          valor_imposto: round2(dados.total_imposto),
          valor_desconto: round2(dados.total_desconto),
          valor_total: round2(dados.total_geral),
          notas: `Trabalho: ${dados.trabalho_realizado || 'Reparação'}`
        });
        setStep('preencher_dados');
      }
    } catch (err) {
      setError('Erro ao carregar dados da ordem de trabalho');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('valor') || name.includes('subtotal') ? parseFloat(value) || 0 : value
    }));

    // Recalcular total
    if (name === 'subtotal' || name === 'valor_imposto' || name === 'valor_desconto') {
      setTimeout(() => {
        const newSubtotal = name === 'subtotal' ? parseFloat(value) || 0 : formData.subtotal;
        const newImposto = name === 'valor_imposto' ? parseFloat(value) || 0 : formData.valor_imposto;
        const newDesconto = name === 'valor_desconto' ? parseFloat(value) || 0 : formData.valor_desconto;
        const total = round2(newSubtotal + newImposto - newDesconto);
        setFormData(prev => ({ ...prev, valor_total: total }));
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.cliente_nif.trim()) {
      setError('NIF do cliente é obrigatório');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/faturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert(`Fatura ${data.data.numero_fatura} criada com sucesso!`);
        handleClose();
        onSuccess?.();
      } else {
        setError(data.error || 'Erro ao criar fatura');
      }
    } catch (err) {
      setError('Erro ao criar fatura');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('selecionar_ordem');
    setVeiculoInfo({});
    setFormData({
      cliente_id: '',
      ordem_trabalho_id: '',
      cliente_nif: '',
      data_emissao: new Date().toISOString().split('T')[0] || '',
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      subtotal: 0,
      valor_imposto: 0,
      valor_desconto: 0,
      valor_total: 0,
      notas: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h3 className="text-xl font-bold text-gray-100">
            {step === 'selecionar_ordem' ? 'Selecione uma Ordem de Trabalho' : 'Nova Fatura'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-none text-sm">
            {error}
          </div>
        )}

        {step === 'selecionar_ordem' ? (
          <div>
            {ordensLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
              </div>
            ) : ordensTrabalho.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhuma ordem de trabalho concluída para faturar.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ordensTrabalho.map(ordem => (
                  <button
                    key={ordem.id}
                    onClick={() => handleSelecionarOrdem(ordem)}
                    disabled={loading}
                    className="w-full flex items-start justify-between p-4 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-none text-left transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-mono text-brand-yellow">{ordem.ref_ordem_trabalho}</div>
                      <div className="text-gray-300 text-sm">{ordem.cliente_nome}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        Matrícula: {ordem.matricula} | NIF: {ordem.cliente_nif}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-brand-yellow">
                        €{ordem.total_geral.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-xs">{new Date(ordem.data_conclusao).toLocaleDateString('pt-PT')}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-900 p-3 border border-gray-700 rounded-none text-sm">
              <div className="text-gray-400">Número da Fatura:</div>
              <div className="font-mono text-brand-yellow text-lg">{proximo_numero}</div>
            </div>

            <div className="bg-gray-900 p-3 border border-gray-700 rounded-none text-sm">
              <div className="text-gray-400 mb-2">Veículo:</div>
              <div className="text-white font-mono">
                {veiculoInfo.marca && veiculoInfo.modelo && veiculoInfo.matricula ? (
                  <div>
                    <div className="flex gap-2">
                      <span className="text-brand-yellow font-bold">{veiculoInfo.marca}</span>
                      <span className="text-gray-300">{veiculoInfo.modelo}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Matrícula: {veiculoInfo.matricula}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Nenhum veículo associado</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">NIF do Cliente</label>
              <input
                type="text"
                name="cliente_nif"
                value={formData.cliente_nif}
                onChange={handleInputChange}
                required
                maxLength={20}
                inputMode="numeric"
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data de Emissão</label>
                <input
                  type="date"
                  name="data_emissao"
                  value={formData.data_emissao}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  name="data_vencimento"
                  value={formData.data_vencimento}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subtotal (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="subtotal"
                  value={formData.subtotal}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Imposto (IVA) (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_imposto"
                  value={formData.valor_imposto}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
            </div>

            <div className="bg-gray-900 p-4 border border-gray-700 rounded-none">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Total:</span>
                <span className="text-2xl font-bold text-brand-yellow">€{formData.valor_total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Observações</label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600"
                placeholder="Adicione notas ou observações..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setStep('selecionar_ordem')}
                className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none disabled:opacity-50"
              >
                {loading ? 'A criar...' : 'Criar Fatura'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
