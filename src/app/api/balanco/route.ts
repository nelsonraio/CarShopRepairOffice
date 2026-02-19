import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();
const prismaAny = prisma as any;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch completed work orders with related data
    const ordensTrabalho = await (prismaAny.ordens_trabalho as any).findMany({
      where: {
        estado: 'concluido'
      },
      include: {
        veiculo: {
          include: {
            cliente: true
          }
        },
        itens_ordem_trabalho: true
      },
      orderBy: { data_conclusao: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prismaAny.ordens_trabalho.count({
      where: {
        estado: 'concluido'
      }
    });

    // Build a Set of unique profile names to fetch once
    const profileNames = new Set<string>();
    ordensTrabalho.forEach((ordem: any) => {
      if (ordem.veiculo?.cliente?.perfil) {
        profileNames.add(ordem.veiculo.cliente.perfil);
      }
    });

    // Fetch all client profiles
    const profilesMap = new Map();
    if (profileNames.size > 0) {
      const profiles = await prismaAny.perfis_clientes.findMany({
        where: {
          nome: {
            in: Array.from(profileNames)
          }
        }
      });
      profiles.forEach((p: any) => {
        profilesMap.set(p.nome, parseFloat(p.perclucro) || 0);
      });
    }

    // Transform data to match frontend expectations
    const balanceData = ordensTrabalho.map((ordem: any) => {
      const clientePerfil = ordem.veiculo?.cliente?.perfil || 'Normal';
      const marginemLucro = profilesMap.get(clientePerfil) || 0;
      
      // Calculate real cost of parts without profit margin
      let gastoPecasReal = 0;
      if (ordem.itens_ordem_trabalho && ordem.itens_ordem_trabalho.length > 0) {
        gastoPecasReal = ordem.itens_ordem_trabalho.reduce((sum: number, item: any) => {
          const precoComMargem = parseFloat(item.preco_unitario) || 0;
          const quantidade = parseFloat(item.quantidade) || 1;
          // Remove margin: real_price = price_with_margin / (1 + margin_percent/100)
          const precoSemMargem = marginemLucro > 0 
            ? precoComMargem / (1 + marginemLucro / 100) 
            : precoComMargem;
          return sum + (precoSemMargem * quantidade);
        }, 0);
      }

      return {
        id: ordem.ref_ordem_trabalho,
        matricula: ordem.veiculo?.matricula || 'N/A',
        cliente: ordem.veiculo?.cliente?.nome || 'N/A',
        dataConclusao: ordem.data_conclusao ? new Date(ordem.data_conclusao).toISOString().split('T')[0] : null,
        valorEntrada: parseFloat(ordem.total_geral) || 0,
        gastoPecas: gastoPecasReal,
        maoObra: parseFloat(ordem.total_mao_obra) || 0,
        lucro: (parseFloat(ordem.total_geral) || 0) - gastoPecasReal
      };
    });

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to fetch balance data' },
      { status: 500 }
    );
  }
}
