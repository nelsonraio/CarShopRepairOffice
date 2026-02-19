import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Simula API da TOQ Online - Listar Ordens de Trabalho para Faturar
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('cliente_id');
    const estado = searchParams.get('estado');

    const where: any = {};

    // Se não especificar estado, busca as que podem ser faturadas (concluído)
    if (estado) {
      where.estado = estado;
    } else {
      where.estado = 'concluido';
    }

    if (clienteId) {
      where.cliente_id = parseInt(clienteId);
    }

    const ordensTrabalho = await prisma.ordens_trabalho.findMany({
      where,
      include: {
        veiculo: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: { data_conclusao: 'desc' },
      take: 100
    });

    const formatadas = ordensTrabalho.map(ot => ({
      id: Number(ot.id),
      ref_ordem_trabalho: ot.ref_ordem_trabalho,
      cliente_id: ot.cliente_id,
      cliente_nome: ot.veiculo?.cliente?.nome,
      cliente_nif: ot.veiculo?.cliente?.nif,
      matricula: ot.veiculo?.matricula,
      veiculo_marca: ot.veiculo?.marca,
      veiculo_modelo: ot.veiculo?.modelo,
      veiculo_id: Number(ot.veiculo_id),
      data_conclusao: ot.data_conclusao,
      total_pecas: parseFloat(ot.total_pecas?.toString() || '0'),
      total_mao_obra: parseFloat(ot.total_mao_obra?.toString() || '0'),
      total_desconto: parseFloat(ot.total_desconto?.toString() || '0'),
      total_imposto: parseFloat(ot.total_imposto?.toString() || '0'),
      total_geral: parseFloat(ot.total_geral.toString()),
      estado: ot.estado,
      criado_em: ot.criado_em
    }));

    return NextResponse.json({
      success: true,
      data: formatadas,
      total: formatadas.length
    });
  } catch (error) {
    console.error('Erro ao listar ordens de trabalho:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar ordens de trabalho' },
      { status: 500 }
    );
  }
}

// POST - Obter dados de uma ordem de trabalho específica para pré-preencher fatura
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ordem_trabalho_id } = body;

    const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
      where: { id: BigInt(ordem_trabalho_id) },
      include: {
        veiculo: {
          include: {
            cliente: true
          }
        }
      }
    });

    if (!ordemTrabalho) {
      return NextResponse.json(
        { success: false, error: 'Ordem de trabalho não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ordem_trabalho_id: Number(ordemTrabalho.id),
        ref_ordem_trabalho: ordemTrabalho.ref_ordem_trabalho,
        cliente_id: ordemTrabalho.cliente_id,
        cliente_nome: ordemTrabalho.veiculo?.cliente?.nome,
        cliente_nif: ordemTrabalho.veiculo?.cliente?.nif,
        cliente_email: ordemTrabalho.veiculo?.cliente?.email,
        cliente_telefone: ordemTrabalho.veiculo?.cliente?.telefone,
        matricula: ordemTrabalho.veiculo?.matricula,
        veiculo_marca: ordemTrabalho.veiculo?.marca,
        veiculo_modelo: ordemTrabalho.veiculo?.modelo,
        data_conclusao: ordemTrabalho.data_conclusao,
        total_pecas: parseFloat(ordemTrabalho.total_pecas?.toString() || '0'),
        total_mao_obra: parseFloat(ordemTrabalho.total_mao_obra?.toString() || '0'),
        total_desconto: parseFloat(ordemTrabalho.total_desconto?.toString() || '0'),
        total_imposto: parseFloat(ordemTrabalho.total_imposto?.toString() || '0'),
        total_geral: parseFloat(ordemTrabalho.total_geral.toString()),
        descricao_problema: ordemTrabalho.descricao_problema,
        trabalho_realizado: ordemTrabalho.trabalho_realizado
      }
    });
  } catch (error) {
    console.error('Erro ao obter ordem de trabalho:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao obter ordem de trabalho' },
      { status: 500 }
    );
  }
}
