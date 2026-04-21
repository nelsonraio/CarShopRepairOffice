import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';

// Drizzle utilities
import { eq, desc, inArray, and, sql } from 'drizzle-orm';
import {
  orcamentos,
  itensOrcamento,
  clientes,
  veiculos,
  ordensTrabalho,
  mecanicos,
  itensOrdemTrabalho,
  agendamentos
} from '../../../../drizzle/migrations/schema';

// Import Drizzle connection globally
import { db } from '@/db/connection';

const normalizeText = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ');
const normalizeNullable = (value: unknown) => {
  const normalized = normalizeText(value);
  return normalized || null;
};

const NOT_APPLICABLE_CLIENT_NAMES = new Set(['n/a', 'na', 'nao aplicavel', 'não aplicavel', 'nao aplicável', 'não aplicável']);

function normalizeBudgetClientName(value: unknown): string {
  const normalized = normalizeText(value);
  if (!normalized) return 'N/A';
  return NOT_APPLICABLE_CLIENT_NAMES.has(normalized.toLowerCase()) ? 'N/A' : normalized;
}

async function resolveBudgetClientId(payload: {
  clientId?: unknown;
  clientName?: unknown;
  contactPhone?: unknown;
}) {
  const parsedClientId = payload.clientId ? parseInt(String(payload.clientId), 10) : NaN;
  if (Number.isFinite(parsedClientId) && parsedClientId > 0) {
    return parsedClientId;
  }

  const clientName = normalizeBudgetClientName(payload.clientName);
  const contactPhone = normalizeText(payload.contactPhone) || 'N/A';

  const [clientByNameAndPhone] = await db.select().from(clientes)
    .where(and(eq(clientes.nome, clientName), eq(clientes.telefone, contactPhone)))
    .limit(1);
  if (clientByNameAndPhone) {
    return Number(clientByNameAndPhone.id);
  }

  const clientsByName = await db.select().from(clientes)
    .where(eq(clientes.nome, clientName))
    .limit(2);
  if (clientsByName.length > 0) {
    return Number(clientsByName[0]?.id);
  }

  const [insertResult]: any = await db.insert(clientes).values({
    nome: clientName,
    telefone: contactPhone,
    email: normalizeNullable(null),
    nif: normalizeNullable(null),
    endereco: normalizeNullable(null),
    perfilId: null,
    ativo: 1,
    dataRegisto: new Date().toISOString().slice(0, 10),
    totalGasto: '0.00',
    visitas: 0
  });

  const insertId = insertResult?.insertId ?? insertResult?.[0]?.insertId;
  if (!insertId) {
    throw new Error('Falha ao resolver cliente do orçamento.');
  }

  return Number(insertId);
}

/**
 * Helper: Serialize budget items with proper type conversion
 */
function serializeOrcamentoItem(item: any): any {
  return {
    ...item,
    id: Number(item.id),
    orcamento_id: Number(item.orcamento_id ?? item.orcamentoId),
    tipo_item: item.tipo_item ?? item.tipoItem ?? null,
    servico_id: item.servico_id ? Number(item.servico_id) : (item.servicoId ? Number(item.servicoId) : null),
    peca_id: item.peca_id ? Number(item.peca_id) : (item.pecaId ? Number(item.pecaId) : null),
    quantidade: Number(item.quantidade),
    preco_unitario: Number(item.preco_unitario ?? item.precoUnitario),
    valor_total: Number(item.valor_total ?? item.valorTotal)
  };
}

/**
 * Helper: Serialize complete budget with all relations
 */
function serializeOrcamento(orcamento: any, veiculo?: any, cliente?: any): any {
  const v = veiculo ?? orcamento.veiculo ?? null;
  const c = cliente ?? orcamento.cliente ?? null;
  return {
    id: Number(orcamento.id),
    ref_orcamento: orcamento.refOrcamento ?? orcamento.ref_orcamento ?? '',
    estado: orcamento.estado ?? 'pendente',
    data_emissao: orcamento.dataEmissao ?? orcamento.data_emissao ?? null,
    data_expiracao: orcamento.dataExpiracao ?? orcamento.data_expiracao ?? null,
    data_aprovacao: orcamento.dataAprovacao ?? orcamento.data_aprovacao ?? null,
    notas: orcamento.notas ?? null,
    kms: orcamento.kms ?? null,
    contacto_nome: orcamento.contactoNome ?? orcamento.contacto_nome ?? null,
    contacto_telefone: orcamento.contactoTelefone ?? orcamento.contacto_telefone ?? null,
    contacto_email: orcamento.contactoEmail ?? orcamento.contacto_email ?? null,
    criado_em: orcamento.criadoEm ?? orcamento.criado_em ?? null,
    atualizado_em: orcamento.atualizadoEm ?? orcamento.atualizado_em ?? null,
    cliente_id: Number(orcamento.clienteId ?? orcamento.cliente_id ?? 0),
    veiculo_id: orcamento.veiculoId ?? orcamento.veiculo_id ? Number(orcamento.veiculoId ?? orcamento.veiculo_id) : null,
    total_pecas: Number(orcamento.totalPecas ?? orcamento.total_pecas ?? 0),
    total_mao_obra: Number(orcamento.totalMaoObra ?? orcamento.total_mao_obra ?? 0),
    total_desconto: Number(orcamento.totalDesconto ?? orcamento.total_desconto ?? 0),
    total_imposto: Number(orcamento.totalImposto ?? orcamento.total_imposto ?? 0),
    total_geral: Number(orcamento.totalGeral ?? orcamento.total_geral ?? 0),
    cliente: c ? { ...c, id: Number(c.id) } : null,
    veiculo: v ? { ...v, id: Number(v.id) } : null,
    itens_orcamento: (orcamento.itens_orcamento || []).map(serializeOrcamentoItem)
  };
}

/**
 * Helper: Parse budget items from request
 */
function parseBudgetItems(items: any[], orcamentoId: number): any[] {
  const budgetId = Number(orcamentoId);
  if (!Number.isFinite(budgetId)) {
    throw new Error('orcamentoId invalido para itens_orcamento');
  }

  return items.map((item: any) => {
    const itemTypeRaw = String(item.type ?? item.tipo_item ?? item.tipo ?? '').toLowerCase();
    const itemType = itemTypeRaw === 'service' || itemTypeRaw === 'servico' ? 'servico' : 'peca';

    const rawItemId = item.id ?? item.servico_id ?? item.peca_id ?? null;
    const parsedId = rawItemId !== null && rawItemId !== undefined ? parseInt(String(rawItemId), 10) : NaN;
    const hasNumericId = Number.isFinite(parsedId);

    const quantidade = parseFloat(String(item.quantity ?? item.quantidade ?? 1)) || 1;
    const precoUnitario = parseFloat(String(item.unitPrice ?? item.preco_unitario ?? item.precoUnitario ?? 0)) || 0;
    const valorTotalInput = parseFloat(String(item.total ?? item.valor_total ?? item.valorTotal ?? NaN));
    const valorTotal = Number.isFinite(valorTotalInput) ? valorTotalInput : quantidade * precoUnitario;

    return {
      orcamentoId: budgetId,
      tipoItem: itemType,
      servicoId: itemType === 'servico' && hasNumericId ? parsedId : null,
      pecaId: itemType === 'peca' && hasNumericId ? parsedId : null,
      descricao: String(item.name ?? item.descricao ?? '').trim(),
      quantidade: String(quantidade),
      precoUnitario: String(precoUnitario),
      valorTotal: String(valorTotal)
    };
  });
}

/**
 * POST: Create new budget with items
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ref_orcamento,
      cliente_id,
      veiculo_id,
      preparado_por,
      data_emissao,
      data_expiracao,
      estado,
      kms,
      contacto_nome,
      contacto_telefone,
      contacto_email,
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      notas,
      items
    } = body;
    const resolvedClienteId = await resolveBudgetClientId({
      clientId: cliente_id,
      clientName: body.cliente_nome_livre,
      contactPhone: contacto_telefone,
    });

    if (!veiculo_id) {
      return successResponse({ error: 'veiculo ainda nao existente. Criar primeiro.' }, 400);
    }


    // --- DRIZZLE ORM MIGRATION START ---
    // db já importado no topo do arquivo

    // Insert orcamento (MySQL não suporta .returning())
    await db.insert(orcamentos).values({
      refOrcamento: ref_orcamento,
      clienteId: resolvedClienteId,
      veiculoId: parseInt(veiculo_id),
      preparadoPor: preparado_por ? parseInt(preparado_por) : null,
      dataEmissao: data_emissao ? data_emissao : new Date().toISOString().slice(0, 10),
      dataExpiracao: data_expiracao ? data_expiracao : null,
      estado: estado || 'pendente',
      kms: kms ? parseInt(kms) : 0,
      contactoNome: contacto_nome || '',
      contactoTelefone: contacto_telefone || '',
      contactoEmail: contacto_email || '',
      totalPecas: String(parseFloat(total_pecas) || 0),
      totalMaoObra: String(parseFloat(total_mao_obra) || 0),
      totalDesconto: String(parseFloat(total_desconto) || 0),
      totalImposto: String(parseFloat(total_imposto) || 0),
      totalGeral: String(parseFloat(total_geral)),
      notas: notas || ''
    });

    // Buscar o orçamento recém-criado pelo ref_orcamento
    const [orcamento] = await db.select().from(orcamentos)
      .where(eq(orcamentos.refOrcamento, ref_orcamento))
      .orderBy(desc(orcamentos.id))
      .limit(1);

    // Insert budget items
    if (items && items.length > 0 && orcamento?.id) {
      const budgetItems = parseBudgetItems(items, parseInt(String(orcamento.id), 10));
      await db.insert(itensOrcamento).values(budgetItems);
    }

    if (!orcamento) {
      return successResponse({ error: 'Erro ao criar orçamento' }, 500);
    }
    await registarAuditoria('CREATE', 'orcamentos', Number(orcamento.id), null, { ref_orcamento, cliente_id: resolvedClienteId, total_geral: parseFloat(total_geral) }, request);
    return successResponse({
      success: true,
      orcamento: {
        id: Number(orcamento.id),
        ref_orcamento: orcamento.refOrcamento,
        total_geral: Number(orcamento.totalGeral)
      }
    }, 201);
    // --- DRIZZLE ORM MIGRATION END ---
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * GET: Fetch budget by ID or paginated list of budgets
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Buscar orçamento único por ID usando Drizzle
    if (id) {
      const [orcamento] = await db.select().from(orcamentos).where(eq(orcamentos.id, parseInt(id)));
      if (!orcamento) {
        return successResponse({ error: 'Budget not found' }, 404);
      }
      // Buscar cliente e itens
      const [cliente] = await db.select().from(clientes).where(eq(clientes.id, orcamento.clienteId));
      const itens = await db.select().from(itensOrcamento).where(eq(itensOrcamento.orcamentoId, orcamento.id));
      // Buscar veículo se existir
      let veiculo = null;
      if (orcamento.veiculoId) {
        [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, orcamento.veiculoId));
      }
      const serialized = serializeOrcamento({ ...orcamento, cliente, itens_orcamento: itens }, veiculo, cliente);
      return successResponse({ orcamento: serialized });
    }

    // Buscar lista paginada de orçamentos usando Drizzle
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const total = await db.select({ count: sql`COUNT(*)` }).from(orcamentos);
    const orcamentosList = await db.select().from(orcamentos).orderBy(desc(orcamentos.criadoEm)).limit(limit).offset(offset);
    // Buscar clientes, veículos e itens para cada orçamento
    const orcamentoIds = orcamentosList.map((o: any) => Number(o.id));
    const clienteIds = [...new Set(orcamentosList.map((o: any) => Number(o.clienteId)).filter(Boolean))];
    const veiculoIds = [...new Set(orcamentosList.map((o: any) => Number(o.veiculoId)).filter(Boolean))];
    const [clientesList, veiculosList, itensList, workOrders] = await Promise.all([
      clienteIds.length ? db.select().from(clientes).where(inArray(clientes.id, clienteIds)) : Promise.resolve([]),
      veiculoIds.length ? db.select().from(veiculos).where(inArray(veiculos.id, veiculoIds)) : Promise.resolve([]),
      orcamentoIds.length ? db.select().from(itensOrcamento).where(inArray(itensOrcamento.orcamentoId, orcamentoIds)) : Promise.resolve([]),
      orcamentoIds.length ? db.select().from(ordensTrabalho).where(inArray(ordensTrabalho.orcamentoId, orcamentoIds)) : Promise.resolve([]),
    ]);
    // Buscar mecânicos
    const mecanicoIds = [...new Set(workOrders.map((wo: any) => wo.mecanicoId).filter(Boolean))];
    const mecanicosList = mecanicoIds.length ? await db.select().from(mecanicos).where(inArray(mecanicos.id, mecanicoIds)) : [];
    const mechanicMap = new Map(workOrders.map((wo: any) => [wo.orcamentoId, mecanicosList.find((m: any) => m.id === wo.mecanicoId)?.nome || null]));
    // Serializar e enriquecer
    const serializedOrcamentos = orcamentosList.map((orcamento: any) => {
      const cliente = clientesList.find((c: any) => c.id === orcamento.clienteId);
      const veiculo = veiculosList.find((v: any) => v.id === orcamento.veiculoId);
      const itens = itensList.filter((i: any) => i.orcamentoId === orcamento.id);
      return {
        ...serializeOrcamento({ ...orcamento, cliente, veiculo, itens_orcamento: itens }),
        mecanico_nome: mechanicMap.get(orcamento.id) || null
      };
    });
    const totalCount = Number(total[0]?.count) || 0;
    return successResponse({
      orcamentos: serializedOrcamentos,
      pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) }
    });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * Helper: Generate work order reference from budget reference
 */
function generateWorkOrderRef(budgetRef?: string | null, budgetId?: string | number): string {
  const safeRef = String(budgetRef ?? '').trim();
  if (safeRef) {
    return safeRef
      .replace(/^ORC-?/i, 'OT-')
      .replace(/^OR-?/i, 'OT-');
  }

  const fallbackId = String(budgetId ?? '').trim();
  return fallbackId ? `OT-${fallbackId}` : `OT-${Date.now()}`;
}

/**
 * Helper: Delete work order associated with budget
 */
async function deleteWorkOrderFromBudget(budgetId: string) {
  // Buscar ordem de trabalho associada ao orçamento
  const [workOrder] = await db.select().from(ordensTrabalho).where(eq(ordensTrabalho.orcamentoId, parseInt(budgetId)));
  if (workOrder) {
    // Deletar itens da ordem de trabalho
    await db.delete(itensOrdemTrabalho).where(eq(itensOrdemTrabalho.ordemTrabalhoId, workOrder.id));
    // Deletar a ordem de trabalho
    await db.delete(ordensTrabalho).where(eq(ordensTrabalho.id, workOrder.id));
  }
}

/**
 * Helper: Create work order from budget
 */
async function createWorkOrderFromBudget(
  budgetId: string, 
  currentOrcamento: any, 
  mecanico_id?: string
) {
  const refOrcamento = currentOrcamento.refOrcamento ?? currentOrcamento.ref_orcamento ?? null;
  const workOrderRef = generateWorkOrderRef(refOrcamento, budgetId);
  const clienteId = Number(currentOrcamento.clienteId ?? currentOrcamento.cliente_id ?? 0) || 0;
  const veiculoId = Number(currentOrcamento.veiculoId ?? currentOrcamento.veiculo_id ?? 0);
  const kms = Number(currentOrcamento.kms ?? 0) || 0;
  const contactoNome = currentOrcamento.contactoNome ?? currentOrcamento.contacto_nome ?? '';
  const contactoTelefone = currentOrcamento.contactoTelefone ?? currentOrcamento.contacto_telefone ?? '';
  const contactoEmail = currentOrcamento.contactoEmail ?? currentOrcamento.contacto_email ?? '';

  if (!Number.isFinite(veiculoId) || veiculoId <= 0) {
    throw new Error('veiculo_id invalido ao criar ordem de trabalho a partir do orçamento');
  }

  // Deletar agendamentos cancelados
  if (clienteId || veiculoId) {
    let matricula: string | null = null;
    if (veiculoId) {
      const [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, veiculoId));
      matricula = veiculo?.matricula ?? null;
    }
    // Deletar agendamentos
    let where = and(eq(agendamentos.estado, 'agendado'));
    if (clienteId) where = and(where, eq(agendamentos.clienteId, clienteId));
    if (matricula) where = and(where, eq(agendamentos.matricula, matricula));
    await db.delete(agendamentos).where(where);
  }
  // Verificar se ordem de trabalho já existe
  const [existingWorkOrder] = await db.select().from(ordensTrabalho).where(eq(ordensTrabalho.orcamentoId, parseInt(budgetId)));
  if (existingWorkOrder) {
    // Atualizar ordem existente
    const updateData: any = {
      contactoNome: currentOrcamento.contacto_nome ?? null,
      contactoTelefone: currentOrcamento.contacto_telefone ?? null,
      contactoEmail: currentOrcamento.contacto_email ?? null
    };
    if (mecanico_id) updateData.mecanicoId = parseInt(mecanico_id);
    await db.update(ordensTrabalho).set(updateData).where(eq(ordensTrabalho.id, existingWorkOrder.id));
  } else {
    const budgetItemsRows = await db
      .select()
      .from(itensOrcamento)
      .where(eq(itensOrcamento.orcamentoId, parseInt(budgetId, 10)));

    // Criar nova ordem de trabalho
    await db.insert(ordensTrabalho).values({
      refOrdemTrabalho: workOrderRef,
      clienteId,
      veiculoId,
      orcamentoId: parseInt(budgetId),
      mecanicoId: mecanico_id ? parseInt(mecanico_id) : null,
      dataInicio: new Date().toISOString().slice(0, 10),
      estado: 'em_andamento',
      kms,
      contactoNome,
      contactoTelefone,
      contactoEmail,
      totalPecas: String(currentOrcamento.totalPecas ?? currentOrcamento.total_pecas ?? 0),
      totalMaoObra: String(currentOrcamento.totalMaoObra ?? currentOrcamento.total_mao_obra ?? 0),
      totalDesconto: String(currentOrcamento.totalDesconto ?? currentOrcamento.total_desconto ?? 0),
      totalImposto: String(currentOrcamento.totalImposto ?? currentOrcamento.total_imposto ?? 0),
      totalGeral: String(currentOrcamento.totalGeral ?? currentOrcamento.total_geral ?? 0)
    });
    // Drizzle MySQL: não retorna insertId diretamente, buscar pelo refOrdemTrabalho
    const [ordemTrabalho] = await db.select().from(ordensTrabalho).where(eq(ordensTrabalho.refOrdemTrabalho, workOrderRef)).orderBy(desc(ordensTrabalho.id)).limit(1);
    const ordemTrabalhoId = ordemTrabalho?.id;
    if (budgetItemsRows.length > 0 && ordemTrabalhoId) {
      const workOrderItems = budgetItemsRows.map((item: any) => ({
        ordemTrabalhoId,
        tipoItem: item.tipoItem ?? item.tipo_item,
        servicoId: item.servicoId ? Number(item.servicoId) : (item.servico_id ? Number(item.servico_id) : null),
        pecaId: item.pecaId ? Number(item.pecaId) : (item.peca_id ? Number(item.peca_id) : null),
        descricao: item.descricao,
        quantidade: String(Number(item.quantidade) || 1),
        precoUnitario: String(Number(item.precoUnitario ?? item.preco_unitario) || 0),
        valorDesconto: String(Number(item.valorDesconto ?? item.valor_desconto) || 0),
        valorImposto: String(Number(item.valorImposto ?? item.valor_imposto) || 0),
        valorTotal: String(Number(item.valorTotal ?? item.valor_total) || 0),
        notas: item.notas || null
      }));
      await db.insert(itensOrdemTrabalho).values(workOrderItems);
    }
  }
}

/**
 * PUT: Update budget or budget items/status
 */
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return successResponse({ error: 'Budget ID is required' }, 400);
    }

      // Buscar orçamento atual usando Drizzle
      const [currentOrcamento] = await db.select().from(orcamentos)
        .where(eq(orcamentos.id, parseInt(id)))
        .limit(1);
      // Buscar itens, cliente e veiculo
      // Buscar itens, cliente e veiculo separadamente se necessário

    if (!currentOrcamento) {
      return successResponse({ error: 'Budget not found' }, 404);
    }

    // Full update mode (items provided)
    const body = await request.json();
    const items = body.items;
    if (Array.isArray(items)) {
      const resolvedClienteId = body.cliente_id || body.cliente_nome_livre
        ? await resolveBudgetClientId({
          clientId: body.cliente_id,
          clientName: body.cliente_nome_livre,
          contactPhone: body.contacto_telefone,
        })
        : currentOrcamento.clienteId;
      const updateData: any = {
        refOrcamento: body.ref_orcamento ?? currentOrcamento.refOrcamento,
        clienteId: resolvedClienteId,
        veiculoId: body.veiculo_id ? BigInt(body.veiculo_id) : currentOrcamento.veiculoId,
        dataEmissao: body.data_emissao ? new Date(body.data_emissao) : currentOrcamento.dataEmissao,
        dataExpiracao: body.data_expiracao ? new Date(body.data_expiracao) : currentOrcamento.dataExpiracao,
        estado: body.estado ?? currentOrcamento.estado,
        kms: body.kms ? parseInt(body.kms) : currentOrcamento.kms,
        contactoNome: body.contacto_nome ?? currentOrcamento.contactoNome,
        contactoTelefone: body.contacto_telefone ?? currentOrcamento.contactoTelefone,
        contactoEmail: body.contacto_email ?? currentOrcamento.contactoEmail,
        totalPecas: Number(body.total_pecas ?? currentOrcamento.totalPecas),
        totalMaoObra: Number(body.total_mao_obra ?? currentOrcamento.totalMaoObra),
        totalDesconto: Number(body.total_desconto ?? currentOrcamento.totalDesconto),
        totalImposto: Number(body.total_imposto ?? currentOrcamento.totalImposto),
        totalGeral: Number(body.total_geral ?? currentOrcamento.totalGeral),
        notas: body.notas ?? currentOrcamento.notas
      };
      await db.update(orcamentos).set(updateData).where(eq(orcamentos.id, parseInt(id)));
      await db.delete(itensOrcamento).where(eq(itensOrcamento.orcamentoId, parseInt(id)));
      const budgetItems = parseBudgetItems(items, parseInt(id, 10));
      if (budgetItems.length > 0) {
        await db.insert(itensOrcamento).values(budgetItems);
      }
      await registarAuditoria('UPDATE', 'orcamentos', Number(id), null, { total_geral: Number(body.total_geral ?? currentOrcamento.totalGeral), items_count: budgetItems.length }, request);
      return successResponse({ success: true });
    }

    // Status update mode
    const estado = body.estado;
    const mecanico_id = body.mecanico_id;
    if (!estado) {
      return successResponse({ error: 'Status is required' }, 400);
    }
    const updateData: any = { estado };
    if (estado === 'Aprovado') {
      updateData.dataAprovacao = new Date();
    }
    // Delete work order when going back from Aprovado to Pendente ou Em Aprovação
    const estadoAnteriorAprovado = currentOrcamento.estado?.toLowerCase() === 'aprovado';
    const novoEstadoPendente = estado?.toLowerCase() === 'pendente' || estado?.toLowerCase() === 'em aprovação';
    if (estadoAnteriorAprovado && novoEstadoPendente) {
      await deleteWorkOrderFromBudget(id);
    }
    await db.update(orcamentos).set(updateData).where(eq(orcamentos.id, parseInt(id)));
    // Create work order when budget is approved
    if (estado === 'Aprovado') {
      await createWorkOrderFromBudget(id, currentOrcamento, mecanico_id);
    }
    await registarAuditoria('UPDATE', 'orcamentos', Number(id), { estado: currentOrcamento.estado }, { estado: updateData.estado }, request);
    return successResponse({
      success: true,
      orcamento: { id: Number(id), estado: updateData.estado }
    });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * DELETE: Delete budget and associated work order
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return successResponse({ error: 'Budget ID is required' }, 400);
    }

    // Verificar se orçamento existe
    const [budget] = await db.select().from(orcamentos).where(eq(orcamentos.id, parseInt(id)));

    if (!budget) {
      return successResponse({ error: 'Budget not found' }, 404);
    }

    // Delete associated work order if exists
    await deleteWorkOrderFromBudget(id);

    // Delete budget items
    await db.delete(itensOrcamento).where(eq(itensOrcamento.orcamentoId, parseInt(id)));

    // Delete budget
    await db.delete(orcamentos).where(eq(orcamentos.id, parseInt(id)));

    await registarAuditoria('DELETE', 'orcamentos', Number(id), { ref_orcamento: budget.refOrcamento, estado: budget.estado }, null, request);

    return successResponse({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


