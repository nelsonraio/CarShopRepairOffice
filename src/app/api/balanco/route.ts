import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  handleDatabaseError,
  parsePaginationParams,
  parseNum,
  calculateDaysDelay
} from '@/lib/api-utils';

const prisma = new PrismaClient();
// @ts-ignore
const prismaAny = prisma as any;

/**
 * Build balance data for a completed work order
 * Uses base part prices (preco_venda) without any profit margin
 */
const buildBalanceData = (order: any, pecasMap: Map<number, number>) => {
  // Calculate real cost of parts using preco_venda (base price, no margin)
  let gastoPecasReal = 0;
  if (order.itens_ordem_trabalho?.length > 0) {
    gastoPecasReal = order.itens_ordem_trabalho.reduce((sum: number, item: any) => {
      const quantity = parseNum(item.quantidade) || 1;
      if (item.peca_id && pecasMap.has(item.peca_id)) {
        // Use base price from pecas table (no margin)
        return sum + (pecasMap.get(item.peca_id)! * quantity);
      }
      // No linked part — use stored price as fallback
      return sum + (parseNum(item.preco_unitario) * quantity);
    }, 0);
  }

  const totalIncome = parseNum(order.total_geral);
  const laborCost = parseNum(order.total_mao_obra);
  const profit = totalIncome - gastoPecasReal;

  return {
    id: order.ref_ordem_trabalho,
    matricula: order.veiculo?.matricula || 'N/A',
    cliente: order.veiculo?.cliente?.nome || 'N/A',
    dataConclusao: order.data_conclusao
      ? new Date(order.data_conclusao).toISOString().split('T')[0]
      : null,
    valorEntrada: totalIncome,
    gastoPecas: gastoPecasReal,
    maoObra: laborCost,
    lucro: profit
  };
};

/**
 * GET /api/balanco - Get balance/profit report by completed work orders
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { skip, take } = parsePaginationParams(new URL(request.url));

    // Fetch completed work orders with pagination
    const [ordensTrabalho, total] = await Promise.all([
      (prismaAny.ordens_trabalho as any).findMany({
        where: { estado: 'concluido' },
        include: {
          veiculo: { include: { cliente: true } },
          itens_ordem_trabalho: true
        },
        orderBy: { data_conclusao: 'desc' },
        skip,
        take
      }),
      prismaAny.ordens_trabalho.count({ where: { estado: 'concluido' } })
    ]);

    // Extract unique peca_ids for batch lookup of base prices
    const pecaIds = new Set<number>();
    ordensTrabalho.forEach((ordem: any) => {
      ordem.itens_ordem_trabalho?.forEach((item: any) => {
        if (item.peca_id) pecaIds.add(item.peca_id);
      });
    });

    // Fetch base prices (preco_venda) for all referenced parts
    const pecasMap = new Map<number, number>();
    if (pecaIds.size > 0) {
      const pecas = await prismaAny.pecas.findMany({
        where: { id: { in: Array.from(pecaIds) } },
        select: { id: true, preco_venda: true }
      });
      pecas.forEach((peca: any) => {
        pecasMap.set(Number(peca.id), parseNum(peca.preco_venda));
      });
    }

    // Transform work orders into balance data
    const balanceData = ordensTrabalho.map((ordem: any) => {
      return buildBalanceData(ordem, pecasMap);
    });

    // Calculate pagination info
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    return successResponse({
      balances: balanceData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching balance data:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch balance data' },
      { status: 500 }
    );
  }
}
