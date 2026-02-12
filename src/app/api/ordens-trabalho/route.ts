import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const ordensTrabalho = await prisma.ordens_trabalho.findMany({
      orderBy: { criado_em: 'desc' }
    });

    const clienteIds = Array.from(new Set(ordensTrabalho.map(o => o.cliente_id).filter((v): v is number => v != null)));
    const veiculoIds = Array.from(new Set(ordensTrabalho.map(o => o.veiculo_id).filter((v): v is number => v != null)));
    const mecanicoIds = Array.from(new Set(ordensTrabalho.map(o => o.mecanico_id).filter((v): v is number => v != null)));

    const [clientes, veiculos, mecanicos] = await Promise.all([
      clienteIds.length ? prisma.clientes.findMany({ where: { id: { in: clienteIds } } }) : Promise.resolve([]),
      veiculoIds.length ? prisma.veiculos.findMany({ where: { id: { in: veiculoIds } } }) : Promise.resolve([]),
      mecanicoIds.length ? prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds } } }) : Promise.resolve([]),
    ]);

    const clienteMap = new Map(clientes.map(c => [c.id, c]));
    const veiculoMap = new Map(veiculos.map(v => [Number((v.id as any)), v]));
    const mecanicoMap = new Map(mecanicos.map(m => [m.id, m]));

    const transformedOrdens = ordensTrabalho.map((ordem) => ({
      id: ordem.ref_ordem_trabalho,
      client: (clienteMap.get(ordem.cliente_id) as any)?.nome || '',
      vehicle: `${(veiculoMap.get(ordem.veiculo_id) as any)?.marca || ''} ${(veiculoMap.get(ordem.veiculo_id) as any)?.modelo || ''} | ${(veiculoMap.get(ordem.veiculo_id) as any)?.matricula || ''}`,
      mechanic: ordem.mecanico_id != null ? (mecanicoMap.get(ordem.mecanico_id) as any)?.nome || '' : '',
      openDate: ordem.data_inicio ? ordem.data_inicio.toLocaleDateString('pt-PT') : '',
      closeDate: ordem.data_conclusao ? ordem.data_conclusao.toLocaleDateString('pt-PT') : '',
      total: Number((ordem as any).total_geral) || 0,
      status: mapStatus((ordem as any).estado),
      priority: mapPriority((ordem as any).prioridade),
      problem: ordem.descricao_problema || ''
    }));

    return NextResponse.json(transformedOrdens);
  } catch (error) {
    console.error('Error fetching ordens_trabalho:', error);
    return NextResponse.json({ error: 'Failed to fetch ordens_trabalho' }, { status: 500 });
  }
}

function mapStatus(status: string | null): 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada' {
  switch (status) {
    case 'em_andamento': return 'Em Andamento';
    case 'concluida': return 'Concluída';
    case 'cancelada': return 'Cancelada';
    default: return 'Aberta';
  }
}

function mapPriority(priority: string | null): 'Baixa' | 'Normal' | 'Alta' | 'Urgente' {
  switch (priority) {
    case 'baixa': return 'Baixa';
    case 'alta': return 'Alta';
    case 'urgente': return 'Urgente';
    default: return 'Normal';
  }
}
