'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { useFetch, useModal, useModals, usePagination, useFilters, filterPredicates } from '@/hooks';

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
  kms?: number | null;
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

const ITEMS_PER_PAGE = 20;

const BudgetsPage = () => {
  // Data fetching
  const { data: rawData = {}, loading, error, refetch } = useFetch<any>('/api/orcamentos?page=1&limit=1000');
  const budgets = (Array.isArray(rawData) ? rawData : rawData?.orcamentos) || [];

  // Modal for budget details
  const { isOpen: budgetModalOpen, selectedItem: budgetDetails, select: selectBudgetDetails, close: closeBudgetModal } = useModal<Budget>();

  // Filtering (search + status)
  const filterConfig = {
    search: filterPredicates.search(['ref_orcamento', 'cliente', 'veiculo']),
    status: filterPredicates.exact('estado'),
  };
  const { filters, setFilter } = useFilters(budgets, filterConfig);

  // Apply filters manually (since search needs custom logic)
  const filteredBudgets = budgets.filter((budget: Budget) => {
    const searchTerm = filters.search || '';
    const statusFilter = filters.status || '';

    const matchesSearch =
      budget.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${budget.veiculo?.matricula} | ${budget.veiculo?.marca} ${budget.veiculo?.modelo}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.ref_orcamento?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || budget.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const { currentPage, totalPages, paginatedItems: paginatedBudgets, nextPage, prevPage } =
    usePagination(filteredBudgets, ITEMS_PER_PAGE, [filters.search, filters.status]);

  // Mechanic modal states (keep separate as they're dependent on button click)
  const { modals: mechanicModals, open: openMechanicModal, close: closeMechanicModal } = useModals({
    showMechanicModal: false,
  });

  const [mechanics, setMechanics] = useState<{ id: string, nome: string }[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');
  const [selectedMechanicName, setSelectedMechanicName] = useState<string>('');
  const [pendingBudgetId, setPendingBudgetId] = useState<number | null>(null);
  const [pendingCurrentStatus, setPendingCurrentStatus] = useState<string>('');

  // Auto-refresh when page becomes visible (fixes sync issues after Kanban updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refetch);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refetch);
    };
  }, [refetch]);

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

      // Refresh data after successful deletion
      await refetch();
    } catch (err) {
      alert('Erro ao eliminar orçamento: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const numberToPortugueseWords = (value: number): string => {
    const units = ['zero', 'um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const convertBelowHundred = (number: number): string => {
      if (number < 10) return units[number] ?? '';
      if (number < 20) return teens[number - 10] ?? '';

      const ten = Math.floor(number / 10);
      const unit = number % 10;
      const tenText = tens[ten] ?? '';
      const unitText = units[unit] ?? '';
      return unit === 0 ? tenText : `${tenText} e ${unitText}`;
    };

    const convertBelowThousand = (number: number): string => {
      if (number === 0) return '';
      if (number < 100) return convertBelowHundred(number);
      if (number === 100) return 'cem';

      const hundred = Math.floor(number / 100);
      const remainder = number % 100;
      const hundredText = hundreds[hundred] ?? '';
      return remainder === 0 ? hundredText : `${hundredText} e ${convertBelowHundred(remainder)}`;
    };

    const joinWithAnd = (left: string, right: string, rightNumber: number): string => {
      if (!left) return right;
      if (!right) return left;
      return rightNumber < 100 ? `${left} e ${right}` : `${left} ${right}`;
    };

    if (value === 0) return 'zero';

    const millions = Math.floor(value / 1000000);
    const thousands = Math.floor((value % 1000000) / 1000);
    const remainder = value % 1000;

    let result = '';

    if (millions > 0) {
      const millionText = millions === 1 ? 'um milhao' : `${numberToPortugueseWords(millions)} milhoes`;
      result = millionText;
    }

    if (thousands > 0) {
      const thousandText = thousands === 1 ? 'mil' : `${convertBelowThousand(thousands)} mil`;
      result = joinWithAnd(result, thousandText, thousands);
    }

    if (remainder > 0) {
      result = joinWithAnd(result, convertBelowThousand(remainder), remainder);
    }

    return result;
  };

  const formatCurrencyInWords = (amount: number): string => {
    const normalizedAmount = Number.isFinite(amount) ? amount : 0;
    const roundedAmount = Math.round(normalizedAmount * 100) / 100;
    const euros = Math.floor(roundedAmount);
    const cents = Math.round((roundedAmount - euros) * 100);

    const euroText = `${numberToPortugueseWords(euros)} ${euros === 1 ? 'euro' : 'euros'}`;
    if (cents === 0) {
      return euroText;
    }

    const centsText = `${numberToPortugueseWords(cents)} ${cents === 1 ? 'cêntimo' : 'cêntimos'}`;
    return `${euroText} e ${centsText}`;
  };

  const formatAmountWordsForPrint = (amount: number): string => {
    return formatCurrencyInWords(amount)
      .split(' ')
      .map((word) => {
        if (word === 'e') {
          return word;
        }

        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'aprovado': return 'text-green-400 bg-green-900/30 border border-green-900';
      case 'pendente': return 'text-indigo-400 bg-indigo-900/30 border border-indigo-900';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'pendente': return 'Em Aprovação';
      case 'aprovado': return 'Aprovado';
      default: return status;
    }
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
    const isApproved = currentStatus.toLowerCase() === 'aprovado';
    const newStatus = isApproved ? 'Pendente' : 'Aprovado';

    // If approving (not reverting), show mechanic selection modal
    if (newStatus === 'Aprovado') {
      setPendingBudgetId(budgetId);
      setPendingCurrentStatus(currentStatus);
      setSelectedMechanic('');
      setSelectedMechanicName('');
      await fetchMechanics();
      openMechanicModal('showMechanicModal');
      return;
    }

    // If reverting to Pending, confirm directly
    if (!confirm('Tem certeza que deseja reverter este orçamento para Em Aprovação?')) {
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

      // Refresh data after successful update
      await refetch();
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

      // Refresh data after successful update
      await refetch();

      // Close modal and clear states
      closeMechanicModal('showMechanicModal');
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

      const totalExtenso = formatAmountWordsForPrint(budget.total_geral);

      printWindow.document.write(`
      <html>
        <head>
          <title>Folha de Orçamento - ${budget.ref_orcamento}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
            
            /* Cabeçalho */
            .header-container { display: flex; align-items: flex-start; margin-bottom: 20px; }
            .logo-section { display: flex; align-items: center; margin-left: -12px; }
            .logo-section img { width: 92px; margin-right: 4px; }
            .company-name h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .company-name p { margin: 0; font-size: 14px; }
            .contacts-section { margin-left: auto; text-align: right; font-size: 12px; line-height: 1.4; }

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
            .signatures-section { margin-top: 50px; text-align: center; }
            .sig-block { margin-bottom: 40px; font-size: 12px; display: flex; flex-direction: column; align-items: center; }
            .sig-line { border-bottom: 1px solid #000; width: 250px; margin: 50px auto 0 auto; display: block; }
            
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
              <div style="background: white; padding: 5px; border-radius: 4px; display: inline-block; margin-right: 4px;">
                <img src="/logoblack.jpg" alt="MQAuto Logo" style="width: 72px; height: 72px; object-fit: contain; display: block;" />
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
            <div class="client-details" style="display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
              <div>
                <p>Cliente: ${budget.cliente?.nome || ''}</p>
                <p>Data: ${budget.data_emissao ? (() => {
          const date = new Date(budget.data_emissao);
          return !isNaN(date.getTime()) ? date.toLocaleDateString('pt-PT') : '-';
        })() : '-'}</p>
              </div>
              <div>
                <p>Veículo: <b>${budget.veiculo?.matricula || '-'}</b>${budget.veiculo ? ` (${budget.veiculo.marca} ${budget.veiculo.modelo})` : ''}</p>
                <p>Quilometragem: ${budget.kms != null ? `${budget.kms} km` : '-'}</p>
              </div>
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
          <div class="signatures-section" style="margin-top: 50px; width: 100%; text-align: center;">        
            <div class="sig-block">
              <p>Assinatura da Empresa:</p>
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
            .header-container { display: flex; align-items: flex-start; margin-bottom: 20px; }
            .logo-section { display: flex; align-items: center; margin-left: -12px; }
            .logo-section img { width: 92px; margin-right: 4px; }
            .company-name h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .company-name p { margin: 0; font-size: 14px; }
            .contacts-section { margin-left: auto; text-align: right; font-size: 12px; line-height: 1.4; }

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
              text-align: center;
            }
            .mechanic-label { font-weight: bold; margin-bottom: 5px; text-align: center; }
            .mechanic-name { font-size: 16px; color: #333; text-align: center; }

            /* Assinaturas */
            .signatures-section { margin-top: 50px; width: 100%; text-align: center; }
            .sig-block { margin: 0 auto 40px; font-size: 12px; width: 250px; text-align: center; }
            .sig-line { border-bottom: 1px solid #000; width: 250px; margin: 65px auto 0; }
            
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
              <div style="background: white; padding: 5px; border-radius: 4px; display: inline-block; margin-right: 4px;">
                <img src="/logoblack.jpg" alt="MQAuto Logo" style="width: 72px; height: 72px; object-fit: contain; display: block;" />
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
            <div class="client-details" style="display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
              <div>
                <p>Cliente: ${budget.cliente?.nome || ''}</p>
                <p>Data: ${budget.data_emissao ? (() => {
          const date = new Date(budget.data_emissao);
          return !isNaN(date.getTime()) ? date.toLocaleDateString('pt-PT') : '-';
        })() : '-'}</p>
              </div>
              <div>
                <p>Veículo: <b>${budget.veiculo?.matricula || '-'}</b>${budget.veiculo ? ` (${budget.veiculo.marca} ${budget.veiculo.modelo})` : ''}</p>
                <p>Quilometragem: ${budget.kms != null ? `${budget.kms} km` : '-'}</p>
              </div>
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
            <div class="mechanic-label">Responsável da Reparação</div>
            <div class="mechanic-name">${mechanicName || '_____________________________'}</div>
          </div>
          <div class="signatures-section">
            <div class="sig-block">
              <p>Assinatura do Responsável:</p>
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

  // No need for manual pagination - handled by usePagination hook

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
                value={filters.search || ''}
                onChange={(e) => setFilter('search', e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition"
                value={filters.status || ''}
                onChange={(e) => setFilter('status', e.target.value)}
              >
                <option value="">Todos os Estados</option>
                <option value="Pendente">Em Aprovação</option>
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
                    (paginatedBudgets as Budget[]).map(budget => (
                      <tr key={budget.id} className="hover:bg-gray-600 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                          <button
                            className="underline text-brand-yellow hover:text-yellow-400 focus:outline-none"
                            onClick={() => {
                              selectBudgetDetails(budget);
                            }}
                            type="button"
                          >
                            {budget.ref_orcamento}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{budget.veiculo ? `${budget.veiculo.matricula} | ${budget.veiculo.marca} ${budget.veiculo.modelo}` : 'Veículo não informado'}</td>

                        <td className="px-6 py-4">{budget.cliente?.nome || 'Cliente não informado'}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {budget.data_emissao ? (() => {
                            const date = new Date(budget.data_emissao);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('pt-PT') : '-';
                          })() : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-200">€{budget.total_geral.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.estado)}`}>
                            {getStatusLabel(budget.estado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleApproveBudget(budget.id, budget.estado)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title={budget.estado.toLowerCase() === 'aprovado' ? 'Reverter para Em Aprovação' : 'Aprovar'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </button>
                            {budget.estado.toLowerCase() === 'aprovado' && (
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

                            <Link
                              href={`/orcamentos/${budget.id}/edit`}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </Link>
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

            {/* Pagination */}
            {filteredBudgets.length > 0 && (
              <div className="bg-gray-800 px-4 py-3 border-t border-gray-600 flex items-center justify-between rounded-b">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span> ({filteredBudgets.length} orçamentos)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-3">
                      Página <span className="font-medium text-gray-200">{currentPage}</span> de <span className="font-medium text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Detalhes do Orçamento */}
      {budgetModalOpen && budgetDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Detalhes do Orçamento</h3>
            <div className="space-y-2 text-gray-200">
              <div><span className="font-semibold">ID:</span> {budgetDetails.ref_orcamento}</div>
              <div><span className="font-semibold">Cliente:</span> {budgetDetails.cliente?.nome || '-'}</div>
              <div><span className="font-semibold">Veículo:</span> {budgetDetails.veiculo ? `${budgetDetails.veiculo.marca} ${budgetDetails.veiculo.modelo} | ${budgetDetails.veiculo.matricula}` : '-'}</div>
              <div><span className="font-semibold">Data:</span> {budgetDetails.data_emissao ? (() => {
                const date = new Date(budgetDetails.data_emissao);
                return !isNaN(date.getTime()) ? date.toLocaleDateString('pt-PT') : '-';
              })() : '-'}</div>
              <div><span className="font-semibold">Total:</span> €{budgetDetails.total_geral.toFixed(2)}</div>
              <div><span className="font-semibold">Estado:</span> {getStatusLabel(budgetDetails.estado)}</div>
              <div><span className="font-semibold">Mecânico:</span> {budgetDetails.mecanico_nome || '-'}</div>
              <div>
                <span className="font-semibold">Itens:</span>
                <ul className="mt-2 space-y-1">
                  {budgetDetails.itens_orcamento && budgetDetails.itens_orcamento.length > 0 ? (
                    budgetDetails.itens_orcamento.map((item, idx) => (
                      <li key={idx} className="border border-gray-700 rounded p-2">
                        <div><span className="font-semibold">Descrição:</span> {item.descricao}</div>
                        <div><span className="font-semibold">Quantidade:</span> {item.quantidade}</div>
                        <div><span className="font-semibold">Valor Total:</span> €{item.valor_total.toFixed(2)}</div>
                        {item.notas && <div><span className="font-semibold">Notas:</span> {item.notas}</div>}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">Nenhum item.</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeBudgetModal}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {mechanicModals.showMechanicModal && (
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
                  closeMechanicModal('showMechanicModal');
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
                className={`px-4 py-2 text-white rounded transition-colors ${selectedMechanic
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



