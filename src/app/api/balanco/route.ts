import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { ordensTrabalho, veiculos, clientes, itensOrdemTrabalho, pecas } from '@/db/schema';
import { eq, inArray, desc, or } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  successResponse,
  handleDatabaseError,
  parsePaginationParams,
  parseNum,
  calculateDaysDelay
} from '@/lib/api-utils';



/**
 * Build balance data for a completed work order
 * Uses base part prices (preco_venda) without any profit margin
 */
const buildBalanceData = (order: any, pecasMap: Map<number, number>) => {
  // Calculate real cost of parts using preco_venda (base price, no margin)
  let gastoPecasReal = 0;
  if (order.itens_ordem_trabalho?.length > 0) {
    // Filtra apenas itens que são peças (com peca_id)
    const pecasItens = order.itens_ordem_trabalho.filter((item: any) => item.peca_id);
    if (pecasItens.length > 0) {
      gastoPecasReal = pecasItens.reduce((sum: number, item: any) => {
        const quantity = parseNum(item.quantidade) || 1;
        if (item.peca_id && pecasMap.has(item.peca_id)) {
          // Use base price from pecas table (no margin)
          return sum + (pecasMap.get(item.peca_id)! * quantity);
        }
        // No linked part — use stored price as fallback
        return sum + (parseNum(item.preco_unitario) * quantity);
      }, 0);
    }
    // Se não houver peças, gastoPecasReal permanece zero
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
    lucro: profit,
    estado: order.estado || undefined
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
    const completedStates = ['concluido', 'entregue', 'Entregue'];
    const [ordens, total] = await Promise.all([
      db.select()
        .from(ordensTrabalho)
        .where(inArray(ordensTrabalho.estado, completedStates))
        .orderBy(desc(ordensTrabalho.dataConclusao))
        .offset(skip)
        .limit(take),
      db.select({ count: sql<number>`count(*)` })
        .from(ordensTrabalho)
        .where(inArray(ordensTrabalho.estado, completedStates))
        .then(rows => rows[0]?.count || 0)
    ]);

    // Fetch related veiculos and clientes
    const veiculoIds = ordens.map(o => o.veiculoId).filter((id): id is number => id != null);
    const veiculosList = veiculoIds.length > 0
      ? await db.select().from(veiculos).where(inArray(veiculos.id, veiculoIds))
      : [];
    const clienteIds = veiculosList.map(v => v.clienteId).filter((id): id is number => id != null);
    const clientesList = clienteIds.length > 0
      ? await db.select().from(clientes).where(inArray(clientes.id, clienteIds))
      : [];
    const veiculosMap = new Map(veiculosList.map(v => [v.id, v]));
    const clientesMap = new Map(clientesList.map(c => [c.id, c]));

    // Fetch itens_ordem_trabalho for all ordens
    const ordemIds = ordens.map(o => o.id);
    const itens = ordemIds.length > 0
      ? await db.select().from(itensOrdemTrabalho).where(inArray(itensOrdemTrabalho.ordemTrabalhoId, ordemIds))
      : [];
    const itensByOrdem = new Map();
    for (const item of itens) {
      if (!itensByOrdem.has(item.ordemTrabalhoId)) itensByOrdem.set(item.ordemTrabalhoId, []);
      itensByOrdem.get(item.ordemTrabalhoId).push(item);
    }

    // Extract unique peca_ids for batch lookup of base prices
    const pecaIds = Array.from(new Set(itens.map(i => i.pecaId).filter((id): id is number => id != null)));
    const pecasList = pecaIds.length > 0
      ? await db.select().from(pecas).where(inArray(pecas.id, pecaIds))
      : [];
    const pecasMap = new Map(pecasList.map(p => [p.id, parseNum(p.preco_venda)]));

    // Transform work orders into balance data
    const balanceData = ordens.map(ordem => {
      const veiculo = ordem.veiculoId != null ? veiculosMap.get(ordem.veiculoId) : undefined;
      const cliente = veiculo?.clienteId != null ? clientesMap.get(veiculo.clienteId) : undefined;
      const ordemItens = itensByOrdem.get(ordem.id) || [];
      // Calculate real cost of parts using preco_venda (base price, no margin)
      let gastoPecasReal = 0;
      if (ordemItens.length > 0) {
        const pecasItens = ordemItens.filter((item: any) => item.pecaId);
        if (pecasItens.length > 0) {
          gastoPecasReal = pecasItens.reduce((sum: number, item: any) => {
            const quantity = parseNum(item.quantidade) || 1;
            if (item.pecaId && pecasMap.has(item.pecaId)) {
              const precoBase = pecasMap.get(item.pecaId) ?? 0;
              return sum + (precoBase * quantity);
            }
            return sum + (parseNum(item.precoUnitario) * quantity);
          }, 0);
        }
      }
      const totalIncome = parseNum(ordem.totalGeral);
      const laborCost = parseNum(ordem.totalMaoObra);
      const profit = totalIncome - gastoPecasReal;
      return {
        id: ordem.refOrdemTrabalho,
        matricula: veiculo?.matricula || 'N/A',
        cliente: cliente?.nome || 'N/A',
        dataConclusao: ordem.dataConclusao
          ? new Date(ordem.dataConclusao).toISOString().split('T')[0]
          : null,
        valorEntrada: totalIncome,
        gastoPecas: gastoPecasReal,
        maoObra: laborCost,
        lucro: profit,
        estado: ordem.estado || undefined
      };
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
