"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CriarFaturaModal from "@/components/CriarFaturaModal";

interface Invoice {
  id: number;
  numero_fatura: string;
  numero_fatura_toconline?: string;
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
  toconline_id?: string | null;
  recibo_toconline_id?: string | null;
}




const ITEMS_PER_PAGE = 20;

export default function FaturacaoPage() {
    const normalizarEstado = (estado: string): Invoice['estado'] => {
      if (estado === 'pendente' || estado === 'parcial' || estado === 'paga' || estado === 'vencida' || estado === 'cancelada') {
        return estado;
      }
      return 'pendente';
    };

    const mapearExternaParaInvoice = (f: any): Invoice => ({
      id: Number(f.id) || 0,
      numero_fatura: f.attributes.document_number || '',
      numero_fatura_toconline: f.attributes.document_number || '',
      cliente_id: 0,
      cliente_nome: f.attributes.customer_business_name || '',
      cliente_nif: f.attributes.customer_tax_registration_number || '',
      data_emissao: f.attributes.date || '',
      data_vencimento: f.attributes.due_date || '',
      valor_total: Number(f.attributes.total_amount) || 0,
      estado: normalizarEstado(f.attributes.status || 'pendente'),
      notas: f.attributes.notes || '',
      toconline_id: String(f.id) // ID do TOConline
    });

    const combinarFaturas = (locais: any[], externasRaw: any[]): Invoice[] => {
      const externas = externasRaw.map(mapearExternaParaInvoice);
      const externasPorToconlineId = new Map<string, Invoice>();
      const usadasExternas = new Set<string>();

      for (const externa of externas) {
        if (externa.toconline_id) {
          externasPorToconlineId.set(externa.toconline_id, externa);
        }
      }

      const combinadas: Invoice[] = [];

      for (const local of locais as Invoice[]) {
        const externa = local.toconline_id ? externasPorToconlineId.get(local.toconline_id) : undefined;

        if (externa && externa.toconline_id) {
          usadasExternas.add(externa.toconline_id);
          combinadas.push({
            ...local,
            numero_fatura_toconline: externa.numero_fatura_toconline ?? externa.numero_fatura ?? local.numero_fatura,
          });
        } else {
          combinadas.push(local);
        }
      }

      for (const externa of externas) {
        if (!externa.toconline_id || !usadasExternas.has(externa.toconline_id)) {
          combinadas.push(externa);
        }
      }

      return combinadas;
    };

    // Função para abrir OAuth2 e instruir usuário
    const handleOAuth2Page = () => {
      window.open('https://app7.toconline.pt/oauth/authorize?client_id=pt999999990_c101423-6604ef0f5744561b&redirect_uri=https://oauth.pstmn.io/v1/callback&response_type=code&scope=commercial', '_blank');
    };
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [oauthToken, setOauthToken] = useState<string>("");
  const [tokenAge, setTokenAge] = useState<number>(0); // idade do token em minutos
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempAuthCode, setTempAuthCode] = useState("");

  // Carregar faturas da API
  useEffect(() => {
    carregarFaturasCombinadas();
    // Carregar token do localStorage se existir e verificar validade
    const tokenSalvo = typeof window !== 'undefined' ? localStorage.getItem('toconline_access_token') : null;
    const tokenTimestamp = typeof window !== 'undefined' ? localStorage.getItem('toconline_token_timestamp') : null;
    
    if (tokenSalvo && tokenTimestamp) {
      const tokenAge = Date.now() - parseInt(tokenTimestamp);
      const oneHour = 60 * 60 * 1000; // 1 hora em milissegundos
      
      console.log('📋 Token carregado do localStorage:');
      console.log('   Comprimento:', tokenSalvo.length);
      console.log('   Primeiros 20 chars:', tokenSalvo.substring(0, 20) + '...');
      console.log('   Últimos 10 chars:', '...' + tokenSalvo.substring(tokenSalvo.length - 10));
      console.log('   Idade (ms):', tokenAge);
      console.log('   Idade (minutos):', Math.floor(tokenAge / 1000 / 60));
      
      if (tokenAge < oneHour) {
        // Token ainda deve ser válido (menos de 1 hora)
        setOauthToken(tokenSalvo);
        console.log(`✅ Token carregado (idade: ${Math.floor(tokenAge / 1000 / 60)} minutos)`);
      } else {
        // Token provavelmente expirado
        console.warn('⚠️ Token encontrado mas pode estar expirado (idade: ' + Math.floor(tokenAge / 1000 / 60) + ' minutos)');
        localStorage.removeItem('toconline_access_token');
        localStorage.removeItem('toconline_token_timestamp');
        setOauthToken('');
      }
    } else if (tokenSalvo && !tokenTimestamp) {
      // Token sem timestamp - assumir como expirado
      console.warn('⚠️ Token sem timestamp encontrado - removendo por segurança');
      localStorage.removeItem('toconline_access_token');
      setOauthToken('');
    }
  }, []);

  // Atualizar idade do token a cada minuto
  useEffect(() => {
    if (!oauthToken) {
      setTokenAge(0);
      return;
    }

    const updateTokenAge = () => {
      const tokenTimestamp = typeof window !== 'undefined' ? localStorage.getItem('toconline_token_timestamp') : null;
      if (tokenTimestamp) {
        const age = Math.floor((Date.now() - parseInt(tokenTimestamp)) / 1000 / 60); // idade em minutos
        setTokenAge(age);
        
        // Se mais de 55 minutos, avisar que token vai expirar
        if (age >= 55 && age < 60) {
          console.warn('⚠️ Token irá expirar em breve! Renove agora para evitar interrupções.');
        }
      }
    };

    updateTokenAge(); // executar imediatamente
    const interval = setInterval(updateTokenAge, 60000); // atualizar a cada minuto

    return () => clearInterval(interval);
  }, [oauthToken]);

  // Obter novo token OAuth2
  const handleObtainNewToken = async () => {
    if (!tempAuthCode.trim()) {
      alert('Por favor, insira o código de autorização');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/fatura-simplificada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: {}, authCode: tempAuthCode.trim() })
      });
      const data = await res.json();

      if (data.success && data.data?.access_token) {
        const newToken = data.data.access_token;
        console.log('🔐 Token obtido com sucesso:');
        console.log('   Comprimento:', newToken.length);
        console.log('   Primeiros 20 chars:', newToken.substring(0, 20) + '...');
        console.log('   Últimos 10 chars:', '...' + newToken.substring(newToken.length - 10));
        
        localStorage.setItem('toconline_access_token', newToken);
        localStorage.setItem('toconline_token_timestamp', Date.now().toString());
        
        // Verificar se foi salvo corretamente
        const tokenVerify = localStorage.getItem('toconline_access_token');
        console.log('✅ Token verificado no localStorage:');
        console.log('   Comprimento salvo:', tokenVerify?.length);
        console.log('   Primeiros 20 chars:', tokenVerify?.substring(0, 20) + '...');
        console.log('   Tokens iguais?', newToken === tokenVerify);
        
        setOauthToken(newToken);
        setTempAuthCode('');
        setShowTokenModal(false);
        
        // Recarregar faturas com novo token (usando POST em vez de query string)
        const resFaturas = await fetch(`/api/faturas-externas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: newToken })
        });
        const jsonFaturas = await resFaturas.json();
        const responseLocal = await fetch('/api/faturas');
        const dataLocal = await responseLocal.json();
        let locais = dataLocal.success ? dataLocal.data : [];
        let externas = [];
        if (jsonFaturas.success && Array.isArray(jsonFaturas.data?.data)) {
          externas = jsonFaturas.data.data;
        }
        setInvoices(combinarFaturas(locais, externas));
        alert('✅ Token atualizado com sucesso!');
      } else {
        const errorMsg = data.error || data.data?.error || 'Falha desconhecida';
        
        // Mensagens personalizadas
        if (errorMsg.includes('unauthorized_client')) {
          alert('❌ Cliente não autorizado.\n\nVerifique:\n1. Se as credenciais estão corretas\n2. Se a aplicação está autorizada no TOConline');
        } else if (errorMsg.includes('invalid_grant') || errorMsg.includes('expirado')) {
          alert('❌ Código de autorização expirado!\n\nOs códigos OAuth expiram em poucos minutos.\n\nPor favor:\n1. Clique novamente em "Abrir URL de Autorização"\n2. Faça login novamente\n3. Cole o NOVO código rapidamente');
        } else if (errorMsg.includes('invalid_request')) {
          alert('❌ Requisição inválida.\n\nVerifique se todos os parâmetros estão corretos.');
        } else {
          alert('❌ Erro ao obter token:\n\n' + errorMsg);
        }
      }
    } catch (err) {
      alert('❌ Erro ao processar: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Busca faturas locais e externas e une os dados
  const carregarFaturasCombinadas = async () => {
    try {
      setLoading(true);
      // Buscar faturas locais
      const responseLocal = await fetch('/api/faturas');
      const dataLocal = await responseLocal.json();
      let locais = dataLocal.success ? dataLocal.data : [];

      // Buscar token OAuth2 salvo (ajuste conforme sua lógica de autenticação)
      const token = typeof window !== 'undefined' ? localStorage.getItem('toconline_access_token') : '';
      let externas = [];
      if (token) {
        const responseExt = await fetch(`/api/faturas-externas?token=${token}`);
        const dataExt = await responseExt.json();
        if (dataExt.success && Array.isArray(dataExt.data?.data)) {
          externas = dataExt.data.data;
        }
      }
      setInvoices(combinarFaturas(locais, externas));
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fazer download de PDF da fatura
  const handleDownloadPDF = async (faturaId: number, numeroFatura: string) => {
    if (!oauthToken) {
      alert('⚠️ Token OAuth2 não configurado. Por favor, clique no botão "Autenticar" no topo da página.');
      return;
    }

    try {
      const response = await fetch(`/api/faturas/${faturaId}/pdf-toconline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oauthToken })
      });
      
      const data = await response.json();

      if (response.ok && data.success && data.pdfUrl) {
        // Abrir PDF em nova aba
        window.open(data.pdfUrl, '_blank');
      } else {
        const errorMsg = data.error || 'Falha ao obter PDF do TOConline';
        alert(`❌ Erro: ${errorMsg}`);
      }
    } catch (error) {
      alert('❌ Erro ao obter PDF da fatura');
      console.error(error);
    }
  };

  // Fazer download de PDF do recibo
  const handleDownloadRecibo = async (faturaId: number, numeroFatura: string) => {
    if (!oauthToken) {
      alert('⚠️ Token OAuth2 não configurado. Por favor, clique no botão "Autenticar" no topo da página.');
      return;
    }

    try {
      const response = await fetch(`/api/faturas/${faturaId}/pdf-recibo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oauthToken })
      });
      
      const data = await response.json();
      console.log('📥 Resposta do servidor (pdf-recibo):', JSON.stringify(data, null, 2));

      if (response.ok && data.success && data.pdfUrl) {
        console.log('🔗 URL do recibo:', data.pdfUrl);
        console.log('📂 Tipo do pdfUrl:', typeof data.pdfUrl);
        
        // Abrir PDF em nova aba
        if (typeof data.pdfUrl === 'string') {
          console.log('✅ Abrindo URL:', data.pdfUrl);
          window.open(data.pdfUrl, '_blank');
        } else {
          console.error('❌ pdfUrl não é string, é:', typeof data.pdfUrl, data.pdfUrl);
          alert(`❌ Erro: URL do recibo inválida`);
        }
      } else {
        const errorMsg = data.error || 'Falha ao obter link do recibo';
        alert(`❌ Erro: ${errorMsg}`);
      }
    } catch (error) {
      alert('❌ Erro ao obter recibo');
      console.error(error);
    }
  };

  // Emitir recibo no TOConline e marcar fatura como paga
  const handleEmitirRecibo = async (faturalId: number, numeroFatura: string) => {
    if (!oauthToken) {
      alert('⚠️ Token OAuth2 não configurado. Por favor, clique no botão "Autenticar" no topo da página.');
      return;
    }

    console.log('🔄 [Emitir Recibo] Iniciando com token:');
    console.log('   Comprimento:', oauthToken.length);
    console.log('   Primeiros 20 chars:', oauthToken.substring(0, 20) + '...');

    // Pedir confirmação
    const confirmar = confirm(
      `Deseja emitir recibo e marcar a fatura ${numeroFatura} como paga?\n\nIsto irá:\n1. Emitir o recibo no TOConline\n2. Marcar a fatura como PAGA`
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`/api/faturas/${faturalId}/recibo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oauthToken })
      });

      const data = await response.json() as any;

      if (response.ok && data.success) {
        console.log('[Emitir Recibo] Sucesso:', data);
        
        // Atualizar a grelha imediatamente
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === faturalId 
              ? { ...inv, estado: 'paga' } 
              : inv
          )
        );
        
        // Depois recarregar para garantir sincronização
        setTimeout(() => carregarFaturasCombinadas(), 500);
        alert(`✅ Recibo emitido com sucesso!\nRecibo ID: ${data.data?.recibo_id || 'N/A'}\n\nUse o ícone do recibo para abrir o PDF.`);
      } else {
        const errorMsg = data?.error || 'Falha ao emitir recibo';
        const details = data?.details ? JSON.stringify(data.details, null, 2) : '';
        const fullError = details ? `${errorMsg}\n\nDetalhes:\n${details}` : errorMsg;
        alert(`❌ Erro: ${fullError}`);
        console.error('[Emitir Recibo] Erro - Status:', response.status);
        console.error('[Emitir Recibo] Erro - Mensagem:', errorMsg);
        console.error('[Emitir Recibo] Erro - Detalhes:', data?.details || 'N/A');
      }
    } catch (error) {
      alert('Erro ao emitir recibo');
      console.error('[Emitir Recibo] Exception:', error);
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
          carregarFaturasCombinadas();
          alert('Fatura anulada com sucesso!');
        }
      } catch (error) {
        alert('Erro ao anular fatura');
        console.error(error);
      }
    }
  }

  const getNumeroFaturaExibicao = (invoice: Invoice) => {
    return invoice.numero_fatura_toconline || invoice.numero_fatura;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const numeroExibicao = getNumeroFaturaExibicao(invoice).toLowerCase();
    const matchesSearch = searchTerm === "" ||
      (invoice.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.cliente_nif?.includes(searchTerm)) ||
      (numeroExibicao.includes(searchTerm.toLowerCase())) ||
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
    const numeroExibicao = getNumeroFaturaExibicao(invoice).toLowerCase();
    const matchesSearch = searchTerm === "" ||
      (invoice.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.cliente_nif?.includes(searchTerm)) ||
      (numeroExibicao.includes(searchTerm.toLowerCase())) ||
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
            <h2 className="text-3xl font-bold text-gray-100 leading-tight">Faturação Externa (TOConline)</h2>
            <p className="mt-1 text-gray-400">Gestão de faturas TOConline</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Botão de Status do Token */}
            <button
              onClick={() => setShowTokenModal(true)}
              className={`px-4 py-2 rounded-none flex items-center gap-2 transition-colors border ${
                oauthToken
                  ? 'bg-green-900 text-green-200 border-green-700 hover:bg-green-800'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
              title={oauthToken ? `Token ativo (${tokenAge} min)` : 'Clique para autenticar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              {oauthToken ? (
                <span>
                  ✓ Autenticado
                  {tokenAge > 0 && tokenAge < 60 && (
                    <span className="text-xs ml-1">({tokenAge} min)</span>
                  )}
                  {tokenAge >= 55 && (
                    <span className="text-yellow-300 text-xs ml-1">⚠️</span>
                  )}
                </span>
              ) : (
                'Autenticar'
              )}
            </button>
            
            {/* Botão Gerar Fatura */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none flex items-center shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Gerar Fatura (TOConline)
            </button>
          </div>
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
                          <td className="px-6 py-4 font-medium text-gray-200 font-mono" title={`ID Local: ${invoice.id} | TOConline ID: ${invoice.toconline_id || 'N/A'} | Recibo: ${invoice.recibo_toconline_id || 'N/A'}`}>
                            <div>{getNumeroFaturaExibicao(invoice)}</div>
                            {invoice.numero_fatura_toconline && invoice.numero_fatura_toconline !== invoice.numero_fatura ? (
                              <div className="text-xs text-gray-500">Local: {invoice.numero_fatura}</div>
                            ) : null}
                          </td>
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
                          <td className="px-6 py-4 text-center flex justify-center gap-3">
                            {/* Ícone 1: Download PDF da Fatura */}
                            <button 
                              onClick={() => handleDownloadPDF(invoice.id, getNumeroFaturaExibicao(invoice))}
                              className="text-gray-400 hover:text-brand-yellow transition-colors p-1" 
                              title="Descarregar PDF da Fatura"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            </button>
                            
                            {/* Ícone 2: Emitir Recibo (apareça apenas se pendente E tiver toconline_id) */}
                            {invoice.estado === 'pendente' && invoice.toconline_id ? (
                              <button 
                                onClick={() => handleEmitirRecibo(invoice.id, getNumeroFaturaExibicao(invoice))}
                                className="text-gray-400 hover:text-green-400 transition-colors p-1" 
                                title="Emitir Recibo e Marcar como Paga"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </button>
                            ) : invoice.estado === 'pendente' ? (
                              <button 
                                disabled
                                className="text-gray-600 cursor-not-allowed p-1" 
                                title="Fatura não vinculada ao TOConline. Apenas faturas criadas via TOConline podem ter recibos."
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </button>
                            ) : null}
                            
                            {/* Ícone 3: Descarregar Recibo (apareça apenas se paga E tiver recibo_toconline_id) */}
                            {invoice.estado === 'paga' && invoice.recibo_toconline_id ? (
                              <button 
                                onClick={() => handleDownloadRecibo(invoice.id, getNumeroFaturaExibicao(invoice))}
                                className="text-gray-400 hover:text-blue-400 transition-colors p-1" 
                                title="Descarregar PDF do Recibo"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </button>
                            ) : null}
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
        onSuccess={() => carregarFaturasCombinadas()}
        oauthToken={oauthToken}
      />

      {/* Modal de Autenticação OAuth2 */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 w-full max-w-md mx-4 shadow-2xl p-6 rounded-none">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-lg font-bold text-gray-100">Autenticação TOConline</h3>
              <button
                onClick={() => {
                  setShowTokenModal(false);
                  setTempAuthCode('');
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Status do Token */}
              <div className="p-3 rounded-none border" style={{
                borderColor: oauthToken ? '#10b981' : '#ef4444',
                backgroundColor: oauthToken ? '#065f46' : '#7f1d1d'
              }}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${oauthToken ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <div className="flex-1 text-sm" style={{color: oauthToken ? '#d1fae5' : '#fee2e2'}}>
                    {oauthToken ? (
                      <>✓ Token Ativo {tokenAge > 0 && `(${tokenAge} min)`}</>
                    ) : (
                      '✗ Sem Token - Autenticação necessária'
                    )}
                  </div>
                </div>
              </div>

              {/* Botão para abrir OAuth2 */}
              <button
                onClick={handleOAuth2Page}
                className="w-full px-4 py-2 bg-blue-900 text-blue-200 hover:bg-blue-800 transition-colors rounded-none border border-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                1. Abrir Autorização TOConline
              </button>

              {/* Input do Código */}
              <div>
                <label className="block text-sm text-gray-300 mb-1 font-medium">2. Cole o código aqui:</label>
                <input
                  type="text"
                  value={tempAuthCode}
                  onChange={(e) => setTempAuthCode(e.target.value)}
                  placeholder="Código de autorização"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">⚠️ Cole rapidamente - códigos expiram em poucos minutos</p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    setTempAuthCode('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors rounded-none border border-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleObtainNewToken}
                  disabled={!tempAuthCode.trim() || loading}
                  className="flex-1 px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'A processar...' : '3. Processar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
