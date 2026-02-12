"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface Invoice {
  id: string;
  number: string;
  processNumber: string;
  licensePlate: string;
  client: string;
  nif: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: 'pago' | 'pendente' | 'anulado';
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "FT 2024/00123",
    processNumber: "C1234",
    licensePlate: "AA-11-BB",
    client: "João Silva",
    nif: "234567890",
    issueDate: "28/10/2024",
    dueDate: "28/11/2024",
    total: 153.75,
    status: "pago"
  },
  {
    id: "2",
    number: "FT 2024/00124",
    processNumber: "C1235",
    licensePlate: "CC-22-DD",
    client: "Ana Costa",
    nif: "198765432",
    issueDate: "29/10/2024",
    dueDate: "29/11/2024",
    total: 450.00,
    status: "pendente"
  }
];

export default function FaturacaoPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === "" ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.nif.includes(searchTerm) ||
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || invoice.status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === "todos") return true;

      // Parse date from DD/MM/YYYY format
      const parts = invoice.issueDate.split('/').map(Number);
      const day = parts[0] || 1;
      const month = parts[1] || 1;
      const year = parts[2] || new Date().getFullYear();
      const invoiceDate = new Date(year, month - 1, day);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'pendente':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'anulado':
        return 'bg-red-900 text-red-200 border-red-700';
      default:
        return 'bg-gray-900 text-gray-200 border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago':
        return 'PAGO';
      case 'pendente':
        return 'PENDENTE';
      case 'anulado':
        return 'ANULADO';
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
            <h3 className="text-sm font-medium text-gray-400 uppercase">Faturado (Mês)</h3>
            <p className="mt-2 text-3xl font-bold text-gray-100">€12,450.00</p>
            <p className="text-xs text-green-400 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              +12% vs mês anterior
            </p>
          </div>
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Pendente</h3>
            <p className="mt-2 text-3xl font-bold text-brand-yellow">€3,200.00</p>
            <p className="text-xs text-gray-400 mt-1">5 faturas em aberto</p>
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
              placeholder="Pesquisar por cliente, NIF ou nº fatura..."
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
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="anulado">Anulado</option>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                <tr>
                  <th scope="col" className="px-6 py-3">Fatura Nº</th>
                  <th scope="col" className="px-6 py-3">N. Proc.</th>
                  <th scope="col" className="px-6 py-3">Matrícula</th>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Data Emissão</th>
                  <th scope="col" className="px-6 py-3">Vencimento</th>
                  <th scope="col" className="px-6 py-3 text-right">Valor Total</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-200 font-mono">{invoice.number}</td>
                    <td className="px-6 py-4 font-mono text-brand-yellow">{invoice.processNumber}</td>
                    <td className="px-6 py-4 font-mono">{invoice.licensePlate}</td>
                    <td className="px-6 py-4 text-gray-100">
                      <div>{invoice.client}</div>
                      <div className="text-xs text-gray-500">NIF: {invoice.nif}</div>
                    </td>
                    <td className="px-6 py-4">{invoice.issueDate}</td>
                    <td className="px-6 py-4">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-200">€{invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-brand-yellow transition-colors mx-1" title="Ver">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-brand-yellow transition-colors mx-1" title="Download PDF">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-800 px-4 py-3 border-t border-gray-600 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  A mostrar <span className="font-medium text-gray-200">1</span> a <span className="font-medium text-gray-200">{filteredInvoices.length}</span> de <span className="font-medium text-gray-200">{invoices.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button aria-current="page" className="z-10 bg-brand-yellow border-brand-yellow text-gray-900 relative inline-flex items-center px-4 py-2 border text-sm font-bold">1</button>
                  <button className="bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</button>
                  <button className="bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</button>
                  <button className="relative inline-flex items-center px-2 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                    <span className="sr-only">Seguinte</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Nova Fatura */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 w-full max-w-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-2">Nova Fatura</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
                  <select className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none">
                    <option>Selecione um cliente...</option>
                    <option>João Silva</option>
                    <option>Ana Costa</option>
                    <option>Empresa Transportes Lda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none">
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">N. Processo</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600" placeholder="Ex: C1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Matrícula</label>
                  <input type="text" className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600" placeholder="AA-00-BB" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data Emissão</label>
                  <input type="date" className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Vencimento</label>
                  <input type="date" className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Itens / Serviços</label>
                <textarea rows={3} className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600" placeholder="Descrição dos serviços ou peças..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Valor Total (€)</label>
                  <input type="number" step="0.01" className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow outline-none placeholder-gray-600" placeholder="0.00" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none">Criar Fatura</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
