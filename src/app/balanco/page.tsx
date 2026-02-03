"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

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

const mockBalanceData: BalanceProcess[] = [
  {
    id: 'C2045',
    matricula: '45-GH-23',
    cliente: 'João Silva',
    dataConclusao: '2024-10-15',
    valorEntrada: 450.00,
    gastoPecas: 180.50,
    maoObra: 120.00,
    lucro: 149.50
  },
  {
    id: 'C1980',
    matricula: '12-AB-34',
    cliente: 'Maria Santos',
    dataConclusao: '2024-10-16',
    valorEntrada: 320.00,
    gastoPecas: 95.75,
    maoObra: 85.00,
    lucro: 139.25
  },
  {
    id: 'TVDE055',
    matricula: '98-XY-12',
    cliente: 'Pedro Costa',
    dataConclusao: '2024-10-18',
    valorEntrada: 680.00,
    gastoPecas: 245.30,
    maoObra: 180.00,
    lucro: 254.70
  },
  {
    id: 'C2046',
    matricula: '33-ZZ-44',
    cliente: 'Ana Oliveira',
    dataConclusao: '2024-10-20',
    valorEntrada: 275.00,
    gastoPecas: 67.90,
    maoObra: 95.00,
    lucro: 112.10
  },
  {
    id: 'TVDE056',
    matricula: '77-MM-88',
    cliente: 'Carlos Ferreira',
    dataConclusao: '2024-10-22',
    valorEntrada: 520.00,
    gastoPecas: 198.45,
    maoObra: 140.00,
    lucro: 181.55
  },
  {
    id: 'C2047',
    matricula: '55-PP-66',
    cliente: 'Sofia Martins',
    dataConclusao: '2024-10-25',
    valorEntrada: 395.00,
    gastoPecas: 125.80,
    maoObra: 110.00,
    lucro: 159.20
  },
  {
    id: 'C2048',
    matricula: '22-KK-99',
    cliente: 'Rui Alves',
    dataConclusao: '2024-10-28',
    valorEntrada: 750.00,
    gastoPecas: 320.25,
    maoObra: 195.00,
    lucro: 234.75
  },
  {
    id: 'TVDE057',
    matricula: '11-LL-00',
    cliente: 'Teresa Gomes',
    dataConclusao: '2024-10-30',
    valorEntrada: 290.00,
    gastoPecas: 78.60,
    maoObra: 85.00,
    lucro: 126.40
  }
];

export default function BalancoPage() {
  const [processes] = useState<BalanceProcess[]>(mockBalanceData);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = searchTerm === "" ||
      process.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.matricula.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = (() => {
      const now = new Date();
      const processDate = new Date(process.dataConclusao);

      if (dateFilter === "todos") return true;

      if (dateFilter === "ultimo_mes") {
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
    })();

    return matchesSearch && matchesDate;
  });

  const calculateTotals = (data: BalanceProcess[]) => {
    const totalEntradas = data.reduce((sum, item) => sum + item.valorEntrada, 0);
    const totalSaidas = data.reduce((sum, item) => sum + item.gastoPecas, 0);
    const saldoLiquido = totalEntradas - totalSaidas;

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido
    };
  };

  const totals = calculateTotals(filteredProcesses);

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
            <h3 className="text-sm font-medium text-gray-400 uppercase">Entradas Totais</h3>
            <p className="mt-2 text-3xl font-bold text-green-400">€{totals.totalEntradas.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Receitas dos serviços</p>
          </div>
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Saídas Totais</h3>
            <p className="mt-2 text-3xl font-bold text-red-400">€{totals.totalSaidas.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Custos com peças e mão de obra</p>
          </div>
          <div className="bg-gray-700 border border-gray-600 p-6 rounded-none">
            <h3 className="text-sm font-medium text-gray-400 uppercase">Saldo Líquido</h3>
            <p className={`mt-2 text-3xl font-bold ${totals.saldoLiquido >= 0 ? 'text-brand-yellow' : 'text-red-400'}`}>
              €{totals.saldoLiquido.toFixed(2)}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
            />
          </div>
        </div>

        {/* Balance Table */}
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
                  filteredProcesses.map((process) => (
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
          <div className="bg-gray-800 px-4 py-3 border-t border-gray-600 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  A mostrar <span className="font-medium text-gray-200">1</span> a <span className="font-medium text-gray-200">{filteredProcesses.length}</span> de <span className="font-medium text-gray-200">{processes.length}</span> processos
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
    </div>
  );
}
