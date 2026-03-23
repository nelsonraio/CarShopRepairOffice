
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { ordensTrabalho, veiculos, clientes, itensOrdemTrabalho } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

// Simula API da TOQ Online - Listar Ordens de Trabalho para Faturar
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('cliente_id');

    // Montar filtro base
    const where = [];
    if (clienteId) {
      where.push(eq(ordensTrabalho.clienteId, Number(clienteId)));
    }

    // Buscar ordens de trabalho (máx 100, ordenadas por data_conclusao desc)
    const ordensTrabalhoList = await db.select().from(ordensTrabalho)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(ordensTrabalho.dataConclusao))
      .limit(100);

    // Buscar veiculos e clientes relacionados
    const veiculoIds = ordensTrabalhoList.map(ot => ot.veiculoId).filter((id): id is number => !!id);
    const veiculosList = veiculoIds.length
      ? await db.select().from(veiculos).where(inArray(veiculos.id, veiculoIds))
      : [];
    const clienteIds = veiculosList.map(v => v.clienteId).filter((id): id is number => !!id);
    const clientesList = clienteIds.length
      ? await db.select().from(clientes).where(inArray(clientes.id, clienteIds))
      : [];

    // Montar resposta
    const response = ordensTrabalhoList.map(ot => {
      const veiculo = veiculosList.find(v => v.id === ot.veiculoId);
      const cliente = veiculo ? clientesList.find(c => c.id === veiculo.clienteId) : undefined;
      return {
        ordem_trabalho_id: ot.id,
        ref_ordem_trabalho: ot.refOrdemTrabalho,
        cliente_id: cliente?.id ?? null,
        cliente_nome: cliente?.nome ?? '',
        cliente_nif: cliente?.nif ?? '',
        cliente_email: cliente?.email ?? '',
        cliente_telefone: cliente?.telefone ?? '',
        cliente_morada: cliente?.endereco ?? '',
        cliente_cidade: '', // Campo não disponível em clientes
        cliente_pais: '', // Campo não disponível em clientes
        matricula: veiculo?.matricula ?? '',
        veiculo_marca: veiculo?.marca ?? '',
        veiculo_modelo: veiculo?.modelo ?? '',
        veiculo_id: veiculo?.id ?? null,
        data_conclusao: ot.dataConclusao,
        total_pecas: parseFloat(ot.totalPecas?.toString() || '0'),
        total_mao_obra: parseFloat(ot.totalMaoObra?.toString() || '0'),
        total_desconto: parseFloat(ot.totalDesconto?.toString() || '0'),
        total_geral: parseFloat(ot.totalGeral?.toString() || '0'),
        estado: ot.estado,
        criado_em: ot.criadoEm
      };
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ordemTrabalhoId = Number(body?.ordem_trabalho_id);

    if (!Number.isFinite(ordemTrabalhoId) || ordemTrabalhoId <= 0) {
      return NextResponse.json({ success: false, error: 'ordem_trabalho_id inválido' }, { status: 400 });
    }

    const ordem = await db.query.ordensTrabalho.findFirst({
      where: (ot, { eq }) => eq(ot.id, ordemTrabalhoId)
    });

    if (!ordem) {
      return NextResponse.json({ success: false, error: 'Ordem de trabalho não encontrada' }, { status: 404 });
    }

    const veiculo = ordem.veiculoId
      ? await db.query.veiculos.findFirst({ where: (v, { eq }) => eq(v.id, ordem.veiculoId as number) })
      : null;

    const clienteId = ordem.clienteId ?? veiculo?.clienteId ?? null;
    const cliente = clienteId
      ? await db.query.clientes.findFirst({ where: (c, { eq }) => eq(c.id, clienteId as number) })
      : null;

    const itens = await db.query.itensOrdemTrabalho.findMany({
      where: (item, { eq }) => eq(item.ordemTrabalhoId, ordemTrabalhoId)
    });

    const itensFormatados = itens.map((item) => ({
      id: Number(item.id),
      tipo: item.tipoItem === 'servico' ? 'servico' : 'peca',
      descricao: item.descricao || '',
      quantidade: Number(item.quantidade) || 0,
      preco_unitario: Number(item.precoUnitario) || 0,
      valor_total: Number(item.valorTotal) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ordem_trabalho_id: ordem.id,
        ref_ordem_trabalho: ordem.refOrdemTrabalho,
        cliente_id: cliente?.id ?? null,
        cliente_nome: cliente?.nome ?? '',
        cliente_nif: cliente?.nif ?? '',
        cliente_morada: cliente?.endereco ?? '',
        cliente_cidade: '',
        cliente_pais: '',
        cliente_codigo_postal: '',
        matricula: veiculo?.matricula ?? '',
        veiculo_marca: veiculo?.marca ?? '',
        veiculo_modelo: veiculo?.modelo ?? '',
        veiculo_id: veiculo?.id ?? null,
        trabalho_realizado: ordem.trabalhoRealizado ?? '',
        total_pecas: parseFloat(ordem.totalPecas?.toString() || '0'),
        total_mao_obra: parseFloat(ordem.totalMaoObra?.toString() || '0'),
        total_desconto: parseFloat(ordem.totalDesconto?.toString() || '0'),
        total_geral: parseFloat(ordem.totalGeral?.toString() || '0'),
        data_conclusao: ordem.dataConclusao,
        itens: itensFormatados,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


