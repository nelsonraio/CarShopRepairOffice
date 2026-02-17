'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

interface BudgetItem {
  id: number;
  orcamento_id: number;
  tipo_item: string;
  servico_id: number | null;
  peca_id: number | null;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  valor_desconto: number;
  valor_imposto: number;
  valor_total: number;
  notas: string | null;
}

interface Budget {
  id: number;
  ref_orcamento: string;
  cliente: {
    nome: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    matricula: string;
  };
  data_emissao: string;
  total_geral: number;
  estado: string;
  itens_orcamento: BudgetItem[];
  mecanico_nome?: string;
}


const BudgetsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o modal de seleção de mecânico
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [mechanics, setMechanics] = useState<{id: string, nome: string}[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');
  const [selectedMechanicName, setSelectedMechanicName] = useState<string>('');
  const [pendingBudgetId, setPendingBudgetId] = useState<number | null>(null);
  const [pendingCurrentStatus, setPendingCurrentStatus] = useState<string>('');




  useEffect(() => {
    fetchBudgets();
  }, []);


  useEffect(() => {
    const filtered = budgets.filter(budget => {
      const matchesSearch =
        budget.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${budget.veiculo?.marca} ${budget.veiculo?.modelo} | ${budget.veiculo?.matricula}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.ref_orcamento?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === '' || budget.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredBudgets(filtered);
  }, [searchTerm, statusFilter, budgets]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orcamentos');
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      const data = await response.json();
      setBudgets(data.orcamentos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (!confirm('Tem certeza que deseja eliminar este orçamento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos?id=${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      // Remove from local state
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
    } catch (err) {
      alert('Erro ao eliminar orçamento: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'text-green-400 bg-green-900/30 border border-green-900';
      case 'Pendente': return 'text-yellow-400 bg-yellow-900/30 border border-yellow-900';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const updateBudgetStatus = (budgetId: number, newStatus: string, mechanicName?: string) => {
    setBudgets(prevBudgets => 
      prevBudgets.map(budget =>
        budget.id === budgetId 
          ? { 
              ...budget, 
              estado: newStatus, 
              // Only update mechanic name if explicitly provided, otherwise keep existing
              // When reverting to Pendente, we should clear the mechanic name
              mecanico_nome: mechanicName !== undefined ? mechanicName : (newStatus === 'Pendente' ? undefined : budget.mecanico_nome)
            } 
          : budget
      )
    );
  };


  const fetchMechanics = async () => {
    try {
      const response = await fetch('/api/mecanicos');
      if (!response.ok) {
        throw new Error('Failed to fetch mechanics');
      }
      const data = await response.json();
      setMechanics(data);
    } catch (err) {
      console.error('Error fetching mechanics:', err);
    }
  };

  const handleApproveBudget = async (budgetId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Aprovado' ? 'Pendente' : 'Aprovado';
    
    // Se estiver aprovar (não reverter), mostrar modal de seleção de mecânico
    if (newStatus === 'Aprovado') {
      setPendingBudgetId(budgetId);
      setPendingCurrentStatus(currentStatus);
      setSelectedMechanic('');
      setSelectedMechanicName('');
      await fetchMechanics();
      setShowMechanicModal(true);
      return;
    }


    // Se for reverter para Pendente, confirmar diretamente
    if (!confirm('Tem certeza que deseja reverter este orçamento para Pendente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos?id=${budgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to revert budget');
      }

      // Update local state
      updateBudgetStatus(budgetId, newStatus);
    } catch (err) {
      alert('Erro ao reverter orçamento: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const confirmApproveWithMechanic = async () => {
    if (!pendingBudgetId || !selectedMechanic) {
      alert('Por favor selecione um mecânico');
      return;
    }

    try {
      const response = await fetch(`/api/orcamentos?id=${pendingBudgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          estado: 'Aprovado',
          mecanico_id: parseInt(selectedMechanic)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve budget');
      }

      // Re-fetch budgets to get the mechanic name from the work order
      await fetchBudgets();
      
      // Fechar modal e limpar estados
      setShowMechanicModal(false);
      setSelectedMechanic('');
      setSelectedMechanicName('');
      setPendingBudgetId(null);
      setPendingCurrentStatus('');

    } catch (err) {
      alert('Erro ao aprovar orçamento: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };


  const handlePrintBudget = (budget: Budget) => {
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      // Gerar as linhas da tabela dinamicamente
      const rows = budget.itens_orcamento ? budget.itens_orcamento.map(item => `
      <tr>
        <td>${item.descricao}</td>
        <td>${item.quantidade}</td>
        <td>${item.valor_total.toFixed(2)}€</td>
      </tr>
    `).join('') : '<tr><td>-</td><td>-</td><td>-</td></tr>';


      // Se tiveres uma função para converter o total em extenso, podes usá-la aqui
      const totalExtenso = ""; // Ex: "Setenta e Nove Euros e Trinta e Seis Cêntimos"

      printWindow.document.write(`
      <html>
        <head>
          <title>Folha de Orçamento - ${budget.ref_orcamento}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
            
            /* Cabeçalho */
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo-section { display: flex; align-items: center; }
            .logo-section img { width: 70px; margin-right: 15px; }
            .company-name h1 { margin: 0; font-size: 20px; font-weight: bold; }
            .company-name p { margin: 0; font-size: 14px; }
            .contacts-section { text-align: right; font-size: 12px; line-height: 1.4; }

            /* Dados do Orçamento */
            .doc-info { margin-top: 10px; margin-bottom: 20px; line-height: 1.6; }
            .doc-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .client-details { font-size: 14px; }

            /* Tabela */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #666; color: #fff; border: 1px solid #000; padding: 10px; text-transform: uppercase; font-size: 13px; }
            td { border: 1px solid #000; padding: 10px; text-align: center; font-size: 13px; }
            td:first-child { text-align: left; width: 60%; }

            /* Total */
            .total-container { 
              margin-top: 20px; 
              border: 2px solid #000; 
              background-color: #e0e0e0; 
              padding: 8px; 
              font-weight: bold; 
              font-size: 14px;
            }

            /* Assinaturas */
            .signatures-section { margin-top: 50px; }
            .sig-block { margin-bottom: 40px; font-size: 12px; }
            .sig-line { border-bottom: 1px solid #000; width: 250px; margin-top: 35px; }
            
            @media print {
              body { margin: 20mm; }
              .total-container { -webkit-print-color-adjust: exact; }
              th { -webkit-print-color-adjust: exact; }
              img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }

          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <div style="background: white; padding: 5px; border-radius: 4px; display: inline-block; margin-right: 15px;">
                <img src="/logoblack.jpg" alt="MQAuto Logo" style="width: 50px; height: 50px; object-fit: contain; display: block;" />
              </div>
              <div class="company-name">
                <h1>MQ Auto</h1>
                <p>Oficina Automóvel</p>
              </div>
            </div>

            <div class="contacts-section">
              <p>(+351) 935 205 354</p>
              <p>montesquaresmalda@outlook.com</p>
            </div>
          </div>

          <div class="doc-info">
            <div class="doc-title">Folha de Orçamento: ${budget.ref_orcamento}</div>
            <div class="client-details">
              <p>Cliente: ${budget.cliente?.nome || ''}</p>
              <p>Matrícula: ${budget.veiculo?.matricula || ''}</p>
              <p>Data: ${new Date(budget.data_emissao).toLocaleDateString('pt-PT')}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DESCRIÇÃO / SERVIÇO</th>
                <th>QUANTIDADE</th>
                <th>VALOR</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>

          </table>

          <div class="total-container">
            TOTAL = ${budget.total_geral.toFixed(2)}€ ${totalExtenso ? `(${totalExtenso})` : ''}
          </div>

          <div class="signatures-section">
            <div class="sig-block">
              <p>Responsável pela Manutenção:</p>
              <div class="sig-line"></div>
            </div>
            <div class="sig-block">
              <p>Supervisor da Manutenção:</p>
              <div class="sig-line"></div>
            </div>
            <div class="sig-block">
              <p>Recebido por:</p>
              <div class="sig-line"></div>
            </div>
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();

      // Pequeno delay para garantir que o estilo é aplicado antes da impressão
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handlePrintWorkOrder = (budget: Budget, mechanicName?: string) => {
    console.log('Printing work order for budget:', budget);
    // Generate work order reference from budget reference (replace ORC with OT)
    const workOrderRef = budget.ref_orcamento.replace(/^ORC/, 'OT');

    // Open a new window with work order details for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Gerar as linhas da tabela dinamicamente (sem valores)
      const rows = budget.itens_orcamento ? budget.itens_orcamento.map(item => `
      <tr>
        <td>${item.descricao}</td>
        <td>${item.quantidade}</td>
        <td></td>
      </tr>
    `).join('') : '<tr><td>-</td><td>-</td><td></td></tr>';

      printWindow.document.write(`
      <html>
        <head>
          <title>Ordem de Trabalho - ${workOrderRef}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
            
            /* Cabeçalho */
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo-section { display: flex; align-items: center; }
            .logo-section img { width: 70px; margin-right: 15px; }
            .company-name h1 { margin: 0; font-size: 20px; font-weight: bold; }
            .company-name p { margin: 0; font-size: 14px; }
            .contacts-section { text-align: right; font-size: 12px; line-height: 1.4; }

            /* Dados da Ordem de Trabalho */
            .doc-info { margin-top: 10px; margin-bottom: 20px; line-height: 1.6; }
            .doc-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
            .client-details { font-size: 14px; }

            /* Tabela */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #666; color: #fff; border: 1px solid #000; padding: 10px; text-transform: uppercase; font-size: 13px; }
            td { border: 1px solid #000; padding: 10px; text-align: center; font-size: 13px; }
            td:first-child { text-align: left; width: 60%; }

            /* Mecânico */
            .mechanic-section { 
              margin-top: 30px; 
              border: 2px solid #000; 
              background-color: #f5f5f5; 
              padding: 15px; 
              font-size: 14px;
            }
            .mechanic-label { font-weight: bold; margin-bottom: 5px; }
            .mechanic-name { font-size: 16px; color: #333; }

            /* Assinaturas */
            .signatures-section { margin-top: 50px; }
            .sig-block { margin-bottom: 40px; font-size: 12px; }
            .sig-line { border-bottom: 1px solid #000; width: 250px; margin-top: 35px; }
            
            @media print {
              body { margin: 20mm; }
              th { -webkit-print-color-adjust: exact; }
              img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <div style="background: white; padding: 5px; border-radius: 4px; display: inline-block; margin-right: 15px;">
                <img src="/logoblack.jpg" alt="MQAuto Logo" style="width: 50px; height: 50px; object-fit: contain; display: block;" />
              </div>
              <div class="company-name">
                <h1>MQ Auto</h1>
                <p>Oficina Automóvel</p>
              </div>
            </div>
            <div class="contacts-section">
              <p>(+351) 935 205 354</p>
              <p>montesquaresmalda@outlook.com</p>
            </div>
          </div>

          <div class="doc-info">
            <div class="doc-title">Ordem de Trabalho: ${workOrderRef}</div>
            <div class="client-details">
              <p>Orçamento de Origem: ${budget.ref_orcamento}</p>
              <p>Cliente: ${budget.cliente?.nome || ''}</p>
              <p>Matrícula: ${budget.veiculo?.matricula || ''}</p>
              <p>Data: ${new Date().toLocaleDateString('pt-PT')}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DESCRIÇÃO / SERVIÇO</th>
                <th>QUANTIDADE</th>
                <th>CONCLUÍDO</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="mechanic-section">
            <div class="mechanic-label">Mecânico Responsável:</div>
            <div class="mechanic-name">${mechanicName || '_____________________________'}</div>
          </div>

          <div class="signatures-section">
            <div class="sig-block">
              <p>Assinatura do Mecânico:</p>
              <div class="sig-line"></div>
            </div>
            <div class="sig-block">
              <p>Assinatura do Supervisor:</p>
              <div class="sig-line"></div>
            </div>
            <div class="sig-block">
              <p>Data de Conclusão:</p>
              <div class="sig-line"></div>
            </div>
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();

      // Pequeno delay para garantir que o estilo é aplicado antes da impressão
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };


  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar activePage="orcamentos" />
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Orçamentos</h2>
            <p className="mt-1 text-gray-400">Gerencie os orçamentos de reparação</p>
          </div>
          <div className="flex gap-3">
            <Link href="/orcamentos/novo" className="px-4 py-2 bg-brand-yellow-dark text-white font-bold hover:bg-yellow-600 transition-colors rounded-none flex items-center shadow-md">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Novo Orçamento
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-gray-700 border border-gray-600 p-4 rounded-none flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Procurar por cliente, veículo ou ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos os Estados</option>
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600">
                  <tr>
                    <th scope="col" className="px-6 py-3">ID Orçamento</th>
                    <th scope="col" className="px-6 py-3">Veículo</th>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th scope="col" className="px-6 py-3">Data</th>
                    <th scope="col" className="px-6 py-3 text-right">Total</th>
                    <th scope="col" className="px-6 py-3 text-center">Estado</th>
                    <th scope="col" className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredBudgets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhum orçamento encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredBudgets.map(budget => (
                      <tr key={budget.id} className="hover:bg-gray-600 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">{budget.ref_orcamento}</td>
                        <td className="px-6 py-4 text-gray-400">{budget.veiculo ? `${budget.veiculo.marca} ${budget.veiculo.modelo} | ${budget.veiculo.matricula}` : 'Veículo não informado'}</td>

                        <td className="px-6 py-4">{budget.cliente?.nome || 'Cliente não informado'}</td>
                        <td className="px-6 py-4 text-gray-400">{new Date(budget.data_emissao).toLocaleDateString('pt-PT')}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-200">€{budget.total_geral.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.estado)}`}>
                            {budget.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleApproveBudget(budget.id, budget.estado)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title={budget.estado === 'Aprovado' ? 'Reverter para Pendente' : 'Aprovar'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </button>
                            {budget.estado === 'Aprovado' && (
                              <button
                                onClick={() => handlePrintWorkOrder(budget, budget.mecanico_nome)}
                                className="text-orange-400 hover:text-orange-300 transition-colors"
                                title="Imprimir Ordem de Trabalho"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                </svg>
                              </button>
                            )}


                            <button
                              onClick={() => handlePrintBudget(budget)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Imprimir Orçamento"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                              </svg>
                            </button>

                            <button
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Seleção de Mecânico */}
      {showMechanicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Atribuir Mecânico</h3>
            <p className="text-gray-400 mb-4">Selecione o mecânico para esta ordem de trabalho:</p>
            
            <select
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded mb-4 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow"
              value={selectedMechanic}
              onChange={(e) => {
                const mechanicId = e.target.value;
                setSelectedMechanic(mechanicId);
                const mechanic = mechanics.find(m => m.id === mechanicId);
                const mechanicName = mechanic?.nome || '';
                setSelectedMechanicName(mechanicName);
                console.log('Mecânico selecionado:', mechanicId, '- Nome:', mechanicName);
              }}
            >

              <option value="">Selecione um mecânico...</option>
              {mechanics.map((mechanic) => (
                <option key={mechanic.id} value={mechanic.id}>
                  {mechanic.nome}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMechanicModal(false);
                  setSelectedMechanic('');
                  setPendingBudgetId(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmApproveWithMechanic}
                disabled={!selectedMechanic}
                className={`px-4 py-2 text-white rounded transition-colors ${
                  selectedMechanic 
                    ? 'bg-brand-yellow-dark hover:bg-yellow-600' 
                    : 'bg-gray-500 cursor-not-allowed'
                }`}
              >
                Aprovar e Atribuir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default BudgetsPage;
