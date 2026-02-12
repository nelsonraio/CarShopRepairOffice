import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();

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
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      notas,
      items
    } = body;

    // Create the budget
    const orcamento = await prisma.orcamentos.create({
      data: {
        ref_orcamento,
        cliente_id: parseInt(cliente_id),
        veiculo_id: BigInt(veiculo_id),
        preparado_por: preparado_por ? parseInt(preparado_por) : null,
        data_emissao: data_emissao ? new Date(data_emissao) : new Date(),
        data_expiracao: data_expiracao ? new Date(data_expiracao) : null,
        estado: estado || 'pendente',
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
      const budgetItems = items.map((item: any) => ({
        orcamento_id: orcamento.id,
        tipo_item: item.type === 'service' ? 'servico' : 'peca',
        servico_id: item.type === 'service' ? parseInt(item.id) : null,
        peca_id: item.type === 'part' ? parseInt(item.id) : null,
        descricao: item.name,
        quantidade: parseFloat(item.quantity),
        preco_unitario: parseFloat(item.unitPrice),
        valor_total: parseFloat(item.total)
      }));

      await prisma.itens_orcamento.createMany({
        data: budgetItems
      });
    }

    return NextResponse.json({
      success: true,
      orcamento: {
        id: orcamento.id,
        ref_orcamento: orcamento.ref_orcamento,
        total_geral: orcamento.total_geral
      }
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const orcamentos = await prisma.orcamentos.findMany({
      include: {
        cliente: true,
        veiculo: true,
        itens_orcamento: true
      },
      where: {
        veiculo_id: {
          not: null
        },
        cliente_id: {
          not: null
        }
      },
      orderBy: { criado_em: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.orcamentos.count();

    // Convert BigInt and Decimal fields to numbers for JSON serialization
    const serializedOrcamentos = orcamentos.map((orcamento: any) => ({
      ...orcamento,
      id: Number(orcamento.id),
      veiculo_id: orcamento.veiculo_id ? Number(orcamento.veiculo_id) : null,
      total_pecas: Number(orcamento.total_pecas),
      total_mao_obra: Number(orcamento.total_mao_obra),
      total_desconto: Number(orcamento.total_desconto),
      total_imposto: Number(orcamento.total_imposto),
      total_geral: Number(orcamento.total_geral),
      cliente: orcamento.cliente ? {
        ...orcamento.cliente,
        id: Number(orcamento.cliente.id),
        desconto: Number(orcamento.cliente.desconto)
      } : null,
      veiculo: orcamento.veiculo ? {
        ...orcamento.veiculo,
        id: Number(orcamento.veiculo.id)
      } : null,
      itens_orcamento: orcamento.itens_orcamento.map((item: any) => ({
        ...item,
        id: Number(item.id),
        orcamento_id: Number(item.orcamento_id),
        servico_id: item.servico_id ? Number(item.servico_id) : null,
        peca_id: item.peca_id ? Number(item.peca_id) : null,
        quantidade: Number(item.quantidade),
        preco_unitario: Number(item.preco_unitario),
        valor_total: Number(item.valor_total)
      }))
    }));

    return NextResponse.json({
      orcamentos: serializedOrcamentos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    // Delete budget items first due to foreign key constraint
    await prisma.itens_orcamento.deleteMany({
      where: { orcamento_id: parseInt(id) }
    });

    // Delete the budget
    await prisma.orcamentos.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
