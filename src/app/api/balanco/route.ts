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
 * Calculate actual part cost by removing profit margin
 * Formula: real_price = price_with_margin / (1 + margin_percent/100)
 */
const calculateRealPartCost = (priceWithMargin: number, marginPercent: number): number => {
  if (marginPercent <= 0) return priceWithMargin;
  return priceWithMargin / (1 + marginPercent / 100);
};

/**
 * Build balance data for a completed work order
 */
const buildBalanceData = (order: any, profileMargin: number) => {
  // Calculate real cost of parts without profit margin
  let gastoPecasReal = 0;
  if (order.itens_ordem_trabalho?.length > 0) {
    gastoPecasReal = order.itens_ordem_trabalho.reduce((sum: number, item: any) => {
      const priceWithMargin = parseNum(item.preco_unitario);
      const quantity = parseNum(item.quantidade) || 1;
      const realPrice = calculateRealPartCost(priceWithMargin, profileMargin);
      return sum + (realPrice * quantity);
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

    // Extract unique profile names for batch lookup
    const profileNames = new Set<string>();
    ordensTrabalho.forEach((ordem: any) => {
      if (ordem.veiculo?.cliente?.perfil) {
        profileNames.add(ordem.veiculo.cliente.perfil);
      }
    });

    // Fetch all client profiles and build margin map
    const profilesMap = new Map<string, number>();
    if (profileNames.size > 0) {
      const profiles = await prismaAny.perfis_clientes.findMany({
        where: { nome: { in: Array.from(profileNames) } }
      });
      profiles.forEach((profile: any) => {
        profilesMap.set(profile.nome, parseNum(profile.perclucro));
      });
    }

    // Transform work orders into balance data
    const balanceData = ordensTrabalho.map((ordem: any) => {
      const clientProfile = ordem.veiculo?.cliente?.perfil || 'Normal';
      const marginPercent = profilesMap.get(clientProfile) || 0;
      return buildBalanceData(ordem, marginPercent);
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
