 import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ref_ordem_trabalho,
      cliente_id,
      veiculo_id,
      mecanico_id,
      orcamento_id,
      data_inicio,
      data_conclusao,
      estado,
      descricao_problema,
      trabalho_realizado,
      recomendacoes,
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      items
    } = body;

    // Create the work order
    const ordemTrabalho = await prisma.ordens_trabalho.create({
      data: {
        ref_ordem_trabalho,
        cliente_id: parseInt(cliente_id),
        veiculo_id: parseInt(veiculo_id),
        mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
        orcamento_id: orcamento_id ? parseInt(orcamento_id) : null,
        data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
        data_conclusao: data_conclusao ? new Date(data_conclusao) : null,
        estado: estado || 'em_andamento',
        descricao_problema,
        trabalho_realizado,
        recomendacoes,
        total_pecas: parseFloat(total_pecas) || 0,
        total_mao_obra: parseFloat(total_mao_obra) || 0,
        total_desconto: parseFloat(total_desconto) || 0,
        total_imposto: parseFloat(total_imposto) || 0,
        total_geral: parseFloat(total_geral) || 0
      }
    });

    // Create work order items if provided
    if (items && items.length > 0) {
      const workOrderItems = items.map((item: any) => ({
        ordem_trabalho_id: Number(ordemTrabalho.id),
        tipo_item: item.tipo_item || (item.type === 'service' ? 'servico' : 'peca'),
        servico_id: item.servico_id || (item.servico_id ? parseInt(item.servico_id) : null),
        peca_id: item.peca_id || (item.peca_id ? parseInt(item.peca_id) : null),
        descricao: item.descricao || item.name,
        quantidade: parseFloat(item.quantidade || item.quantity) || 1,
        preco_unitario: parseFloat(item.preco_unitario || item.unitPrice) || 0,
        valor_desconto: parseFloat(item.valor_desconto || item.desconto) || 0,
        valor_imposto: parseFloat(item.valor_imposto) || 0,
        valor_total: parseFloat(item.valor_total || item.total) || 0,
        notas: item.notas || item.notes || null
      }));

      await prisma.itens_ordem_trabalho.createMany({
        data: workOrderItems
      });
    }

    return NextResponse.json({
      success: true,
      ordem_trabalho: {
        id: Number(ordemTrabalho.id),
        ref_ordem_trabalho: ordemTrabalho.ref_ordem_trabalho
      }
    });

  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Query work orders with related data
    const ordensTrabalho = await prisma.ordens_trabalho.findMany({
      orderBy: { criado_em: 'desc' },
      include: {
        mecanico: true, // Include the related mechanic's data
      },
    });

    const clienteIds = Array.from(new Set(ordensTrabalho.map(o => o.cliente_id).filter((v): v is number => v != null)));
    const veiculoIds = Array.from(new Set(ordensTrabalho.map(o => o.veiculo_id).filter((v): v is number => v != null)));

    const [clientes, veiculos] = await Promise.all([
      clienteIds.length ? prisma.clientes.findMany({ where: { id: { in: clienteIds } } }) : Promise.resolve([]),
      veiculoIds.length ? prisma.veiculos.findMany({ where: { id: { in: veiculoIds } } }) : Promise.resolve([]),
    ]);

    const clienteMap = new Map(clientes.map(c => [c.id, c]));
    const veiculoMap = new Map(veiculos.map(v => [Number(v.id), v]));

    const transformedOrdens = ordensTrabalho.map((ordem) => ({
      id: ordem.ref_ordem_trabalho,
      client: clienteMap.get(ordem.cliente_id)?.nome ?? '',
      vehicle: `${veiculoMap.get(ordem.veiculo_id)?.marca ?? ''} ${veiculoMap.get(ordem.veiculo_id)?.modelo ?? ''} | ${veiculoMap.get(ordem.veiculo_id)?.matricula ?? ''}`,
      mechanic: ordem.mecanico?.nome ?? '', // Directly access the included mechanic's name
      openDate: ordem.data_inicio ? ordem.data_inicio.toLocaleDateString('pt-PT') : '',
      closeDate: ordem.data_conclusao ? ordem.data_conclusao.toLocaleDateString('pt-PT') : '',
      total: Number(ordem.total_geral) || 0,
      status: mapStatus(ordem.estado),
      priority: mapPriority(ordem.prioridade),
      problem: ordem.descricao_problema ?? '',
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Work order ID is required' }, { status: 400 });
    }

    // First, get the work order to find its internal ID
    const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
      where: { ref_ordem_trabalho: id }
    });

    if (!ordemTrabalho) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Delete work order items first due to foreign key constraint
    await prisma.itens_ordem_trabalho.deleteMany({
      where: { ordem_trabalho_id: Number(ordemTrabalho.id) }
    });

    // Delete the work order
    await prisma.ordens_trabalho.delete({
      where: { ref_ordem_trabalho: id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting work order:', error);
    return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 });
  }
}
