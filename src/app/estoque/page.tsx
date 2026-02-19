'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

interface StockSummary {
  resumo: {
    pecas_em_risco_count: number;
    encomendas_pendentes_count: number;
    encomendas_atrasadas_count: number;
    alertas_nao_lidos: number;
    valor_pendente: number;
    valor_total_stock: number;
  };
  pecas_em_risco: Array<{
    id: string;
    nome: string;
    quantidade_stock: number;
    nivel_stock_minimo: number;
    preco: number;
  }>;
  encomendas_pendentes: Array<{
    id: string;
    numero_encomenda: string;
    fornecedor_nome: string;
    estado: string;
    dias_atraso: number;
    custo_total: number;
  }>;
  consumo_30_dias: Array<{
    peca_id: string;
    peca_nome: string;
    quantidade_consumida: number;
    preco_unitario: number;
  }>;
  tendencias: {
    valor_bloqueado: number;
    itens_sem_stock: number;
  };
}

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  severidade: string;
  lido: boolean;
  criado_em: string;
}

export default function EstoquePage() {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryRes, alertasRes] = await Promise.all([
        fetch('/api/estoque/resumo'),
        fetch('/api/alertas?apenas_nao_lidos=true'),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (alertasRes.ok) {
        const data = await alertasRes.json();
        setAlertas(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const markAlertAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/alertas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lido: true }),
      });

      if (response.ok) {
        setAlertas(alertas.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/50 border-red-700 text-red-400';
      case 'warning':
        return 'bg-yellow-900/50 border-yellow-700 text-yellow-400';
      case 'normal':
      default:
        return 'bg-blue-900/50 border-blue-700 text-blue-400';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !summary) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Estoque</h1>
              <p className="text-gray-400">Visão geral do inventário e encomendas</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold rounded hover:bg-yellow-400 transition-colors"
            >
              ↻ Atualizar
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-400 p-4 rounded">
              {error}
            </div>
          )}

          {/* KPI Cards */}
          {summary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Peças em Risco */}
                <div className="bg-gradient-to-br from-red-900/40 to-red-900/20 border border-red-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Peças em Risco</p>
                      <p className="text-3xl font-bold text-red-400 mt-2">
                        {summary.resumo.pecas_em_risco_count}
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-red-600/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                </div>

                {/* Encomendas Pendentes */}
                <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-900/20 border border-yellow-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Encomendas Pendentes</p>
                      <p className="text-3xl font-bold text-yellow-400 mt-2">
                        {summary.resumo.encomendas_pendentes_count}
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-yellow-600/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-. 9-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.17 13.95l.5 1H19v2H7l-6-11H2V2h3l6 11zm.84-2h7.99l2.34-7H6.51l1.5 7z" />
                    </svg>
                  </div>
                </div>

                {/* Encomendas Atrasadas */}
                <div className="bg-gradient-to-br from-orange-900/40 to-orange-900/20 border border-orange-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Encomendas Atrasadas</p>
                      <p className="text-3xl font-bold text-orange-400 mt-2">
                        {summary.resumo.encomendas_atrasadas_count}
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-orange-600/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                  </div>
                </div>

                {/* Valor Total em Stock */}
                <div className="bg-gradient-to-br from-green-900/40 to-green-900/20 border border-green-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Valor Total Stock</p>
                      <p className="text-2xl font-bold text-green-400 mt-2">
                        €{summary.resumo.valor_total_stock.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        + €{summary.resumo.valor_pendente.toFixed(2)} pendente
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-green-600/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Peças em Risco - Detailed */}
                <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Peças em Risco (Stock Baixo)</h2>

                  {summary.pecas_em_risco.length > 0 ? (
                    <div className="space-y-3">
                      {summary.pecas_em_risco.map(peca => (
                        <div
                          key={peca.id}
                          className="bg-gray-900/50 p-4 rounded border border-gray-700 hover:border-red-600/50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-semibold">{peca.nome}</p>
                              <p className="text-gray-400 text-sm">Mínimo: {peca.nivel_stock_minimo} un</p>
                            </div>
                            <p className="text-red-400 font-bold text-lg">{peca.quantidade_stock} un.</p>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                peca.quantidade_stock === 0
                                  ? 'bg-red-600'
                                  : peca.quantidade_stock <= peca.nivel_stock_minimo / 2
                                    ? 'bg-orange-500'
                                    : 'bg-yellow-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  (peca.quantidade_stock / peca.nivel_stock_minimo) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>
                              Custo unitário: €{peca.preco.toFixed(2)}
                            </span>
                            <span>
                              Valor em stock: €{(peca.quantidade_stock * peca.preco).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      Nenhuma peça em risco - Estoque saudável! ✓
                    </p>
                  )}
                </div>

                {/* Alerts Sidebar */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    Alertas ({alertas.length})
                  </h2>

                  {alertas.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {alertas.map(alerta => (
                        <div
                          key={alerta.id}
                          className={`p-3 rounded border ${getSeverityColor(alerta.severidade)}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{alerta.titulo}</p>
                              <p className="text-xs mt-1 opacity-75">{alerta.descricao}</p>
                              <p className="text-xs mt-2 opacity-50">{formatDate(alerta.criado_em)}</p>
                            </div>
                            <button
                              onClick={() => markAlertAsRead(alerta.id)}
                              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                              title="Marcar como lido"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8 text-sm">
                      Sem alertas não lidos!
                    </p>
                  )}
                </div>
              </div>

              {/* Encomendas Pendentes */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Encomendas Pendentes</h2>

                {summary.encomendas_pendentes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-900/50 border-b border-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-400">Nº Encomenda</th>
                          <th className="px-4 py-2 text-left text-gray-400">Fornecedor</th>
                          <th className="px-4 py-2 text-left text-gray-400">Estado</th>
                          <th className="px-4 py-2 text-right text-gray-400">Dias Atraso</th>
                          <th className="px-4 py-2 text-right text-gray-400">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.encomendas_pendentes.map(enc => (
                          <tr key={enc.id} className="border-b border-gray-700 hover:bg-gray-900/30">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-white">{enc.numero_encomenda}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-300">{enc.fornecedor_nome}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded ${
                                  enc.estado === 'pendente'
                                    ? 'bg-yellow-900/50 text-yellow-400'
                                    : 'bg-blue-900/50 text-blue-400'
                                }`}
                              >
                                {enc.estado}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-semibold ${
                              enc.dias_atraso > 0 ? 'text-red-400' : 'text-gray-300'
                            }`}>
                              {enc.dias_atraso > 0 ? `${enc.dias_atraso}d` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-white">
                              €{enc.custo_total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Nenhuma encomenda pendente</p>
                )}
              </div>

              {/* Top Consumed Parts */}
              {summary.consumo_30_dias.length > 0 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Peças Mais Utilizadas (últimos 30 dias)</h2>

                  <div className="space-y-4">
                    {summary.consumo_30_dias.slice(0, 5).map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-300">{item.peca_nome}</span>
                          <span className="text-white font-semibold">{item.quantidade_consumida} un.</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{
                              width: `${(item.quantidade_consumida / Math.max(...summary.consumo_30_dias.map(c => c.quantidade_consumida))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Custo: €{(item.quantidade_consumida * item.preco_unitario).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
