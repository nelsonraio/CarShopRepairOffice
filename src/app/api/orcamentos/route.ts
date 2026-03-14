import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * Initialize Prisma Client for database operations
 */
// @ts-ignore
const prisma = new PrismaClient();
const prismaAny = prisma as any;

/**
 * Helper: Serialize budget items with proper type conversion
 */
function serializeOrcamentoItem(item: any): any {
  return {
    ...item,
    id: Number(item.id),
    orcamento_id: Number(item.orcamento_id),
    servico_id: item.servico_id ? Number(item.servico_id) : null,
    peca_id: item.peca_id ? Number(item.peca_id) : null,
    quantidade: Number(item.quantidade),
    preco_unitario: Number(item.preco_unitario),
    valor_total: Number(item.valor_total)
  };
}

/**
 * Helper: Serialize complete budget with all relations
 */
function serializeOrcamento(orcamento: any, veiculo?: any, cliente?: any): any {
  return {
    ...orcamento,
    id: Number(orcamento.id),
    veiculo_id: orcamento.veiculo_id ? Number(orcamento.veiculo_id) : null,
    total_pecas: Number(orcamento.total_pecas),
    total_mao_obra: Number(orcamento.total_mao_obra),
    total_desconto: Number(orcamento.total_desconto),
    total_imposto: Number(orcamento.total_imposto),
    total_geral: Number(orcamento.total_geral),
    cliente: cliente ? { ...cliente, id: Number(cliente.id) } : orcamento.cliente ? { ...orcamento.cliente, id: Number(orcamento.cliente.id) } : null,
    veiculo: veiculo ? { ...veiculo, id: Number(veiculo.id) } : orcamento.veiculo ? { ...orcamento.veiculo, id: Number(orcamento.veiculo.id) } : null,
    itens_orcamento: (orcamento.itens_orcamento || []).map(serializeOrcamentoItem)
  };
}

/**
 * Helper: Parse budget items from request
 */
function parseBudgetItems(items: any[], orcamento_id: bigint): any[] {
  return items.map((item: any) => {
    const parsedId = parseInt(item.id, 10);
    const hasNumericId = Number.isFinite(parsedId);
    return {
      orcamento_id,
      tipo_item: item.type === 'service' ? 'servico' : 'peca',
      servico_id: item.type === 'service' && hasNumericId ? parsedId : null,
      peca_id: item.type === 'part' && hasNumericId ? parsedId : null,
      descricao: item.name,
      quantidade: parseFloat(item.quantity),
      preco_unitario: parseFloat(item.unitPrice),
      valor_total: parseFloat(item.total)
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

    if (!veiculo_id) {
      return successResponse({ error: 'veiculo ainda nao existente. Criar primeiro.' }, 400);
    }

    // Create the budget
    const orcamento = await prismaAny.orcamentos.create({
      data: {
        ref_orcamento,
        cliente_id: parseInt(cliente_id),
        veiculo_id: veiculo_id ? BigInt(veiculo_id) : null,
        preparado_por: preparado_por ? parseInt(preparado_por) : null,
        data_emissao: data_emissao ? new Date(data_emissao) : new Date(),
        data_expiracao: data_expiracao ? new Date(data_expiracao) : null,
        estado: estado || 'pendente',
        kms: kms ? parseInt(kms) : null,
        contacto_nome: contacto_nome || null,
        contacto_telefone: contacto_telefone || null,
        contacto_email: contacto_email || null,
        total_pecas: parseFloat(total_pecas) || 0,
        total_mao_obra: parseFloat(total_mao_obra) || 0,
        total_desconto: parseFloat(total_desconto) || 0,
        total_imposto: parseFloat(total_imposto) || 0,
        total_geral: parseFloat(total_geral),
        notas
      }
    });

    // Create budget items
    if (items && items.length > 0) {
      const budgetItems = parseBudgetItems(items, orcamento.id);
      await prisma.itens_orcamento.createMany({ data: budgetItems });
    }

    await registarAuditoria('CREATE', 'orcamentos', Number(orcamento.id), null, { ref_orcamento, cliente_id: parseInt(cliente_id), total_geral: parseFloat(total_geral) }, request);

    return successResponse({
      success: true,
      orcamento: {
        id: Number(orcamento.id),
        ref_orcamento: orcamento.ref_orcamento,
        total_geral: Number(orcamento.total_geral)
      }
    }, 201);
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
    
    // Fetch single budget by ID
    if (id) {
      const orcamento = await prismaAny.orcamentos.findUnique({
        where: { id: BigInt(id) },
        include: { cliente: true, itens_orcamento: true }
      });

      if (!orcamento) {
        return successResponse({ error: 'Budget not found' }, 404);
      }

      // Fetch vehicle if referenced
      let veiculo = null;
      if (orcamento.veiculo_id) {
        veiculo = await prisma.veiculos.findUnique({
          where: { id: orcamento.veiculo_id }
        });
      }

      const serialized = serializeOrcamento(orcamento, veiculo, orcamento.cliente);
      return successResponse({ orcamento: serialized });
    }

    // Fetch paginated list of budgets
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const [orcamentos, total] = await Promise.all([
      prismaAny.orcamentos.findMany({
        include: { cliente: true, veiculo: true, itens_orcamento: true },
        orderBy: { criado_em: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.orcamentos.count()
    ]);

    // Fetch mechanics for work orders
    const orcamentoIds = orcamentos.map((o: any) => o.id);
    const workOrders = await prismaAny.ordens_trabalho.findMany({
      where: { orcamento_id: { in: orcamentoIds } },
      include: { mecanico: true }
    });

    const mechanicMap = new Map(
      workOrders
        .filter((wo: any) => wo.orcamento_id && wo.mecanico?.nome)
        .map((wo: any) => [Number(wo.orcamento_id), wo.mecanico.nome])
    );

    // Serialize and enrich budgets with mechanic names
    const serializedOrcamentos = orcamentos
      .map((orcamento: any) => serializeOrcamento(orcamento))
      .map((orcamento: any) => ({
        ...orcamento,
        mecanico_nome: mechanicMap.get(orcamento.id) || null
      }));

    return successResponse({
      orcamentos: serializedOrcamentos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * Helper: Generate work order reference from budget reference
 */
function generateWorkOrderRef(budgetRef: string): string {
  return budgetRef
    .replace(/^ORC-?/i, 'OT-')
    .replace(/^OR-?/i, 'OT-');
}

/**
 * Helper: Delete work order associated with budget
 */
async function deleteWorkOrderFromBudget(budgetId: string) {
  // Find work order associated with this budget
  const workOrder = await prisma.ordens_trabalho.findFirst({
    where: { orcamento_id: BigInt(budgetId) }
  });

  if (workOrder) {
    // Delete work order items first
    await prisma.itens_ordem_trabalho.deleteMany({
      where: { ordem_trabalho_id: Number(workOrder.id) }
    });

    // Delete the work order
    await prisma.ordens_trabalho.delete({
      where: { id: workOrder.id }
    });
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
  const workOrderRef = generateWorkOrderRef(currentOrcamento.ref_orcamento);

  // Delete cancelled appointments
  if (currentOrcamento.cliente_id || currentOrcamento.veiculo_id) {
    let matricula: string | null = null;
    if (currentOrcamento.veiculo_id) {
      const veiculo = await prisma.veiculos.findUnique({
        where: { id: currentOrcamento.veiculo_id },
        select: { matricula: true }
      });
      matricula = veiculo?.matricula ?? null;
    }

    const where: any = { estado: 'agendado' };
    if (currentOrcamento.cliente_id) where.cliente_id = currentOrcamento.cliente_id;
    if (matricula) where.matricula = matricula;

    await prisma.agendamentos.deleteMany({ where });
  }

  // Check if work order exists
  const existingWorkOrder = await prisma.ordens_trabalho.findFirst({
    where: { orcamento_id: BigInt(budgetId) }
  });

  if (existingWorkOrder) {
    // Update existing work order
    const updateData: any = {
      contacto_nome: currentOrcamento.contacto_nome ?? null,
      contacto_telefone: currentOrcamento.contacto_telefone ?? null,
      contacto_email: currentOrcamento.contacto_email ?? null
    };
    if (mecanico_id) updateData.mecanico_id = parseInt(mecanico_id);

    await prismaAny.ordens_trabalho.update({
      where: { id: existingWorkOrder.id },
      data: updateData
    });
  } else {
    // Create new work order
    const ordemTrabalho = await prismaAny.ordens_trabalho.create({
      data: {
        ref_ordem_trabalho: workOrderRef,
        cliente_id: currentOrcamento.cliente_id || 0,
        veiculo_id: currentOrcamento.veiculo_id ? BigInt(currentOrcamento.veiculo_id) : null,
        orcamento_id: BigInt(budgetId),
        mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
        data_inicio: new Date(),
        estado: 'em_andamento',
        kms: currentOrcamento.kms || null,
        contacto_nome: currentOrcamento.contacto_nome ?? null,
        contacto_telefone: currentOrcamento.contacto_telefone ?? null,
        contacto_email: currentOrcamento.contacto_email ?? null,
        total_pecas: currentOrcamento.total_pecas || 0,
        total_mao_obra: currentOrcamento.total_mao_obra || 0,
        total_desconto: currentOrcamento.total_desconto || 0,
        total_imposto: currentOrcamento.total_imposto || 0,
        total_geral: currentOrcamento.total_geral || 0
      }
    });

    // Copy budget items to work order items
    if (currentOrcamento.itens_orcamento?.length > 0) {
      const workOrderItems = currentOrcamento.itens_orcamento.map((item: any) => ({
        ordem_trabalho_id: Number(ordemTrabalho.id),
        tipo_item: item.tipo_item,
        servico_id: item.servico_id ? Number(item.servico_id) : null,
        peca_id: item.peca_id ? Number(item.peca_id) : null,
        descricao: item.descricao,
        quantidade: Number(item.quantidade) || 1,
        preco_unitario: Number(item.preco_unitario) || 0,
        valor_desconto: Number(item.valor_desconto) || 0,
        valor_imposto: Number(item.valor_imposto) || 0,
        valor_total: Number(item.valor_total) || 0,
        notas: item.notas || null
      }));

      await prisma.itens_ordem_trabalho.createMany({ data: workOrderItems });
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

    const body = await request.json();
    const { estado, mecanico_id, items } = body;

    // Fetch current budget
    const currentOrcamento = await prismaAny.orcamentos.findUnique({
      where: { id: BigInt(id) },
      include: { itens_orcamento: true, cliente: true, veiculo: true }
    });

    if (!currentOrcamento) {
      return successResponse({ error: 'Budget not found' }, 404);
    }

    // Full update mode (items provided)
    if (Array.isArray(items)) {
      const updateData: any = {
        ref_orcamento: body.ref_orcamento ?? currentOrcamento.ref_orcamento,
        cliente_id: body.cliente_id ? parseInt(body.cliente_id) : currentOrcamento.cliente_id,
        veiculo_id: body.veiculo_id ? BigInt(body.veiculo_id) : currentOrcamento.veiculo_id,
        data_emissao: body.data_emissao ? new Date(body.data_emissao) : currentOrcamento.data_emissao,
        data_expiracao: body.data_expiracao ? new Date(body.data_expiracao) : currentOrcamento.data_expiracao,
        estado: body.estado ?? currentOrcamento.estado,
        kms: body.kms ? parseInt(body.kms) : currentOrcamento.kms,
        contacto_nome: body.contacto_nome ?? currentOrcamento.contacto_nome,
        contacto_telefone: body.contacto_telefone ?? currentOrcamento.contacto_telefone,
        contacto_email: body.contacto_email ?? currentOrcamento.contacto_email,
        total_pecas: Number(body.total_pecas ?? currentOrcamento.total_pecas),
        total_mao_obra: Number(body.total_mao_obra ?? currentOrcamento.total_mao_obra),
        total_desconto: Number(body.total_desconto ?? currentOrcamento.total_desconto),
        total_imposto: Number(body.total_imposto ?? currentOrcamento.total_imposto),
        total_geral: Number(body.total_geral ?? currentOrcamento.total_geral),
        notas: body.notas ?? currentOrcamento.notas
      };

      await prismaAny.orcamentos.update({
        where: { id: BigInt(id) },
        data: updateData
      });

      await prisma.itens_orcamento.deleteMany({ where: { orcamento_id: BigInt(id) } });

      const budgetItems = parseBudgetItems(items, BigInt(id));
      if (budgetItems.length > 0) {
        await prisma.itens_orcamento.createMany({ data: budgetItems });
      }

      await registarAuditoria('UPDATE', 'orcamentos', Number(id), null, { total_geral: Number(body.total_geral ?? currentOrcamento.total_geral), items_count: budgetItems.length }, request);

      return successResponse({ success: true });
    }

    // Status update mode
    if (!estado) {
      return successResponse({ error: 'Status is required' }, 400);
    }

    const updateData: any = { estado };
    if (estado === 'Aprovado') {
      updateData.data_aprovacao = new Date();
    }

    // Delete work order when going back from Aprovado to Pendente or Em Aprovação
    const estadoAnteriorAprovado = currentOrcamento.estado?.toLowerCase() === 'aprovado';
    const novoEstadoPendente = estado?.toLowerCase() === 'pendente' || estado?.toLowerCase() === 'em aprovação';
    
    if (estadoAnteriorAprovado && novoEstadoPendente) {
      await deleteWorkOrderFromBudget(id);
    }

    const updatedOrcamento = await prismaAny.orcamentos.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    // Create work order when budget is approved
    if (estado === 'Aprovado') {
      await createWorkOrderFromBudget(id, currentOrcamento, mecanico_id);
    }

    await registarAuditoria('UPDATE', 'orcamentos', Number(id), { estado: currentOrcamento.estado }, { estado: updatedOrcamento.estado }, request);

    return successResponse({
      success: true,
      orcamento: { id: Number(updatedOrcamento.id), estado: updatedOrcamento.estado }
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

    // Check if budget exists
    const budget = await prismaAny.orcamentos.findUnique({
      where: { id: BigInt(id) }
    });

    if (!budget) {
      return successResponse({ error: 'Budget not found' }, 404);
    }

    // Delete associated work order if exists
    await deleteWorkOrderFromBudget(id);

    // Delete budget items
    await prisma.itens_orcamento.deleteMany({
      where: { orcamento_id: BigInt(id) }
    });

    // Delete budget
    await prismaAny.orcamentos.delete({
      where: { id: BigInt(id) }
    });

    await registarAuditoria('DELETE', 'orcamentos', Number(id), { ref_orcamento: budget.ref_orcamento, estado: budget.estado }, null, request);

    return successResponse({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


