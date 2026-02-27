"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CriarFaturaModal from "@/components/CriarFaturaModal";

interface Invoice {
  id: number;
  numero_fatura: string;
  cliente_id: number;
  ordem_trabalho_ref?: string;
  cliente_nome?: string;
  cliente_nif?: string;
  veiculo_marca?: string;
  veiculo_modelo?: string;
  veiculo_matricula?: string;
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  estado: 'pendente' | 'parcial' | 'paga' | 'vencida' | 'cancelada';
  notas?: string;
}




const ITEMS_PER_PAGE = 20;

export default function FaturacaoPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar faturas da API
  useEffect(() => {
    carregarFaturas();
  }, []);

  const carregarFaturas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faturas');
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fazer download de PDF
  const handleDownloadPDF = async (faturalId: number, numeroFatura: string) => {
    try {
      const response = await fetch(`/api/faturas/${faturalId}/pdf`);
      if (!response.ok) throw new Error('Erro ao gerar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${numeroFatura}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Erro ao fazer download da fatura');
      console.error(error);
    }
  };

  // Marcar fatura como paga
  const handleMarcarPaga = async (faturalId: number) => {
    try {
      const response = await fetch(`/api/faturas/${faturalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marcar_paga: true })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Marcar Paga] Resposta:', data);
        
        // Atualizar a grelha imediatamente
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === faturalId 
              ? { ...inv, estado: 'paga' } 
              : inv
          )
        );
        
        // Depois recarregar para garantir sincronização
        setTimeout(() => carregarFaturas(), 500);
        alert('Fatura marcada como paga com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Falha ao marcar como paga'}`);
        console.error('[Marcar Paga] Erro:', errorData);
      }
    } catch (error) {
      alert('Erro ao marcar fatura como paga');
      console.error('[Marcar Paga] Exception:', error);
    }
  };

  // Anular fatura
  const handleAnularFatura = async (faturalId: number, numeroFatura: string) => {
    if (confirm(`Tem a certeza que deseja anular a fatura ${numeroFatura}?`)) {
      try {
        const response = await fetch(`/api/faturas/${faturalId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          carregarFaturas();
          alert('Fatura anulada com sucesso!');
        }
      } catch (error) {
        alert('Erro ao anular fatura');
        console.error(error);
      }
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === "" ||
      (invoice.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.cliente_nif?.includes(searchTerm)) ||
      (invoice.numero_fatura.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.ordem_trabalho_ref?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.veiculo_matricula?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "" || invoice.estado === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === "todos") return true;

      // Parse date from ISO format or DD/MM/YYYY format
      let invoiceDate: Date;
      if (invoice.data_emissao) {
        invoiceDate = new Date(invoice.data_emissao);
      } else {
        return true;
      }

      const now = new Date();

      if (dateFilter === "ultimo_mes") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return invoiceDate >= lastMonth;
      } else if (dateFilter === "ultimos_3_meses") {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return invoiceDate >= threeMonthsAgo;
      } else if (dateFilter === "ultimos_6_meses") {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return invoiceDate >= sixMonthsAgo;
      } else if (dateFilter === "intervalo_personalizado") {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return invoiceDate >= start && invoiceDate <= end;
      }

      return true;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calcular totais para os stats
  // Total faturado: todas as faturas (independente do status) com os filtros de pesquisa e data
  const invoicesForStats = invoices.filter(invoice => {
    const matchesSearch = searchTerm === "" ||
      (invoice.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.cliente_nif?.includes(searchTerm)) ||
      (invoice.numero_fatura.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.ordem_trabalho_ref?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = (() => {
      if (dateFilter === "todos") return true;

      let invoiceDate: Date;
      if (invoice.data_emissao) {
        invoiceDate = new Date(invoice.data_emissao);
      } else {
        return true;
      }

      const now = new Date();

      if (dateFilter === "ultimo_mes") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return invoiceDate >= lastMonth;
      } else if (dateFilter === "ultimos_3_meses") {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return invoiceDate >= threeMonthsAgo;
      } else if (dateFilter === "ultimos_6_meses") {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return invoiceDate >= sixMonthsAgo;
      } else if (dateFilter === "intervalo_personalizado") {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return invoiceDate >= start && invoiceDate <= end;
      }

      return true;
    })();

    return matchesSearch && matchesDate;
  });

  const totalFaturado = invoicesForStats
    .filter(inv => inv.estado === 'paga')
    .reduce((sum, inv) => sum + inv.valor_total, 0);
  const totalPendente = invoicesForStats
    .filter(inv => inv.estado === 'pendente')
    .reduce((sum, inv) => sum + inv.valor_total, 0);
  const countPendente = invoicesForStats.filter(inv => inv.estado === 'pendente').length;

  // Paginação
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paga':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'pendente':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'parcial':
        return 'bg-orange-900 text-orange-200 border-orange-700';
      case 'vencida':
        return 'bg-red-900 text-red-200 border-red-700';
      case 'cancelada':
        return 'bg-gray-800 text-gray-300 border-gray-700';
      default:
        return 'bg-gray-900 text-gray-200 border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paga':
        return 'PAGA';
      case 'pendente':
        return 'PENDENTE';
      case 'parcial':
        return 'PARCIAL';
      case 'vencida':
        return 'VENCIDA';
      case 'cancelada':
        return 'CANCELADA';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="faturacao" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Faturação</h2>
            <p className="mt-1 text-gray-400">Gestão de faturas e pagamentos</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none flex items-center shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nova Fatura
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Faturado</h3>
            <p className="mt-2 text-3xl font-bold text-gray-100">€{totalFaturado.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{filteredInvoices.length} faturas</p>
          </div>
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Pendente</h3>
            <p className="mt-2 text-3xl font-bold text-brand-yellow">€{totalPendente.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{countPendente} {countPendente === 1 ? 'fatura' : 'faturas'} em aberto</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-gray-700 border border-gray-600 p-4 mb-6 rounded-none flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por cliente, NIF, matrícula, nº fatura ou ordem trabalho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-4 py-2"
            >
              <option value="">Todos os Status</option>
              <option value="paga">Paga</option>
              <option value="pendente">Pendente</option>
              <option value="parcial">Parcial</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-4 py-2"
              >
                <option value="todos">Todos</option>
                <option value="ultimo_mes">Último mês</option>
                <option value="ultimos_3_meses">Últimos 3 meses</option>
                <option value="ultimos_6_meses">Últimos 6 meses</option>
                <option value="intervalo_personalizado">Intervalo personalizado</option>
              </select>
              {dateFilter === "intervalo_personalizado" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Data inicial"
                    className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Data final"
                    className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                    <tr>
                      <th scope="col" className="px-6 py-3">Fatura Nº</th>
                      <th scope="col" className="px-6 py-3">Ordem Trabalho</th>
                      <th scope="col" className="px-6 py-3">Veículo</th>
                      <th scope="col" className="px-6 py-3">Cliente</th>
                      <th scope="col" className="px-6 py-3">Data Emissão</th>
                      <th scope="col" className="px-6 py-3">Vencimento</th>
                      <th scope="col" className="px-6 py-3 text-right">Valor Total</th>
                      <th scope="col" className="px-6 py-3 text-center">Status</th>
                      <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                          {invoices.length === 0 ? 'Nenhuma fatura encontrada' : 'Nenhuma fatura corresponde aos filtros'}
                        </td>
                      </tr>
                    ) : (
                      paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-600 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-200 font-mono">{invoice.numero_fatura}</td>
                          <td className="px-6 py-4 text-gray-200 font-mono">{invoice.ordem_trabalho_ref || '-'}</td>
                          <td className="px-6 py-4 text-gray-200 font-mono">
                            {invoice.veiculo_marca || invoice.veiculo_modelo || invoice.veiculo_matricula ? (
                              <div>
                                <div className="flex gap-2">
                                  {invoice.veiculo_marca && <span className="font-bold">{invoice.veiculo_marca}</span>}
                                  {invoice.veiculo_modelo && <span>{invoice.veiculo_modelo}</span>}
                                </div>
                                {invoice.veiculo_matricula && <div className="text-xs text-gray-500">{invoice.veiculo_matricula}</div>}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-100">
                            <div>{invoice.cliente_nome}</div>
                            <div className="text-xs text-gray-500">NIF: {invoice.cliente_nif}</div>
                          </td>
                          <td className="px-6 py-4">
                            {invoice.data_emissao ? new Date(invoice.data_emissao).toLocaleDateString('pt-PT') : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            {invoice.data_vencimento ? new Date(invoice.data_vencimento).toLocaleDateString('pt-PT') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-200">€{invoice.valor_total.toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs font-bold border ${getStatusColor(invoice.estado)}`}>
                              {getStatusText(invoice.estado)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center flex justify-center gap-2">
                            <button 
                              onClick={() => handleDownloadPDF(invoice.id, invoice.numero_fatura)}
                              className="text-gray-400 hover:text-brand-yellow transition-colors" 
                              title="Download PDF"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                              </svg>
                            </button>
                            {invoice.estado === 'pendente' && (
                              <button 
                                onClick={() => handleMarcarPaga(invoice.id)}
                                className="text-gray-400 hover:text-green-400 transition-colors" 
                                title="Marcar como paga"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredInvoices.length > 0 && (
                <div className="bg-gray-800 px-4 py-3 border-t border-gray-600 flex items-center justify-between sm:px-6">
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredInvoices.length)}</span> de <span className="font-medium text-gray-200">{filteredInvoices.length}</span> faturas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-400 px-3">
                        Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal Nova Fatura */}
      <CriarFaturaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => carregarFaturas()}
      />
    </div>
  );
}
