"use client";

import React, { useState, useEffect } from 'react';

interface OrdemTrabalho {
  ordem_trabalho_id: number;
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
  cliente_nome: string;
  cliente_morada: string;
  cliente_cidade: string;
  cliente_pais: string;
  cliente_codigo_postal: string;
  data_emissao: string;
  data_vencimento: string;
  subtotal: number;
  percentual_imposto: number;
  valor_desconto: number;
  valor_total: number;
  notas: string;
}

interface CriarFaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  oauthToken?: string;
}

const formatDateSafe = (value: unknown): string => {
  if (!value) return 'N/A';

  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === 'invalid date' || raw.toLowerCase() === 'null') return 'N/A';

  // Remove aspas quando vier serializado como string
  const unquoted = raw.replace(/^['\"]|['\"]$/g, '');

  // Atalho para formatos baseados em YYYY-MM-DD (com ou sem hora)
  const leadingIsoDate = unquoted.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (leadingIsoDate) {
    const [, yyyy, mm, dd] = leadingIsoDate;
    return `${dd}/${mm}/${yyyy}`;
  }

  // Suporta timestamp numérico (ms desde epoch)
  if (/^\d{10,13}$/.test(unquoted)) {
    const millis = unquoted.length === 10 ? Number(unquoted) * 1000 : Number(unquoted);
    const parsedTs = new Date(millis);
    return Number.isNaN(parsedTs.getTime()) ? 'N/A' : parsedTs.toLocaleDateString('pt-PT');
  }

  // Suporta formato ISO curto: yyyy-mm-dd
  const isoShortMatch = unquoted.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoShortMatch) {
    const [, yyyy, mm, dd] = isoShortMatch;
    const parsedIso = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(parsedIso.getTime()) ? 'N/A' : parsedIso.toLocaleDateString('pt-PT');
  }

  // Suporta formato PT: dd/mm/yyyy
  const ptMatch = unquoted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ptMatch) {
    const [, dd, mm, yyyy] = ptMatch;
    const parsedPt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(parsedPt.getTime()) ? 'N/A' : parsedPt.toLocaleDateString('pt-PT');
  }

  // Suporta formato: dd-mm-yyyy
  const dashPtMatch = unquoted.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashPtMatch) {
    const [, dd, mm, yyyy] = dashPtMatch;
    const parsedPtDash = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(parsedPtDash.getTime()) ? 'N/A' : parsedPtDash.toLocaleDateString('pt-PT');
  }

  // Suporta formato: yyyy/mm/dd
  const slashIsoMatch = unquoted.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slashIsoMatch) {
    const [, yyyy, mm, dd] = slashIsoMatch;
    const parsedSlash = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(parsedSlash.getTime()) ? 'N/A' : parsedSlash.toLocaleDateString('pt-PT');
  }

  // Suporta formato SQL: yyyy-mm-dd hh:mm:ss
  const sqlDateTimeMatch = unquoted.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (sqlDateTimeMatch) {
    const [, yyyy, mm, dd, hh, mi, ss = '0'] = sqlDateTimeMatch;
    const parsedSql = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(mi),
      Number(ss)
    );
    return Number.isNaN(parsedSql.getTime()) ? 'N/A' : parsedSql.toLocaleDateString('pt-PT');
  }

  const parsed = new Date(unquoted);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString('pt-PT');
};

export default function CriarFaturaModal({ isOpen, onClose, onSuccess, oauthToken }: CriarFaturaModalProps) {
  const [step, setStep] = useState<'selecionar_ordem' | 'preencher_dados'>('selecionar_ordem');
  const [ordensTrabalho, setOrdensTrabalho] = useState<OrdemTrabalho[]>([]);
  const [ordensLoading, setOrdensLoading] = useState(false);
  const [veiculoInfo, setVeiculoInfo] = useState<VeiculoInfo>({});
  const [formData, setFormData] = useState<FaturaFormData>({
    cliente_id: '',
    ordem_trabalho_id: '',
    cliente_nif: '',
    cliente_nome: '',
    cliente_morada: '',
    cliente_cidade: '',
    cliente_pais: '',
    cliente_codigo_postal: '',
    data_emissao: new Date().toISOString().split('T')[0] || '',
    data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    subtotal: 0,
    percentual_imposto: 23,
    valor_desconto: 0,
    valor_total: 0,
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugJson, setDebugJson] = useState('');
  const [itens, setItens] = useState<any[]>([]);

  const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const getOrdemTrabalhoId = (ordem: OrdemTrabalho) => ordem.ordem_trabalho_id;

  // Carregar ordens de trabalho
  useEffect(() => {
    if (isOpen) {
      carregarOrdensTrabalho();
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

  const handleSelecionarOrdem = async (ordem: OrdemTrabalho) => {
    setLoading(true);
    try {
      const ordemTrabalhoId = getOrdemTrabalhoId(ordem);
      const response = await fetch('/api/faturas/ordens-trabalho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordem_trabalho_id: ordemTrabalhoId })
      });

      const data = await response.json();
      if (data.success) {
        const dados = data.data;
        setVeiculoInfo({
          marca: dados.veiculo_marca,
          modelo: dados.veiculo_modelo,
          matricula: dados.matricula
        });

        // Guardar itens para depois usar no envio para TOConline
        setItens(dados.itens || []);

        const novoSubtotal = round2(dados.total_mao_obra + dados.total_pecas);
        const novoPercentual = 23;
        const novoDesconto = round2(dados.total_desconto);
        const novoImposto = round2(novoSubtotal * novoPercentual / 100);
        const novoTotal = round2(novoSubtotal + novoImposto - novoDesconto);

        // Construir descrição com itens da ordem de trabalho
        let descricao = '';
        if (dados.itens && Array.isArray(dados.itens) && dados.itens.length > 0) {
          descricao = dados.itens.map((item: any) => {
            const tipo = item.tipo === 'servico' ? 'Serviço' : 'Peça';
            return `${tipo}: ${item.descricao} (${item.quantidade}x €${item.preco_unitario.toFixed(2)} = €${item.valor_total.toFixed(2)})`;
          }).join('\n');
        } else {
          descricao = dados.trabalho_realizado || 'Serviços de reparação automóvel';
        }

        setFormData({
          cliente_id: dados.cliente_id,
          ordem_trabalho_id: ordemTrabalhoId,
          cliente_nif: dados.cliente_nif || '',
          cliente_nome: dados.cliente_nome || '',
          cliente_morada: dados.cliente_morada || '',
          cliente_cidade: dados.cliente_cidade || '',
          cliente_pais: dados.cliente_pais || '',
          cliente_codigo_postal: dados.cliente_codigo_postal || '',
          data_emissao: new Date().toISOString().split('T')[0] || '',
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
          subtotal: novoSubtotal,
          percentual_imposto: novoPercentual,
          valor_desconto: novoDesconto,
          valor_total: novoTotal,
          notas: descricao
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
    const isNumericField = name.includes('percentual') || name.includes('valor') || name.includes('subtotal');
    const parsedValue = isNumericField ? parseFloat(value) || 0 : value;

    // Calcular o total ao mesmo tempo que atualiza o estado
    setFormData(prev => {
      const updated = { ...prev, [name]: parsedValue };
      
      // Recalcular total se um dos campos relevantes mudou
      if (name === 'subtotal' || name === 'percentual_imposto' || name === 'valor_desconto') {
        const valorImposto = round2(updated.subtotal * updated.percentual_imposto / 100);
        updated.valor_total = round2(updated.subtotal + valorImposto - updated.valor_desconto);
      }
      
      return updated;
    });
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

    // Validar se temos token OAuth2
    if (!oauthToken) {
      setError('⚠️ Token OAuth2 não encontrado. Por favor, autentique-se primeiro clicando no botão "Autenticar" no topo da página.');
      setLoading(false);
      return;
    }

    // Monta o JSON no formato TOConline
    const lines = itens && itens.length > 0
      ? itens.map((item: any) => ({
          description: `${item.descricao}`,
          unit_price: item.preco_unitario.toFixed(2),
          quantity: item.quantidade.toString(),
          tax_code: 'NOR'
        }))
      : [
          {
            description: formData.notas || 'Serviço/Produto',
            unit_price: formData.subtotal.toFixed(2),
            quantity: '1',
            tax_code: 'NOR'
          }
        ];

    const jsonFatura = {
      document_type: 'FT',
      customer_business_name: formData.cliente_nome ? formData.cliente_nome : 'Consumidor Final',
      customer_tax_registration_number: formData.cliente_nif || '',
      customer_address_detail: formData.cliente_morada || '',
      customer_city: formData.cliente_cidade || '',
      customer_country: formData.cliente_pais || '',
      customer_postcode: formData.cliente_codigo_postal || '',
      lines: lines
    };

    // Confirmação antes de enviar para TOConline
    if (window.confirm('Deseja enviar os dados para o TOConline?')) {
      try {
        const requestBody: any = {
          payload: jsonFatura,
          percentual_imposto: formData.percentual_imposto,
          subtotal: formData.subtotal,
          valor_desconto: formData.valor_desconto,
          ordem_trabalho_id: formData.ordem_trabalho_id || null,
          accessToken: oauthToken
        };

        console.log('\n══════════════════════════════════════════════════════');
        console.log('📤 [TOCONLINE] DADOS ENVIADOS PELO FRONTEND:');
        console.log('   jsonFatura (payload para TOConline):');
        console.log(JSON.stringify(jsonFatura, null, 2));
        console.log('   Metadados da fatura:');
        console.log('     percentual_imposto:', formData.percentual_imposto);
        console.log('     subtotal:', formData.subtotal);
        console.log('     valor_desconto:', formData.valor_desconto);
        console.log('     ordem_trabalho_id:', formData.ordem_trabalho_id || null);
        console.log('══════════════════════════════════════════════════════\n');

        console.log('✅ Usando access_token existente');
        console.log('   Comprimento:', oauthToken.length);
        console.log('   Primeiros 20 chars:', oauthToken.substring(0, 20) + '...');
        console.log('   Últimos 10 chars:', '...' + oauthToken.substring(oauthToken.length - 10));

        const response = await fetch('/api/fatura-simplificada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        if (data.success) {
          alert('Fatura criada com sucesso!');
          handleClose();
          onSuccess?.();
        } else {
          setError(data.error || 'Erro ao criar fatura');
          setDebugJson(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        setError('Erro ao criar fatura');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('selecionar_ordem');
    setVeiculoInfo({});
    setItens([]);
    setFormData({
      cliente_id: '',
      ordem_trabalho_id: '',
      cliente_nif: '',
      cliente_nome: '',
      cliente_morada: '',
      cliente_cidade: '',
      cliente_pais: '',
      cliente_codigo_postal: '',
      data_emissao: new Date().toISOString().split('T')[0] || '',
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      subtotal: 0,
      percentual_imposto: 23,
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
          <div>
            <h3 className="text-xl font-bold text-gray-100">
              {step === 'selecionar_ordem' ? 'Selecione uma Ordem de Trabalho' : 'Nova Fatura'}
            </h3>
            {/* Indicador de Status do Token */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${oauthToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs ${oauthToken ? 'text-green-400' : 'text-red-400'}`}>
                {oauthToken ? 'Autenticado' : 'Não autenticado - clique em "Autenticar" no topo da página'}
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div
            className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-none text-sm cursor-pointer"
            onDoubleClick={() => alert(debugJson || error)}
          >
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
                    key={getOrdemTrabalhoId(ordem)}
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
                      <div className="text-gray-400 text-xs">{formatDateSafe(ordem.data_conclusao)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Cliente</label>
              <input
                type="text"
                name="cliente_nome"
                value={formData.cliente_nome || ''}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">NIF do Cliente</label>
              <input
                type="text"
                name="cliente_nif"
                value={formData.cliente_nif}
                onChange={handleInputChange}
                maxLength={20}
                inputMode="numeric"
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Morada</label>
              <input
                type="text"
                name="cliente_morada"
                value={formData.cliente_morada || ''}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cidade</label>
              <input
                type="text"
                name="cliente_cidade"
                value={formData.cliente_cidade || ''}
                onChange={handleInputChange}
                maxLength={50}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">País</label>
              <input
                type="text"
                name="cliente_pais"
                value={formData.cliente_pais || ''}
                onChange={handleInputChange}
                maxLength={50}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                autoComplete="country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Código Postal</label>
              <input
                type="text"
                name="cliente_codigo_postal"
                value={formData.cliente_codigo_postal || ''}
                onChange={handleInputChange}
                maxLength={20}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Imposto (IVA) (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="percentual_imposto"
                  value={formData.percentual_imposto}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Desconto (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_desconto"
                  value={formData.valor_desconto}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
            </div>

            <div className="bg-gray-900 p-4 border border-gray-700 rounded-none space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Subtotal:</span>
                <span>€{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Imposto ({formData.percentual_imposto.toFixed(2)}%):</span>
                <span>€{round2(formData.subtotal * formData.percentual_imposto / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Desconto:</span>
                <span>-€{formData.valor_desconto.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 flex justify-between items-center">
                <span className="text-gray-400 font-medium">Total:</span>
                <span className="text-2xl font-bold text-brand-yellow">€{formData.valor_total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                rows={6}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600 font-mono text-sm"
                placeholder="Detalhes dos serviços e peças..."
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
