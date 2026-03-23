import {
  successResponse,
  errorResponse,
  handleDatabaseError,
  parseNum,
  mapDbStatusToFrontend,
  mapFrontendStatusToDb,
  mapPriority,
  formatDatePt,
  buildDataMap,
  extractUniqueIds
} from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { ordensTrabalho, clientes, veiculos, mecanicos, itensOrdemTrabalho, pecas } from '@/db/schema';
import { eq, inArray, desc, sql } from 'drizzle-orm';
import { and } from 'drizzle-orm';
// already imported

type WorkOrderItemLike = {
  id?: number | bigint;
  tipo_item?: string;
  descricao?: string | null;
  quantidade?: number | string | null;
  preco_unitario?: number | string | null;
  valor_total?: number | string | null;
  aguarda_peca?: boolean | null;
  type?: string;
  servico_id?: number | string | null;
  peca_id?: number | string | null;
  name?: string;
  quantity?: number | string | null;
  unitPrice?: number | string | null;
  desconto?: number | string | null;
  valor_desconto?: number | string | null;
  valor_imposto?: number | string | null;
  total?: number | string | null;
  notas?: string | null;
  notes?: string | null;
};

type WorkOrderRequestBody = {
  ref_ordem_trabalho: string;
  cliente_id: number | string;
  veiculo_id?: number | string | null;
  mecanico_id?: number | string | null;
  orcamento_id?: number | string | null;
  data_inicio?: string | null;
  data_conclusao?: string | null;
  estado?: string | null;
  kms?: number | string | null;
  descricao_problema?: string | null;
  trabalho_realizado?: string | null;
  recomendacoes?: string | null;
  contacto_nome?: string | null;
  contacto_telefone?: string | null;
  contacto_email?: string | null;
  total_pecas?: number | string | null;
  total_mao_obra?: number | string | null;
  total_desconto?: number | string | null;
  total_imposto?: number | string | null;
  total_geral?: number | string | null;
  items?: WorkOrderItemLike[];
};

class StockValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockValidationError';
  }
}

/**
 * Format a work order item for API response
 */
const formatWorkOrderItem = (item: WorkOrderItemLike) => ({
  id: Number(item.id),
  tipo_item: item.tipo_item,
  descricao: item.descricao ?? '',
  quantidade: Number(item.quantidade) || 0,
  preco_unitario: Number(item.preco_unitario) || 0,
  valor_total: Number(item.valor_total) || 0
});

/**
 * Format waiting parts from order items
 */
const getWaitingParts = (items: WorkOrderItemLike[]) =>
  (items || [])
    .filter(item => item.tipo_item === 'peca' && item.aguarda_peca)
    .map(item => ({
      id: Number(item.id),
      descricao: item.descricao ?? '',
      quantidade: Number(item.quantidade) || 0,
      valor_total: Number(item.valor_total) || 0
    }));

/**
 * Parse work order data from request body
 */
const parseWorkOrderData = (body: WorkOrderRequestBody) => {
  const {
    ref_ordem_trabalho,
    cliente_id,
    veiculo_id,
    mecanico_id,
    orcamento_id,
    data_inicio,
    data_conclusao,
    estado,
    kms,
    descricao_problema,
    trabalho_realizado,
    recomendacoes,
    contacto_nome,
    contacto_telefone,
    contacto_email,
    total_pecas,
    total_mao_obra,
    total_desconto,
    total_imposto,
    total_geral,
    items
  } = body;

  return {
    ref_ordem_trabalho,
    cliente_id: typeof cliente_id === 'number' ? cliente_id : parseInt(cliente_id),
    mecanico_id: mecanico_id ? (typeof mecanico_id === 'number' ? mecanico_id : parseInt(String(mecanico_id))) : null,
    orcamento_id: orcamento_id ? BigInt(orcamento_id) : null,
    veiculo_id: BigInt(veiculo_id || 0),
    data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
    data_conclusao: data_conclusao ? new Date(data_conclusao) : null,
    estado: estado || 'em_andamento',
    kms: kms ? (typeof kms === 'number' ? kms : parseInt(String(kms))) : null,
    descricao_problema: descricao_problema ?? null,
    trabalho_realizado: trabalho_realizado ?? null,
    recomendacoes: recomendacoes ?? null,
    contacto_nome: contacto_nome || null,
    contacto_telefone: contacto_telefone || null,
    contacto_email: contacto_email || null,
    total_pecas: parseNum(total_pecas) || 0,
    total_mao_obra: parseNum(total_mao_obra) || 0,
    total_desconto: parseNum(total_desconto) || 0,
    total_imposto: parseNum(total_imposto) || 0,
    total_geral: parseNum(total_geral) || 0,
    items
  };
};

/**
 * Create work order items in database
 */

const createWorkOrderItems = async (orderId: number, items: WorkOrderItemLike[]) => {
  if (!items || items.length === 0) return;

  const workOrderItems = items.map((item) => ({
    ordemTrabalhoId: orderId,
    tipoItem: item.tipo_item || (item.type === 'service' ? 'servico' : 'peca'),
    servicoId: item.servico_id ? parseInt(String(item.servico_id), 10) : null,
    pecaId: item.peca_id ? parseInt(String(item.peca_id), 10) : null,
    descricao: item.descricao || item.name || '',
    quantidade: String(parseNum(item.quantidade || item.quantity) || 1),
    precoUnitario: String(parseNum(item.preco_unitario || item.unitPrice) || 0),
    valorDesconto: String(parseNum(item.valor_desconto || item.desconto) || 0),
    valorImposto: String(parseNum(item.valor_imposto) || 0),
    valorTotal: String(parseNum(item.valor_total || item.total) || 0),
    notas: item.notas || item.notes || null,
    aguardaPeca: item.aguarda_peca ? 1 : 0,
  }));

  await db.insert(itensOrdemTrabalho).values(workOrderItems);
};

/**
 * Deduct parts from stock when order is completed
 */
const deductPartsFromStock = async (orderId: number) => {
  const orderItems = await db.select({ pecaId: itensOrdemTrabalho.pecaId, quantidade: itensOrdemTrabalho.quantidade, descricao: itensOrdemTrabalho.descricao })
    .from(itensOrdemTrabalho)
    .where(
      and(
        eq(itensOrdemTrabalho.ordemTrabalhoId, orderId),
        eq(itensOrdemTrabalho.tipoItem, 'peca'),
        sql`${itensOrdemTrabalho.pecaId} IS NOT NULL`
      )
    );

  if (!orderItems.length) {
    return;
  }

  const requiredByPartId = new Map<number, { qty: number; description: string }>();

  for (const item of orderItems) {
    const partId = Number(item.pecaId);
    const qty = Number(item.quantidade);
    if (!partId || !Number.isFinite(qty) || qty <= 0) {
      continue;
    }

    const current = requiredByPartId.get(partId);
    if (current) {
      current.qty += qty;
    } else {
      requiredByPartId.set(partId, { qty, description: String(item.descricao || `Peça ${partId}`) });
    }
  }

  if (requiredByPartId.size === 0) {
    return;
  }

  const partIds = [...requiredByPartId.keys()];
  const currentStocks = await db
    .select({ id: pecas.id, nome: pecas.nome, quantidade_stock: pecas.quantidade_stock })
    .from(pecas)
    .where(inArray(pecas.id, partIds));

  const stockMap = new Map<number, { name: string; stock: number }>();
  for (const p of currentStocks) {
    stockMap.set(Number(p.id), {
      name: String(p.nome || `Peça ${p.id}`),
      stock: Number(p.quantidade_stock) || 0,
    });
  }

  const missingOrInsufficient: string[] = [];
  for (const [partId, required] of requiredByPartId.entries()) {
    const current = stockMap.get(partId);
    const available = current?.stock ?? 0;
    if (!current || available < required.qty) {
      const label = current?.name || required.description || `Peça ${partId}`;
      missingOrInsufficient.push(`${label} (necessário: ${required.qty}, disponível: ${available})`);
    }
  }

  if (missingOrInsufficient.length > 0) {
    throw new StockValidationError(`Stock insuficiente para concluir a ordem de trabalho: ${missingOrInsufficient.join('; ')}`);
  }

  for (const [partId, required] of requiredByPartId.entries()) {
    const current = stockMap.get(partId);
    if (!current) {
      continue;
    }
    const newStock = Math.max(0, current.stock - required.qty);
    await db.update(pecas)
      .set({ quantidade_stock: newStock })
      .where(eq(pecas.id, partId));
  }
};

/**
 * Restore parts stock when a concluded order is reopened
 */
const restorePartsToStock = async (orderId: number) => {
  const orderItems = await db.select({ pecaId: itensOrdemTrabalho.pecaId, quantidade: itensOrdemTrabalho.quantidade })
    .from(itensOrdemTrabalho)
    .where(
      and(
        eq(itensOrdemTrabalho.ordemTrabalhoId, orderId),
        eq(itensOrdemTrabalho.tipoItem, 'peca'),
        sql`${itensOrdemTrabalho.pecaId} IS NOT NULL`
      )
    );

  if (!orderItems.length) {
    return;
  }

  const restoreByPartId = new Map<number, number>();

  for (const item of orderItems) {
    const partId = Number(item.pecaId);
    const qty = Number(item.quantidade);
    if (!partId || !Number.isFinite(qty) || qty <= 0) {
      continue;
    }

    restoreByPartId.set(partId, (restoreByPartId.get(partId) || 0) + qty);
  }

  if (restoreByPartId.size === 0) {
    return;
  }

  const partIds = [...restoreByPartId.keys()];
  const currentStocks = await db
    .select({ id: pecas.id, quantidade_stock: pecas.quantidade_stock })
    .from(pecas)
    .where(inArray(pecas.id, partIds));

  const stockMap = new Map<number, number>();
  for (const p of currentStocks) {
    stockMap.set(Number(p.id), Number(p.quantidade_stock) || 0);
  }

  for (const [partId, qtyToRestore] of restoreByPartId.entries()) {
    const current = stockMap.get(partId) || 0;
    await db.update(pecas)
      .set({ quantidade_stock: current + qtyToRestore })
      .where(eq(pecas.id, partId));
  }
};

/**
 * POST /api/ordens-trabalho - Create new work order
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ref_ordem_trabalho,
      cliente_id,
      mecanico_id,
      orcamento_id,
      veiculo_id,
      data_inicio,
      data_conclusao,
      estado,
      kms,
      descricao_problema,
      trabalho_realizado,
      recomendacoes,
      contacto_nome,
      contacto_telefone,
      contacto_email,
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      items
    } = parseWorkOrderData(body);

    // Create work order (Drizzle)
    const [insertResult] = await db.insert(ordensTrabalho).values({
      refOrdemTrabalho: ref_ordem_trabalho,
      clienteId: cliente_id,
      veiculoId: Number(veiculo_id) || 0,
      mecanicoId: mecanico_id ? Number(mecanico_id) : null,
      descricaoProblema: descricao_problema,
      trabalhoRealizado: trabalho_realizado,
      totalGeral: String(total_geral || 0),
      totalPecas: String(total_pecas || 0),
      totalMaoObra: String(total_mao_obra || 0),
      totalDesconto: String(total_desconto || 0),
      totalImposto: String(total_imposto || 0),
      estado: estado || 'em_andamento',
      dataInicio: data_inicio ? String(data_inicio) : new Date().toISOString().slice(0, 10),
      dataConclusao: data_conclusao ? String(data_conclusao) : null,
      kms: kms ? Number(kms) : null,
      contactoNome: contacto_nome ?? null,
      contactoTelefone: contacto_telefone ?? null,
      contactoEmail: contacto_email ?? null,
    });

    // Recuperar o id inserido
    const ordemTrabalhoId = insertResult.insertId || insertResult;

    // Create work order items
    await createWorkOrderItems(Number(ordemTrabalhoId), items || []);

    await registarAuditoria('CREATE', 'ordens_trabalho', Number(ordemTrabalhoId), null, { ref: ref_ordem_trabalho, cliente_id, veiculo_id: Number(veiculo_id), estado }, request);

    return successResponse(
      {
        success: true,
        ordem_trabalho: {
          id: Number(ordemTrabalhoId),
          ref_ordem_trabalho: ref_ordem_trabalho
        }
      },
      201
    );
  } catch (error) {
    console.error('Error creating work order:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to create work order', 500);
  }
}

/**
 * GET /api/ordens-trabalho - List work orders or get single by ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const vehicleIdParam = searchParams.get('vehicleId');
    const statusParam = searchParams.get('status');


    // Single work order lookup with items
    if (id) {
      // Buscar ordem de trabalho — aceita id numérico ou referência (ex: OT-0007)
      const rawId = String(id).trim();
      const numericId = Number(rawId);
      const isNumericId = Number.isFinite(numericId) && numericId > 0 && !rawId.includes('-');
      const order = isNumericId
        ? await db.query.ordensTrabalho.findFirst({ where: (o, { eq }) => eq(o.id, numericId) })
        : await db.query.ordensTrabalho.findFirst({ where: (o, { eq }) => eq(o.refOrdemTrabalho, rawId) });
      if (!order) {
        return errorResponse('Work order not found', 404);
      }

      // Buscar itens relacionados
      const items = await db.query.itensOrdemTrabalho.findMany({ where: (i, { eq }) => eq(i.ordemTrabalhoId, Number(order.id)) });

      // Mapear itens para formato esperado pelo frontend
      const itens_ordem_trabalho = items.map(item => ({
        id: item.id,
        tipo_item: item.tipoItem,
        descricao: item.descricao,
        quantidade: Number(item.quantidade) || 0,
        preco_unitario: Number(item.precoUnitario) || 0,
        valor_total: Number(item.valorTotal) || 0,
        aguarda_peca: !!item.aguardaPeca
      }));

      return successResponse({
        ...order,
        itens_ordem_trabalho
      });
    }

    // List all work orders
    const orders = await db.select().from(ordensTrabalho).orderBy(desc(ordensTrabalho.criadoEm));
    const requestedVehicleId = vehicleIdParam ? Number(vehicleIdParam) : null;
    const requestedStatuses = statusParam
      ? new Set(
          statusParam
            .split(',')
            .map(status => status.trim())
            .filter(Boolean)
            .flatMap((status) => {
              const lowered = status.toLowerCase();
              if (lowered === 'faturado') {
                return ['concluido', 'entregue'];
              }

              return [mapFrontendStatusToDb(status)];
            })
        )
      : null;

    const filteredOrders = orders.filter((order) => {
      const matchesVehicle = requestedVehicleId == null || Number(order.veiculoId) === requestedVehicleId;
      const matchesStatus = !requestedStatuses || requestedStatuses.has(String(order.estado || '').toLowerCase());
      return matchesVehicle && matchesStatus;
    });

    // Batch load related entities
    const clienteIds = extractUniqueIds(filteredOrders, 'clienteId');
    const veiculoIds = extractUniqueIds(filteredOrders, 'veiculoId').filter(
      id => typeof id === 'bigint' || typeof id === 'number'
    );
    const mecanicoIds = extractUniqueIds(filteredOrders, 'mecanicoId');

    const [clientesArr, veiculosArr, mecanicosArr] = await Promise.all([
      clienteIds.length
        ? db.select().from(clientes).where(inArray(clientes.id, clienteIds as number[]))
        : Promise.resolve([]),
      veiculoIds.length
        ? db.select().from(veiculos).where(inArray(veiculos.id, veiculoIds as number[]))
        : Promise.resolve([]),
      mecanicoIds.length
        ? db.select().from(mecanicos).where(inArray(mecanicos.id, mecanicoIds as number[]))
        : Promise.resolve([])
    ]);

    const clientMap = buildDataMap(clientesArr, 'id');
    const veiculoMap = buildDataMap(
      veiculosArr.map(v => ({ ...v, id: Number(v.id) })),
      'id'
    );
    const mecanicoMap = buildDataMap(mecanicosArr, 'id');

    // Load waiting parts items for orders in aguarda_peca state
    const aguardaPecaIds = filteredOrders
      .filter(o => o.estado === 'aguarda_peca')
      .map(o => Number(o.id));

    const waitingItemsMap = new Map<number, Array<{ id: number; descricao: string; quantidade: number; valor_total: number }>>();
    if (aguardaPecaIds.length > 0) {
      const waitingItems = await db
        .select()
        .from(itensOrdemTrabalho)
        .where(
          and(
            inArray(itensOrdemTrabalho.ordemTrabalhoId, aguardaPecaIds),
            eq(itensOrdemTrabalho.tipoItem, 'peca'),
            eq(itensOrdemTrabalho.aguardaPeca, 1)
          )
        );
      waitingItems.forEach(item => {
        const ordId = Number(item.ordemTrabalhoId);
        if (!waitingItemsMap.has(ordId)) waitingItemsMap.set(ordId, []);
        waitingItemsMap.get(ordId)!.push({
          id: Number(item.id),
          descricao: item.descricao ?? '',
          quantidade: Number(item.quantidade) || 0,
          valor_total: Number(item.valorTotal) || 0
        });
      });
    }

    const filteredOrderIds = filteredOrders.map(order => Number(order.id));
    const orderItemsMap = new Map<number, Array<{
      id: number;
      tipo_item: string;
      descricao: string;
      quantidade: number;
      preco_unitario: number;
      valor_total: number;
      aguarda_peca: boolean;
    }>>();

    if (filteredOrderIds.length > 0) {
      const orderItems = await db
        .select()
        .from(itensOrdemTrabalho)
        .where(inArray(itensOrdemTrabalho.ordemTrabalhoId, filteredOrderIds));

      orderItems.forEach((item) => {
        const orderId = Number(item.ordemTrabalhoId);
        if (!orderItemsMap.has(orderId)) {
          orderItemsMap.set(orderId, []);
        }

        orderItemsMap.get(orderId)!.push({
          id: Number(item.id),
          tipo_item: item.tipoItem ?? '',
          descricao: item.descricao ?? '',
          quantidade: Number(item.quantidade) || 0,
          preco_unitario: Number(item.precoUnitario) || 0,
          valor_total: Number(item.valorTotal) || 0,
          aguarda_peca: !!item.aguardaPeca,
        });
      });
    }

    // Transform orders for response
    const transformedOrders = filteredOrders.map((order) => {
      const cliente = order.clienteId != null ? clientMap.get(order.clienteId) : undefined;
      const veiculo = order.veiculoId != null ? veiculoMap.get(Number(order.veiculoId)) : undefined;
      const mecanico = order.mecanicoId != null ? mecanicoMap.get(order.mecanicoId) : undefined;
      const vehicleLabel = veiculo ? `${veiculo.marca ?? ''} ${veiculo.modelo ?? ''}`.trim() : '';
      const dateValue = order.dataConclusao ?? order.dataInicio ?? undefined;
      const descriptionValue = order.descricaoProblema ?? order.trabalhoRealizado ?? '';
      return {
        id: String(order.id),
        ref_ordem_trabalho: order.refOrdemTrabalho,
        cliente_nome: cliente?.nome ?? '',
        veiculo_modelo: veiculo ? `${veiculo.marca ?? ''} ${veiculo.modelo ?? ''}`.trim() : '',
        veiculo_matricula: veiculo?.matricula ?? '',
        mecanico_nome: mecanico?.nome ?? '',
        estado: order.estado ?? 'em_andamento',
        contacto_nome: order.contactoNome ?? null,
        contacto_telefone: order.contactoTelefone ?? null,
        contacto_email: order.contactoEmail ?? null,
        data_inicio: order.dataInicio ?? undefined,
        data_conclusao: order.dataConclusao ?? undefined,
        prioridade: order.prioridade ?? 'normal',
        descricao_problema: order.descricaoProblema ?? '',
        trabalho_realizado: order.trabalhoRealizado ?? '',
        total_geral: Number(order.totalGeral) || 0,
        plate: veiculo?.matricula ?? '',
        vehicle: vehicleLabel,
        date: dateValue,
        description: descriptionValue,
        status: mapDbStatusToFrontend(order.estado),
        mechanic: mecanico?.nome ?? '',
        items: orderItemsMap.get(Number(order.id)) ?? [],
        waitingParts: waitingItemsMap.get(Number(order.id)) ?? [],
      };
    });
    return successResponse(transformedOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to fetch work orders', 500);
  }
}

/**
 * DELETE /api/ordens-trabalho - Delete work order
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Work order ID is required', 400);
    }

    // Buscar ordem pelo id
    const order = await db.query.ordensTrabalho.findFirst({ where: (o, { eq }) => eq(o.id, Number(id)) });
    if (!order) {
      return errorResponse('Work order not found', 404);
    }

    // Deletar itens relacionados
    await db.delete(itensOrdemTrabalho).where(eq(itensOrdemTrabalho.ordemTrabalhoId, Number(id)));
    // Deletar ordem
    await db.delete(ordensTrabalho).where(eq(ordensTrabalho.id, Number(id)));

    await registarAuditoria('DELETE', 'ordens_trabalho', Number(order.id), { cliente_id: order.clienteId }, null, request);

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting work order:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to delete work order', 500);
  }
}

/**
 * PATCH /api/ordens-trabalho - Update work order status and details
 */

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado, data_conclusao, selectedPartIds, confirmReopen } = body;

    if (!id) {
      return errorResponse('Work order ID is required', 400);
    }

    const rawId = String(id).trim();
    const numericId = Number(rawId);
    const isNumericId = Number.isFinite(numericId);

    // Buscar ordem por id numérico ou por referência (ex: OT-0007)
    const order = isNumericId
      ? await db.query.ordensTrabalho.findFirst({ where: (o, { eq }) => eq(o.id, numericId) })
      : await db.query.ordensTrabalho.findFirst({ where: (o, { eq }) => eq(o.refOrdemTrabalho, rawId) });

    if (!order) {
      return errorResponse('Work order not found', 404);
    }

    const orderId = Number(order.id);

    // Map frontend status to database status
    const dbStatus = estado ? mapFrontendStatusToDb(estado) : undefined;

    // Build update data
    const updateData: any = {};
    if (dbStatus) {
      updateData.estado = dbStatus;
      // Auto-stamp conclusion date when moving to 'concluido'
      if (dbStatus === 'concluido' && !data_conclusao) {
        updateData.dataConclusao = new Date().toISOString().slice(0, 10);
      } else if ((dbStatus === 'em_andamento' || dbStatus === 'aguarda_peca') && !data_conclusao) {
        updateData.dataConclusao = null;
      }
    }
    if (data_conclusao && data_conclusao.trim()) {
      updateData.dataConclusao = new Date(data_conclusao).toISOString().slice(0, 10);
    }

    const previousStatus = String(order.estado || '').toLowerCase();
    const isReopeningFromConcluded =
      previousStatus === 'concluido' && (dbStatus === 'em_andamento' || dbStatus === 'aguarda_peca');

    if (isReopeningFromConcluded && !confirmReopen) {
      return errorResponse('Confirme a reabertura da ordem de trabalho para repor peças em stock.', 409);
    }

    // Update work order
    await db.update(ordensTrabalho).set(updateData).where(eq(ordensTrabalho.id, orderId));

    // Clear parts waiting flag for certain statuses
    if (dbStatus === 'concluido' || dbStatus === 'em_andamento') {
      await db.update(itensOrdemTrabalho).set({ aguardaPeca: 0 }).where(and(eq(itensOrdemTrabalho.ordemTrabalhoId, orderId), eq(itensOrdemTrabalho.tipoItem, 'peca')));
    }

    if (isReopeningFromConcluded) {
      await restorePartsToStock(orderId);
    }

    // Deduct stock only once when transitioning into concluded status
    if (dbStatus === 'concluido' && previousStatus !== 'concluido') {
      await deductPartsFromStock(orderId);
    }

    // Handle "Aguarda Peças" (waiting for parts) status
    if (dbStatus === 'aguarda_peca') {
      // Reset all parts to not waiting
      await db.update(itensOrdemTrabalho).set({ aguardaPeca: 0 }).where(and(eq(itensOrdemTrabalho.ordemTrabalhoId, orderId), eq(itensOrdemTrabalho.tipoItem, 'peca')));

      // Mark selected parts as waiting
      if (selectedPartIds && Array.isArray(selectedPartIds) && selectedPartIds.length > 0) {
        const numericIds = selectedPartIds
          .map((id: unknown) => {
            const num = typeof id === 'string' ? parseInt(id, 10) : Number(id);
            return isNaN(num) ? null : num;
          })
          .filter((id: number | null): id is number => id !== null);
        if (numericIds.length > 0) {
          for (const partId of numericIds) {
            await db.update(itensOrdemTrabalho).set({ aguardaPeca: 1 }).where(and(eq(itensOrdemTrabalho.id, partId), eq(itensOrdemTrabalho.ordemTrabalhoId, orderId), eq(itensOrdemTrabalho.tipoItem, 'peca')));
          }
        }
      } else {
        // Mark all parts as waiting if none specified
        await db.update(itensOrdemTrabalho).set({ aguardaPeca: 1 }).where(and(eq(itensOrdemTrabalho.ordemTrabalhoId, orderId), eq(itensOrdemTrabalho.tipoItem, 'peca')));
      }
    }

    await registarAuditoria('UPDATE', 'ordens_trabalho', Number(order.id), {}, { estado: dbStatus, data_conclusao: updateData.dataConclusao }, request);

    return successResponse({
      success: true,
      ordem_trabalho: {
        id: order.id,
        estado: dbStatus
      }
    });
  } catch (error) {
    console.error('Error updating work order:', error);
    if (error instanceof StockValidationError) {
      return errorResponse(error.message, 400);
    }
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to update work order', 500);
  }
}
