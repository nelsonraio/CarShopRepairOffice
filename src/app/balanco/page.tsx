"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { filterPredicates, useFetch, useFilters, usePagination } from "@/hooks";

interface BalanceProcess {
  id: string;
  matricula: string;
  cliente: string;
  dataConclusao: string;
  valorEntrada: number;
  gastoPecas: number;
  maoObra: number;
  lucro: number;
}

interface BalanceResponse {
  balances?: BalanceProcess[];
}

export default function BalancoPage() {
  const ITEMS_PER_PAGE = 20;

  const { data, loading, error } = useFetch<BalanceResponse>('/api/balanco?page=1&limit=100');
  const processes = data?.balances ?? [];

  const { filters, setFilter, filteredItems: searchFilteredProcesses } = useFilters<BalanceProcess>(
    processes,
    {
      search: filterPredicates.search(['id', 'matricula']),
    }
  );

  const [dateFilter, setDateFilter] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredProcesses = useMemo(() => {
    return searchFilteredProcesses.filter(process => {
      const now = new Date();
      const processDate = new Date(process.dataConclusao);

      if (dateFilter === "todos") return true;

      if (dateFilter === "hoje") {
        return processDate.toDateString() === now.toDateString();
      } else if (dateFilter === "ultimo_mes") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return processDate >= lastMonth;
      } else if (dateFilter === "ultimos_3_meses") {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return processDate >= threeMonthsAgo;
      } else if (dateFilter === "ultimos_6_meses") {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return processDate >= sixMonthsAgo;
      } else if (dateFilter === "intervalo_personalizado") {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return processDate >= start && processDate <= end;
      }

      return true;
    });
  }, [searchFilteredProcesses, dateFilter, startDate, endDate]);

  const calculateTotals = (data: BalanceProcess[]) => {
    const totalEntradas = data.reduce((sum, item) => sum + item.valorEntrada, 0);
    const totalSaidas = data.reduce((sum, item) => sum + item.gastoPecas, 0);
    const lucro = totalEntradas - totalSaidas;

    return {
      totalEntradas,
      totalSaidas,
      lucro
    };
  };

  const totals = calculateTotals(filteredProcesses);

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProcesses,
    prevPage,
    nextPage,
  } = usePagination(filteredProcesses, ITEMS_PER_PAGE, [filters.search, dateFilter, startDate, endDate]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const handleExport = () => {
    // In a real app, this would export the data
    console.log("Exporting balance data...");
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="balanco" />

      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Balanço</h2>
            <p className="mt-1 text-gray-400">Análise financeira dos processos de reparação</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-gray-300 rounded-none focus:ring-brand-yellow focus:border-brand-yellow px-4 py-2"
              >
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
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
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Exportar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Receita Total</h3>
            <p className="mt-2 text-3xl font-bold text-green-400">€{totals.totalEntradas.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Receitas dos serviços concluídos</p>
          </div>
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Gasto com Peças</h3>
            <p className="mt-2 text-3xl font-bold text-red-400">€{totals.totalSaidas.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Custo real das peças</p>
          </div>
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Lucro</h3>
            <p className={`mt-2 text-3xl font-bold ${totals.lucro >= 0 ? 'text-brand-yellow' : 'text-red-400'}`}>
              €{totals.lucro.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Lucro total do período</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-700 border border-gray-600 p-4 mb-6 rounded-none">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por ID processo ou matrícula..."
              value={filters.search || ""}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-200 p-4 rounded-none">
            Erro ao carregar balanço: {error}
          </div>
        )}

        {/* Balance Table */}
        {loading ? (
          <div className="bg-gray-700 border border-gray-600 rounded-none p-8 flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-brand-yellow mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">A carregar dados de balanço...</p>
            </div>
          </div>
        ) : processes.length === 0 ? (
          <div className="bg-gray-700 border border-gray-600 rounded-none p-8 text-center">
            <p className="text-gray-400">Nenhuma ordem de trabalho concluída encontrada.</p>
          </div>
        ) : (
          <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                  <tr>
                    <th scope="col" className="px-6 py-3">ID Processo</th>
                    <th scope="col" className="px-6 py-3">Matrícula</th>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3">Data Conclusão</th>
                    <th scope="col" className="px-6 py-3 text-right">Valor Entrada</th>
                    <th scope="col" className="px-6 py-3 text-right">Entrada com Mão de Obra</th>
                    <th scope="col" className="px-6 py-3 text-right">Gasto Peças</th>
                    <th scope="col" className="px-6 py-3 text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredProcesses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        Nenhum processo encontrado.
                      </td>
                    </tr>
                  ) : (
                    paginatedProcesses.map((process) => (
                      <tr key={process.id} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-200 font-mono">{process.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-200">{process.matricula}</td>
                        <td className="px-6 py-4 text-gray-100">{process.cliente}</td>
                        <td className="px-6 py-4 text-gray-400">{process.dataConclusao}</td>
                        <td className="px-6 py-4 text-right font-medium text-green-400">€{process.valorEntrada.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-green-400">€{process.maoObra.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-red-400">€{process.gastoPecas.toFixed(2)}</td>
                        <td className={`px-6 py-4 text-right font-medium ${process.lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          €{process.lucro.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filteredProcesses.length > 0 && (
              <div className="mt-4 bg-gray-700 px-4 py-3 border border-gray-600 flex items-center justify-between rounded">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      A mostrar <span className="font-medium text-gray-200">{startIndex + 1}</span> a <span className="font-medium text-gray-200">{Math.min(endIndex, filteredProcesses.length)}</span> de <span className="font-medium text-gray-200">{filteredProcesses.length}</span> processos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-3">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-gray-300 rounded border border-gray-500 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
