/**
 * Teste de Fluxo Completo - End-to-End
 * Simula desde o agendamento até ao pagamento da fatura
 * 
 * Cenários testados:
 * 1. Cliente novo com agendamento simples
 * 2. Cliente existente com múltiplas peças
 * 3. Ordem de trabalho complexa com serviços e peças
 * 4. Faturação e pagamento
 */

const BASE_URL = 'http://localhost:3000';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Utilitários
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}▶ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${'='.repeat(60)}\n${colors.magenta}${colors.bright}${msg}${colors.reset}\n${'='.repeat(60)}`),
};

// Helper para fazer requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    log.info(`${method} ${endpoint}`);
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      log.error(`Falha na request: ${response.status}`);
      console.log('Resposta:', JSON.stringify(data, null, 2));
      throw new Error(`HTTP ${response.status}: ${data.error || 'Erro desconhecido'}`);
    }
    
    log.success(`Sucesso: ${response.status}`);
    return data;
  } catch (error) {
    log.error(`Erro na request: ${error.message}`);
    throw error;
  }
}

// Esperar um pouco entre requests
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// CENÁRIO 1: Cliente Novo com Agendamento Simples
// ============================================================================
async function cenario1_ClienteNovoAgendamentoSimples() {
  log.header('CENÁRIO 1: Cliente Novo com Agendamento Simples');
  
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  const clienteData = {
    nome: 'João Silva Teste',
    email: `joao.silva.${timestamp}@email.com`,
    telefone: '912345678',
    nif: `${100000000 + randomSuffix}`, // NIF único
    endereco: 'Rua das Flores, 123, Lisboa',
    perfil: 'Normal',
    notas: 'Cliente criado via teste automático',
  };
  
  const veiculoData = {
    marca: 'Volkswagen',
    modelo: 'Golf',
    ano: 2018,
    matricula: `AA-${Math.floor(Math.random() * 90 + 10)}-BB`, // Matrícula única
    cor: 'Preto',
    chassis: `WVWZZZ1KZAW${timestamp.toString().slice(-6)}`,
    combustivel: 'Gasolina',
    cilindrada: 1400,
    kms: 85000,
    notas: 'Veículo em bom estado geral',
  };
  
  try {
    // Passo 1: Criar cliente
    log.step('Passo 1: Criar Cliente');
    const clienteResponse = await apiRequest('/api/clientes', 'POST', clienteData);
    const cliente = clienteResponse; // A resposta já é o objeto cliente
    log.success(`Cliente criado: ID ${cliente.id} - ${cliente.nome}`);
    await wait(500);
    
    // Passo 2: Criar veículo para o cliente
    log.step('Passo 2: Criar Veículo');
    const veiculoCompleto = { ...veiculoData, cliente_id: cliente.id };
    const veiculoResponse = await apiRequest('/api/veiculos', 'POST', veiculoCompleto);
    const veiculo = veiculoResponse; // A resposta já é o objeto veículo
    log.success(`Veículo criado: ID ${veiculo.id} - ${veiculo.marca} ${veiculo.modelo} (${veiculo.matricula})`);
    await wait(500);
    
    // Passo 3: Criar agendamento
    log.step('Passo 3: Criar Agendamento');
    const dataAgendamento = new Date();
    dataAgendamento.setDate(dataAgendamento.getDate() + 2); // Daqui a 2 dias
    
    const agendamentoData = {
      cliente_id: cliente.id,
      matricula: veiculo.matricula,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      titulo: 'Revisão - Manutenção preventiva',
      descricao: 'Mudança de óleo, filtros e verificação geral',
      data_agendamento: dataAgendamento.toISOString().split('T')[0],
      hora_inicio: '10:00',
      estado: 'agendado',
      prioridade: 'normal',
      contacto_nome: cliente.nome,
      contacto_telefone: cliente.telefone,
      contacto_email: cliente.email,
    };
    
    const agendamentoResponse = await apiRequest('/api/agendamentos', 'POST', agendamentoData);
    const agendamento = agendamentoResponse; // A resposta já é o objeto agendamento
    log.success(`Agendamento criado: ID ${agendamento.id} - ${agendamento.date} às ${agendamento.time}`);
    await wait(500);
    
    // Passo 4: Criar ordem de trabalho a partir do agendamento
    log.step('Passo 4: Criar Ordem de Trabalho');
    const refOrdem = `OT${timestamp % 100000}`; // Referência curta
    const ordemData = {
      ref_ordem_trabalho: refOrdem,
      cliente_id: cliente.id,
      veiculo_id: veiculo.id,
      agendamento_id: agendamento.id,
      data_inicio: new Date().toISOString().split('T')[0],
      estado: 'em_progresso',
      kms: veiculo.kms,
      descricao_problema: 'Revisão periódica solicitada',
      trabalho_realizado: '',
      recomendacoes: '',
      contacto_nome: cliente.nome,
      contacto_telefone: cliente.telefone,
      contacto_email: cliente.email,
      items: [
        {
          tipo_item: 'servico',
          descricao: 'Mudança de óleo',
          quantidade: 1,
          preco_unitario: 45.00,
          valor_total: 45.00,
        },
        {
          tipo_item: 'peca',
          descricao: 'Filtro de óleo',
          quantidade: 1,
          preco_unitario: 12.50,
          valor_total: 12.50,
        },
        {
          tipo_item: 'peca',
          descricao: 'Óleo motor 5W30 (5L)',
          quantidade: 1,
          preco_unitario: 35.00,
          valor_total: 35.00,
        },
      ],
      total_pecas: 47.50,
      total_mao_obra: 45.00,
      total_desconto: 0,
      total_imposto: 0,
      total_geral: 92.50,
    };
    
    const ordemResponse = await apiRequest('/api/ordens-trabalho', 'POST', ordemData);
    const ordem = ordemResponse; // A resposta já é o objeto ordem
    log.success(`Ordem de trabalho criada: ${ordem.ref_ordem_trabalho}`);
    await wait(500);
    
    // Passo 5: Atualizar ordem para concluída
    log.step('Passo 5: Concluir Ordem de Trabalho');
    const ordemUpdate = {
      estado: 'concluida',
      data_conclusao: new Date().toISOString().split('T')[0],
      trabalho_realizado: 'Mudança de óleo e filtros realizada com sucesso. Verificação geral OK.',
      recomendacoes: 'Próxima revisão em 10.000 km ou 12 meses.',
    };
    
    await apiRequest(`/api/ordens-trabalho/${ordem.id}`, 'PUT', ordemUpdate);
    log.success('Ordem de trabalho concluída');
    await wait(500);
    
    // Passo 6: Criar fatura
    log.step('Passo 6: Criar Fatura');
    const proximoNumeroResponse = await apiRequest('/api/faturas/proximo-numero');
    const numeroFatura = proximoNumeroResponse?.numero || `F${timestamp % 100000}`; // Número curto
    
    const faturaData = {
      numero_fatura: numeroFatura,
      cliente_id: cliente.id,
      ordem_trabalho_id: ordem.id,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'pendente',
      subtotal: 92.50,
      valor_imposto: 21.28, // 23% IVA
      valor_desconto: 0,
      valor_total: 113.78,
      valor_pago: 0,
      notas: 'Fatura referente à revisão periódica',
    };
    
    const faturaResponse = await apiRequest('/api/faturas', 'POST', faturaData);
    const fatura = faturaResponse; // A resposta já é o objeto fatura
    log.success(`Fatura criada: ${fatura.numero_fatura} - Total: €${fatura.valor_total}`);
    await wait(500);
    
    // Passo 7: Marcar fatura como paga
    log.step('Passo 7: Marcar Fatura como Paga');
    const faturaUpdate = {
      estado: 'paga',
      valor_pago: 113.78,
      data_pagamento: new Date().toISOString().split('T')[0],
    };
    
    await apiRequest(`/api/faturas/${fatura.id}`, 'PUT', faturaUpdate);
    log.success('Fatura marcada como paga!');
    
    log.header('✅ CENÁRIO 1 CONCLUÍDO COM SUCESSO');
    
    return {
      cliente,
      veiculo,
      agendamento,
      ordem,
      fatura,
    };
    
  } catch (error) {
    log.error(`Erro no Cenário 1: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// CENÁRIO 2: Cliente Existente com Múltiplas Peças
// ============================================================================
async function cenario2_ClienteExistenteMultiplasPecas() {
  log.header('CENÁRIO 2: Cliente Existente com Múltiplas Peças');
  
  try {
    // Passo 1: Buscar cliente existente
    log.step('Passo 1: Buscar Cliente Existente');
    const clientesResponse = await apiRequest('/api/clientes?limit=1');
    let cliente = Array.isArray(clientesResponse) ? clientesResponse[0] : null;
    
    if (!cliente) {
      log.warning('Nenhum cliente encontrado. Criando cliente de teste...');
      const randomSuffix = Math.floor(Math.random() * 1000);
      cliente = await apiRequest('/api/clientes', 'POST', {
        nome: 'Maria Santos',
        email: `maria.santos.${Date.now()}@email.com`,
        telefone: '918765432',
        nif: `${200000000 + randomSuffix}`, // NIF único
        perfil: 'VIP',
      });
    }
    
    log.success(`Cliente selecionado: ${cliente.nome} (ID: ${cliente.id})`);
    await wait(500);
    
    // Passo 2: Buscar ou criar veículo
    log.step('Passo 2: Buscar/Criar Veículo');
    let veiculo;
    const veiculosResponse = await apiRequest(`/api/veiculos?cliente_id=${cliente.id}&limit=1`);
    
    if (Array.isArray(veiculosResponse) && veiculosResponse.length > 0) {
      veiculo = veiculosResponse[0];
      log.success(`Veículo encontrado: ${veiculo.marca} ${veiculo.modelo} (${veiculo.matricula})`);
    } else {
      veiculo = await apiRequest('/api/veiculos', 'POST', {
        cliente_id: cliente.id,
        marca: 'BMW',
        modelo: '320d',
        ano: 2020,
        matricula: `BB-${Math.floor(Math.random() * 90 + 10)}-CC`, // Matrícula única
        cor: 'Branco',
        combustivel: 'Diesel',
        cilindrada: 2000,
        kms: 45000,
      });
      log.success(`Veículo criado: ${veiculo.marca} ${veiculo.modelo} (${veiculo.matricula})`);
    }
    await wait(500);
    
    // Passo 3: Criar ordem de trabalho complexa
    log.step('Passo 3: Criar Ordem de Trabalho Complexa');
    const timestamp = Date.now();
    const refOrdem = `OT${timestamp % 100000}`; // Referência curta
    
    const ordemData = {
      ref_ordem_trabalho: refOrdem,
      cliente_id: cliente.id,
      veiculo_id: veiculo.id,
      data_inicio: new Date().toISOString().split('T')[0],
      estado: 'em_progresso',
      kms: veiculo.kms + 1000,
      descricao_problema: 'Cliente reporta ruído nos travões e luzes do painel acesas',
      trabalho_realizado: '',
      recomendacoes: '',
      contacto_nome: cliente.nome,
      contacto_telefone: cliente.telefone,
      items: [
        // Serviços
        {
          tipo_item: 'servico',
          descricao: 'Diagnóstico completo',
          quantidade: 1,
          preco_unitario: 50.00,
          valor_total: 50.00,
        },
        {
          tipo_item: 'servico',
          descricao: 'Substituição pastilhas travão',
          quantidade: 1,
          preco_unitario: 80.00,
          valor_total: 80.00,
        },
        {
          tipo_item: 'servico',
          descricao: 'Verificação sistema elétrico',
          quantidade: 1,
          preco_unitario: 40.00,
          valor_total: 40.00,
        },
        // Peças
        {
          tipo_item: 'peca',
          descricao: 'Pastilhas travão frente (jogo)',
          quantidade: 1,
          preco_unitario: 65.00,
          valor_total: 65.00,
        },
        {
          tipo_item: 'peca',
          descricao: 'Pastilhas travão trás (jogo)',
          quantidade: 1,
          preco_unitario: 55.00,
          valor_total: 55.00,
        },
        {
          tipo_item: 'peca',
          descricao: 'Discos travão frente (par)',
          quantidade: 1,
          preco_unitario: 120.00,
          valor_total: 120.00,
        },
        {
          tipo_item: 'peca',
          descricao: 'Sensor ABS',
          quantidade: 1,
          preco_unitario: 45.00,
          valor_total: 45.00,
        },
        {
          tipo_item: 'peca',
          descricao: 'Fluido travões DOT4 (1L)',
          quantidade: 1,
          preco_unitario: 15.00,
          valor_total: 15.00,
        },
      ],
      total_pecas: 300.00,
      total_mao_obra: 170.00,
      total_desconto: 20.00, // 20€ de desconto
      total_imposto: 0,
      total_geral: 450.00,
    };
    
    const ordemResponse = await apiRequest('/api/ordens-trabalho', 'POST', ordemData);
    const ordem = ordemResponse; // A resposta já é o objeto ordem
    log.success(`Ordem criada: ${ordem.ref_ordem_trabalho} - Total: €${ordem.total_geral}`);
    await wait(500);
    
    // Passo 4: Simular progressão nos estados
    log.step('Passo 4: Simular Progressão de Estados');
    
    await wait(1000);
    log.info('Aguardando peças...');
    await apiRequest(`/api/ordens-trabalho/${ordem.id}`, 'PUT', {
      estado: 'aguarda_peca',
    });
    log.success('Estado: Aguardando peças');
    
    await wait(1500);
    log.info('Peças recebidas, trabalho em andamento...');
    await apiRequest(`/api/ordens-trabalho/${ordem.id}`, 'PUT', {
      estado: 'em_progresso',
      trabalho_realizado: 'Diagnóstico concluído. Substituição de pastilhas e discos em andamento.',
    });
    log.success('Estado: Em progresso');
    
    await wait(1500);
    log.info('Trabalho concluído!');
    await apiRequest(`/api/ordens-trabalho/${ordem.id}`, 'PUT', {
      estado: 'concluida',
      data_conclusao: new Date().toISOString().split('T')[0],
      trabalho_realizado: 'Todos os trabalhos concluídos com sucesso. Pastilhas, discos e sensor ABS substituídos. Sistema testado.',
      recomendacoes: 'Verificar travões novamente em 1000 km. Evitar travagens bruscas nos primeiros 200 km.',
    });
    log.success('Estado: Concluída');
    await wait(500);
    
    // Passo 5: Criar fatura
    log.step('Passo 5: Criar Fatura');
    const timestamp2 = Date.now();
    const proximoNumeroResponse = await apiRequest('/api/faturas/proximo-numero');
    const numeroFatura = proximoNumeroResponse?.numero || `F${timestamp2 % 100000}`; // Número curto
    
    const subtotal = 450.00;
    const iva = subtotal * 0.23;
    const total = subtotal + iva;
    
    const faturaData = {
      numero_fatura: numeroFatura,
      cliente_id: cliente.id,
      ordem_trabalho_id: ordem.id,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'pendente',
      subtotal: subtotal,
      valor_imposto: iva,
      valor_desconto: 20.00,
      valor_total: total,
      valor_pago: 0,
      notas: 'Fatura referente a reparação de travões e sistema elétrico',
    };
    
    const faturaResponse = await apiRequest('/api/faturas', 'POST', faturaData);
    const fatura = faturaResponse; // A resposta já é o objeto fatura
    log.success(`Fatura criada: ${fatura.numero_fatura} - Total: €${fatura.valor_total.toFixed(2)}`);
    await wait(500);
    
    // Passo 6: Simular pagamento parcial
    log.step('Passo 6: Pagamento Parcial');
    const pagamentoParcial = total / 2;
    await apiRequest(`/api/faturas/${fatura.id}`, 'PUT', {
      estado: 'parcial',
      valor_pago: pagamentoParcial,
    });
    log.success(`Pagamento parcial realizado: €${pagamentoParcial.toFixed(2)}`);
    await wait(1000);
    
    // Passo 7: Liquidar fatura
    log.step('Passo 7: Liquidar Fatura');
    await apiRequest(`/api/faturas/${fatura.id}`, 'PUT', {
      estado: 'paga',
      valor_pago: total,
      data_pagamento: new Date().toISOString().split('T')[0],
    });
    log.success('Fatura totalmente paga!');
    
    log.header('✅ CENÁRIO 2 CONCLUÍDO COM SUCESSO');
    
    return {
      cliente,
      veiculo,
      ordem,
      fatura,
    };
    
  } catch (error) {
    log.error(`Erro no Cenário 2: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// CENÁRIO 3: Fluxo Completo com Orçamento
// ============================================================================
async function cenario3_FluxoComOrcamento() {
  log.header('CENÁRIO 3: Fluxo Completo com Orçamento');
  
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  try {
    // Passo 1: Criar cliente
    log.step('Passo 1: Criar Cliente');
    const clienteData = {
      nome: 'Pedro Almeida',
      email: `pedro.almeida.${timestamp}@email.com`,
      telefone: '925678901',
      nif: `${300000000 + randomSuffix}`, // NIF único
      perfil: 'Normal',
    };
    
    const clienteResponse = await apiRequest('/api/clientes', 'POST', clienteData);
    const cliente = clienteResponse; // A resposta já é o objeto cliente
    log.success(`Cliente criado: ${cliente.nome}`);
    await wait(500);
    
    // Passo 2: Criar veículo
    log.step('Passo 2: Criar Veículo');
    const veiculoData = {
      cliente_id: cliente.id,
      marca: 'Renault',
      modelo: 'Clio',
      ano: 2015,
      matricula: `CC-${Math.floor(Math.random() * 90 + 10)}-DD`, // Matrícula única
      cor: 'Vermelho',
      combustivel: 'Gasolina',
      cilindrada: 1200,
      kms: 125000,
    };
    
    const veiculoResponse = await apiRequest('/api/veiculos', 'POST', veiculoData);
    const veiculo = veiculoResponse; // A resposta já é o objeto veículo
    log.success(`Veículo criado: ${veiculo.marca} ${veiculo.modelo}`);
    await wait(500);
    
    // Passo 3: Criar orçamento
    log.step('Passo 3: Criar Orçamento');
    const orcamentoResponse = await apiRequest('/api/orcamentos/next-id');
    const refOrcamento = orcamentoResponse?.ref_orcamento || `ORC${timestamp % 100000}`; // Referência curta
    
    const orcamentoData = {
      ref_orcamento: refOrcamento,
      cliente_id: cliente.id,
      veiculo_id: veiculo.id,
      data_orcamento: new Date().toISOString().split('T')[0],
      data_validade: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'pendente',
      descricao_problema: 'Motor a falhar e consumo elevado',
      items: [
        {
          tipo_item: 'servico',
          descricao: 'Diagnóstico motor',
          quantidade: 1,
          preco_unitario: 60.00,
          percentual_imposto: 23,
        },
        {
          tipo_item: 'servico',
          descricao: 'Limpeza injetores',
          quantidade: 1,
          preco_unitario: 120.00,
          percentual_imposto: 23,
        },
        {
          tipo_item: 'peca',
          descricao: 'Filtro de ar',
          quantidade: 1,
          preco_unitario: 25.00,
          percentual_imposto: 23,
        },
        {
          tipo_item: 'peca',
          descricao: 'Velas de ignição (jogo)',
          quantidade: 1,
          preco_unitario: 40.00,
          percentual_imposto: 23,
        },
      ],
      total_pecas: 65.00,
      total_mao_obra: 180.00,
      total_desconto: 0,
      total_imposto: 56.35,
      total_geral: 301.35,
      notas: 'Orçamento válido por 15 dias',
    };
    
    const orcamentoResp = await apiRequest('/api/orcamentos', 'POST', orcamentoData);
    const orcamento = orcamentoResp; // A resposta já é o objeto orçamento
    log.success(`Orçamento criado: ${orcamento.ref_orcamento} - €${orcamento.total_geral}`);
    await wait(1000);
    
    // Passo 4: Aprovar orçamento
    log.step('Passo 4: Aprovar Orçamento');
    await apiRequest(`/api/orcamentos/${orcamento.id}`, 'PUT', {
      estado: 'aprovado',
      data_aprovacao: new Date().toISOString().split('T')[0],
    });
    log.success('Orçamento aprovado pelo cliente');
    await wait(500);
    
    // Passo 5: Criar ordem de trabalho a partir do orçamento
    log.step('Passo 5: Criar Ordem de Trabalho');
    const refOrdem = `OT${timestamp % 100000}`; // Referência curta
    
    const ordemData = {
      ref_ordem_trabalho: refOrdem,
      cliente_id: cliente.id,
      veiculo_id: veiculo.id,
      orcamento_id: orcamento.id,
      data_inicio: new Date().toISOString().split('T')[0],
      estado: 'em_progresso',
      kms: veiculo.kms,
      descricao_problema: orcamentoData.descricao_problema,
      contacto_nome: cliente.nome,
      contacto_telefone: cliente.telefone,
      items: orcamentoData.items.map(item => ({
        tipo_item: item.tipo_item,
        descricao: item.descricao,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        valor_total: item.quantidade * item.preco_unitario,
      })),
      total_pecas: orcamentoData.total_pecas,
      total_mao_obra: orcamentoData.total_mao_obra,
      total_desconto: orcamentoData.total_desconto,
      total_imposto: orcamentoData.total_imposto,
      total_geral: orcamentoData.total_geral,
    };
    
    const ordemResp = await apiRequest('/api/ordens-trabalho', 'POST', ordemData);
    const ordem = ordemResp; // A resposta já é o objeto ordem
    log.success(`Ordem criada: ${ordem.ref_ordem_trabalho}`);
    await wait(1500);
    
    // Passo 6: Concluir ordem
    log.step('Passo 6: Concluir Ordem de Trabalho');
    await apiRequest(`/api/ordens-trabalho/${ordem.id}`, 'PUT', {
      estado: 'concluida',
      data_conclusao: new Date().toISOString().split('T')[0],
      trabalho_realizado: 'Limpeza de injetores realizada. Filtro e velas substituídos. Motor testado.',
      recomendacoes: 'Utilizar combustível de qualidade. Próxima revisão em 10.000 km.',
    });
    log.success('Ordem concluída');
    await wait(500);
    
    // Passo 7: Faturar
    log.step('Passo 7: Criar Fatura');
    const timestamp3 = Date.now();
    const proximoNumResp = await apiRequest('/api/faturas/proximo-numero');
    const numeroFatura = proximoNumResp?.numero || `F${timestamp3 % 100000}`; // Número curto
    
    const faturaData = {
      numero_fatura: numeroFatura,
      cliente_id: cliente.id,
      ordem_trabalho_id: ordem.id,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'pendente',
      subtotal: 245.00,
      valor_imposto: 56.35,
      valor_desconto: 0,
      valor_total: 301.35,
      valor_pago: 0,
    };
    
    const faturaResp = await apiRequest('/api/faturas', 'POST', faturaData);
    const fatura = faturaResp; // A resposta já é o objeto fatura
    log.success(`Fatura criada: ${fatura.numero_fatura}`);
    await wait(500);
    
    // Passo 8: Pagar
    log.step('Passo 8: Pagar Fatura');
    await apiRequest(`/api/faturas/${fatura.id}`, 'PUT', {
      estado: 'paga',
      valor_pago: 301.35,
      data_pagamento: new Date().toISOString().split('T')[0],
    });
    log.success('Fatura paga!');
    
    log.header('✅ CENÁRIO 3 CONCLUÍDO COM SUCESSO');
    
    return {
      cliente,
      veiculo,
      orcamento,
      ordem,
      fatura,
    };
    
  } catch (error) {
    log.error(`Erro no Cenário 3: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// MAIN - Executar todos os cenários
// ============================================================================
async function main() {
  console.clear();
  log.header('🚀 TESTE DE FLUXO COMPLETO - SISTEMA DE GESTÃO DE OFICINA');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Data/Hora: ${new Date().toLocaleString('pt-PT')}\n`);
  
  const results = {
    cenario1: null,
    cenario2: null,
    cenario3: null,
    errors: [],
  };
  
  try {
    // Verificar se a API está online
    log.step('Verificando conectividade com a API...');
    await apiRequest('/api/health');
    log.success('API Online!');
    await wait(1000);
    
    // Executar cenários
    try {
      results.cenario1 = await cenario1_ClienteNovoAgendamentoSimples();
      await wait(2000);
    } catch (error) {
      results.errors.push({ cenario: 1, error: error.message });
    }
    
    try {
      results.cenario2 = await cenario2_ClienteExistenteMultiplasPecas();
      await wait(2000);
    } catch (error) {
      results.errors.push({ cenario: 2, error: error.message });
    }
    
    try {
      results.cenario3 = await cenario3_FluxoComOrcamento();
      await wait(2000);
    } catch (error) {
      results.errors.push({ cenario: 3, error: error.message });
    }
    
    // Resumo final
    log.header('📊 RESUMO DOS TESTES');
    
    const cenariosConcluidos = [
      results.cenario1,
      results.cenario2,
      results.cenario3,
    ].filter(Boolean).length;
    
    const totalCenarios = 3;
    const percentualSucesso = (cenariosConcluidos / totalCenarios * 100).toFixed(0);
    
    console.log(`\n${colors.bright}Cenários executados:${colors.reset} ${cenariosConcluidos}/${totalCenarios} (${percentualSucesso}%)\n`);
    
    if (results.cenario1) {
      log.success(`Cenário 1: ${results.cenario1.cliente.nome} - Fatura ${results.cenario1.fatura.numero_fatura}`);
    }
    if (results.cenario2) {
      log.success(`Cenário 2: ${results.cenario2.cliente.nome} - Fatura ${results.cenario2.fatura.numero_fatura}`);
    }
    if (results.cenario3) {
      log.success(`Cenário 3: ${results.cenario3.cliente.nome} - Fatura ${results.cenario3.fatura.numero_fatura}`);
    }
    
    if (results.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bright}Erros encontrados:${colors.reset}`);
      results.errors.forEach(err => {
        log.error(`Cenário ${err.cenario}: ${err.error}`);
      });
    }
    
    log.header(cenariosConcluidos === totalCenarios ? '✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!' : '⚠️ TESTES CONCLUÍDOS COM AVISOS');
    
  } catch (error) {
    log.error(`Erro fatal: ${error.message}`);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
