import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
  parseNum,
  mapDbStatusToFrontend,
  mapFrontendStatusToDb,
  mapPriority,
  formatDatePt,
  parseNum as safeParse,
  buildDataMap,
  extractUniqueIds
} from '@/lib/api-utils';

const prisma = new PrismaClient({
  log: ['error'],
});
const prismaAny = prisma as any;

/**
 * Format a work order item for API response
 */
const formatWorkOrderItem = (item: any) => ({
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
const getWaitingParts = (items: any[]) =>
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
const parseWorkOrderData = (body: any) => {
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
    cliente_id: parseInt(cliente_id),
    mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
    orcamento_id: orcamento_id ? BigInt(orcamento_id) : null,
    veiculo_id: veiculo_id ? BigInt(veiculo_id) : null,
    data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
    data_conclusao: data_conclusao ? new Date(data_conclusao) : null,
    estado: estado || 'em_andamento',
    kms: kms ? parseInt(kms) : null,
    descricao_problema,
    trabalho_realizado,
    recomendacoes,
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
const createWorkOrderItems = async (orderId: bigint, items: any[]) => {
  if (!items || items.length === 0) return;

  const workOrderItems = items.map((item: any) => ({
    ordem_trabalho_id: orderId,
    tipo_item: item.tipo_item || (item.type === 'service' ? 'servico' : 'peca'),
    servico_id: item.servico_id || (item.servico_id ? parseInt(item.servico_id) : null),
    peca_id: item.peca_id || (item.peca_id ? parseInt(item.peca_id) : null),
    descricao: item.descricao || item.name,
    quantidade: parseNum(item.quantidade || item.quantity) || 1,
    preco_unitario: parseNum(item.preco_unitario || item.unitPrice) || 0,
    valor_desconto: parseNum(item.valor_desconto || item.desconto) || 0,
    valor_imposto: parseNum(item.valor_imposto) || 0,
    valor_total: parseNum(item.valor_total || item.total) || 0,
    notas: item.notas || item.notes || null
  }));

  await prisma.itens_ordem_trabalho.createMany({ data: workOrderItems });
};

/**
 * Deduct parts from stock when order is completed
 */
const deductPartsFromStock = async (orderId: number) => {
  const orderItems = await prisma.itens_ordem_trabalho.findMany({
    where: {
      ordem_trabalho_id: orderId,
      tipo_item: 'peca',
      peca_id: { not: null }
    },
    select: { peca_id: true, quantidade: true }
  });

  // Update stock for each part
  for (const item of orderItems) {
    if (item.peca_id && item.quantidade) {
      try {
        const current = await prisma.pecas.findUnique({
          where: { id: BigInt(item.peca_id) },
          select: { quantidade_stock: true }
        });
        
        const decrement = Math.floor(Number(item.quantidade));
        let newStock = (current?.quantidade_stock ?? 0) - decrement;
        if (newStock < 0) newStock = 0;

        await prisma.pecas.update({
          where: { id: BigInt(item.peca_id) },
          data: { quantidade_stock: newStock }
        });
      } catch (error) {
        console.error(`Failed to update stock for part ${item.peca_id}:`, error);
        // Continue processing other parts even if one fails
      }
    }
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

    // Create work order
    const ordemTrabalho = await prismaAny.ordens_trabalho.create({
      data: {
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
        total_geral
      }
    });

    // Create work order items
    await createWorkOrderItems(ordemTrabalho.id, items);

    return successResponse(
      {
        success: true,
        ordem_trabalho: {
          id: Number(ordemTrabalho.id),
          ref_ordem_trabalho: ordemTrabalho.ref_ordem_trabalho
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

    // Single work order lookup
    if (id) {
      const order = await prismaAny.ordens_trabalho.findUnique({
        where: { ref_ordem_trabalho: id },
        include: {
          mecanico: true,
          itens_ordem_trabalho: {
            select: {
              id: true,
              tipo_item: true,
              descricao: true,
              quantidade: true,
              preco_unitario: true,
              valor_total: true,
              aguarda_peca: true
            }
          },
          orcamento: { include: { itens_orcamento: true } }
        }
      });

      if (!order) {
        return errorResponse('Work order not found', 404);
      }

      const [cliente, veiculo] = await Promise.all([
        prisma.clientes.findUnique({ where: { id: order.cliente_id } }),
        order.veiculo_id
          ? prisma.veiculos.findUnique({ where: { id: order.veiculo_id } })
          : Promise.resolve(null)
      ]);

      const waitingParts = getWaitingParts(order.itens_ordem_trabalho);

      const responseData = {
        id: String(order.id),
        client: cliente?.nome ?? '',
        vehicle: veiculo ? `${veiculo.marca} ${veiculo.modelo} | ${veiculo.matricula}` : '',
        mechanic: order.mecanico?.nome ?? '',
        openDate: formatDatePt(order.data_inicio),
        closeDate: formatDatePt(order.data_conclusao),
        status: mapDbStatusToFrontend(order.estado),
        priority: mapPriority(order.prioridade ?? null),
        problem: order.descricao_problema ?? '',
        waitingParts,
        itens_ordem_trabalho: (order.itens_ordem_trabalho || []).map(formatWorkOrderItem),
        orcamento: order.orcamento ? {
          id: String(order.orcamento.id),
          ref_orcamento: order.orcamento.ref_orcamento,
          itens_orcamento: (order.orcamento.itens_orcamento || []).map((item: any) => ({
            id: String(item.id),
            orcamento_id: String(item.orcamento_id),
            descricao: item.descricao ?? '',
            quantidade: Number(item.quantidade) || 0,
            valor_total: Number(item.valor_total) || 0,
            servico_id: item.servico_id ? String(item.servico_id) : null,
            peca_id: item.peca_id ? String(item.peca_id) : null
          }))
        } : undefined
      };

      // Handle remaining BigInt values
      const jsonString = JSON.stringify(responseData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );

      return new Response(jsonString, {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // List all work orders
    const orders = await prismaAny.ordens_trabalho.findMany({
      orderBy: { criado_em: 'desc' },
      include: {
        mecanico: true,
        itens_ordem_trabalho: {
          select: {
            id: true,
            tipo_item: true,
            descricao: true,
            quantidade: true,
            preco_unitario: true,
            valor_total: true,
            aguarda_peca: true
          }
        }
      }
    });

    // Batch load related entities
    const clienteIds = extractUniqueIds(orders, 'cliente_id');
    const veiculoIds = extractUniqueIds(orders, 'veiculo_id').filter(
      id => typeof id === 'bigint' || typeof id === 'number'
    );
    const mecanicoIds = extractUniqueIds(orders, 'mecanico_id');

    const [clientes, veiculos, mecanicos] = await Promise.all([
      clienteIds.length
        ? prisma.clientes.findMany({ where: { id: { in: clienteIds as number[] } } })
        : Promise.resolve([]),
      veiculoIds.length
        ? prisma.veiculos.findMany({ where: { id: { in: veiculoIds.map(id => BigInt(id)) } } })
        : Promise.resolve([]),
      mecanicoIds.length
        ? prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds as number[] } } })
        : Promise.resolve([])
    ]);

    const clientMap = buildDataMap(clientes, 'id');
    const veiculoMap = buildDataMap(
      veiculos.map(v => ({ ...v, id: Number(v.id) })),
      'id'
    );
    const mecanicoMap = buildDataMap(mecanicos, 'id');

    // Transform orders for response
    const transformedOrders = orders.map((order: any) => {
      const cliente = clientMap.get(order.cliente_id);
      const veiculo = veiculoMap.get(Number(order.veiculo_id));
      const mecanico = mecanicoMap.get(order.mecanico_id) || order.mecanico;

      return {
        id: order.ref_ordem_trabalho,
        client: cliente?.nome ?? '',
        contacto_nome: order.contacto_nome ?? null,
        contacto_telefone: order.contacto_telefone ?? cliente?.telefone ?? null,
        contacto_email: order.contacto_email ?? cliente?.email ?? null,
        vehicle: `${veiculo?.marca ?? ''} ${veiculo?.modelo ?? ''} | ${veiculo?.matricula ?? ''}`,
        mechanic: mecanico?.nome ?? '',
        mecanico_nome: mecanico?.nome ?? '',
        openDate: formatDatePt(order.data_inicio),
        closeDate: formatDatePt(order.data_conclusao),
        total: Number(order.total_geral) || 0,
        status: mapDbStatusToFrontend(order.estado),
        priority: mapPriority(order.prioridade ?? null),
        problem: order.descricao_problema ?? '',
        waitingParts: getWaitingParts(order.itens_ordem_trabalho),
        items: (order.itens_ordem_trabalho || []).map(formatWorkOrderItem)
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

    const order = await prisma.ordens_trabalho.findUnique({
      where: { ref_ordem_trabalho: id }
    });

    if (!order) {
      return errorResponse('Work order not found', 404);
    }

    // Delete work order items first (foreign key constraint)
    await prisma.itens_ordem_trabalho.deleteMany({
      where: { ordem_trabalho_id: Number(order.id) }
    });

    // Delete work order
    await prisma.ordens_trabalho.delete({
      where: { ref_ordem_trabalho: id }
    });

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
    const { id, estado, data_conclusao, selectedPartIds } = body;

    if (!id) {
      return errorResponse('Work order ID is required', 400);
    }

    const order = await prisma.ordens_trabalho.findUnique({
      where: { ref_ordem_trabalho: id }
    });

    if (!order) {
      return errorResponse('Work order not found', 404);
    }

    // Map frontend status to database status
    const dbStatus = estado ? mapFrontendStatusToDb(estado) : undefined;

    // Build update data
    const updateData: any = {};

    if (dbStatus) {
      updateData.estado = dbStatus;

      // Auto-stamp conclusion date when moving to 'concluido'
      if (dbStatus === 'concluido' && !data_conclusao) {
        updateData.data_conclusao = new Date();
      }
      // Clear conclusion date when reverting from 'concluido'
      else if ((dbStatus === 'em_andamento' || dbStatus === 'aguarda_peca') && !data_conclusao) {
        updateData.data_conclusao = null;
      }
    }

    if (data_conclusao && data_conclusao.trim()) {
      updateData.data_conclusao = new Date(data_conclusao);
    }

    // Update work order
    const updated = await prisma.ordens_trabalho.update({
      where: { ref_ordem_trabalho: id },
      data: updateData
    });

    // Clear parts waiting flag for certain statuses
    if (dbStatus === 'concluido' || dbStatus === 'em_andamento') {
      await prisma.itens_ordem_trabalho.updateMany({
        where: {
          ordem_trabalho_id: Number(order.id),
          tipo_item: 'peca'
        },
        data: { aguarda_peca: false }
      });
    }

    // Deduct parts from stock when changing to 'concluido'
    if (dbStatus === 'concluido' && order.estado !== 'concluido') {
      await deductPartsFromStock(Number(order.id));
    }

    // Handle "Aguarda Peças" (waiting for parts) status
    if (estado === 'Aguarda Peças') {
      // Reset all parts to not waiting
      await prisma.itens_ordem_trabalho.updateMany({
        where: {
          ordem_trabalho_id: Number(order.id),
          tipo_item: 'peca'
        },
        data: { aguarda_peca: false }
      });

      // Mark selected parts as waiting
      if (selectedPartIds && Array.isArray(selectedPartIds) && selectedPartIds.length > 0) {
        const numericIds = selectedPartIds
          .map((id: any) => {
            const num = typeof id === 'string' ? parseInt(id, 10) : Number(id);
            return isNaN(num) ? null : num;
          })
          .filter((id: any): id is number => id !== null);

        if (numericIds.length > 0) {
          await prisma.itens_ordem_trabalho.updateMany({
            where: {
              id: { in: numericIds },
              ordem_trabalho_id: Number(order.id),
              tipo_item: 'peca'
            },
            data: { aguarda_peca: true }
          });
        }
      } else {
        // Mark all parts as waiting if none specified
        await prisma.itens_ordem_trabalho.updateMany({
          where: {
            ordem_trabalho_id: Number(order.id),
            tipo_item: 'peca'
          },
          data: { aguarda_peca: true }
        });
      }
    }

    return successResponse({
      success: true,
      ordem_trabalho: {
        id: updated.ref_ordem_trabalho,
        estado: updated.estado
      }
    });
  } catch (error) {
    console.error('Error updating work order:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to update work order', 500);
  }
}
