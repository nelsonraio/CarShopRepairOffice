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

    const normalizeEstado = (value?: string | null) =>
      (value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

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

    const ordensFiltradasPorEstado = ordensTrabalho.filter((ot: typeof ordensTrabalho[number]) => {
      const estadoNormalizado = normalizeEstado(ot.estado);

      if (estado) {
        return estadoNormalizado === normalizeEstado(estado);
      }

      // Sem filtro explícito, considerar concluído/concluída independentemente de acentos/maiúsculas/espaços
      return estadoNormalizado.startsWith('concluid');
    });

    // Defesa extra: excluir ordens que já tenham fatura pela tabela faturas
    const faturasComOrdem = await prisma.faturas.findMany({
      where: { ordem_trabalho_id: { not: null } },
      select: { id: true, ordem_trabalho_id: true }
    });

    const faturaIdsExistentes = new Set(
      faturasComOrdem.map((f: { id: bigint }) => Number(f.id))
    );

    const ordensJaFaturadas = new Set(
      faturasComOrdem
        .map((f: { ordem_trabalho_id: number | null }) => f.ordem_trabalho_id)
        .filter((id: number | null): id is number => typeof id === 'number')
    );

    // Limpar vínculos órfãos (ordens com fatura_id apontando para fatura inexistente)
    const ordensComVinculoOrfao = ordensFiltradasPorEstado.filter((ot: typeof ordensTrabalho[number]) => {
      if (!ot.fatura_id) return false;
      return !faturaIdsExistentes.has(Number(ot.fatura_id));
    });

    if (ordensComVinculoOrfao.length > 0) {
      const idsParaLimpar = ordensComVinculoOrfao.map((ot: typeof ordensTrabalho[number]) => Number(ot.id));
      await prisma.ordens_trabalho.updateMany({
        where: { id: { in: idsParaLimpar.map((id: number) => BigInt(id)) } },
        data: { fatura_id: null }
      });
      console.warn('⚠️ Vínculos órfãos removidos de ordens_trabalho.fatura_id:', idsParaLimpar);
    }

    const formatadas = ordensFiltradasPorEstado
      .filter((ot: typeof ordensTrabalho[number]) => {
        const jaFaturadaPorTabelaFaturas = ordensJaFaturadas.has(Number(ot.id));
        const temVinculoValidoPorFaturaId = !!ot.fatura_id && faturaIdsExistentes.has(Number(ot.fatura_id));
        return !jaFaturadaPorTabelaFaturas && !temVinculoValidoPorFaturaId;
      })
      .map((ot: typeof ordensTrabalho[number]) => ({
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

    console.log('📊 [Ordens para faturar] Totais:');
    console.log('   Ordens sem fatura_id:', ordensTrabalho.length);
    console.log('   Após filtro de estado:', ordensFiltradasPorEstado.length);
    console.log('   Excluídas por já faturadas:', ordensFiltradasPorEstado.length - formatadas.length);
    console.log('   Resultado final:', formatadas.length);

    return NextResponse.json({
      success: true,
      data: formatadas,
      total: formatadas.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
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
        },
        itens_ordem_trabalho: true
      }
    });

    if (!ordemTrabalho) {
      return NextResponse.json(
        { success: false, error: 'Ordem de trabalho não encontrada' },
        { status: 404 }
      );
    }

    if (ordemTrabalho.fatura_id) {
      const faturaPorVinculo = await prisma.faturas.findUnique({
        where: { id: ordemTrabalho.fatura_id },
        select: { id: true, numero_fatura: true }
      });

      if (faturaPorVinculo) {
        return NextResponse.json(
          {
            success: false,
            error: `Esta ordem de trabalho já está associada à fatura ${faturaPorVinculo.numero_fatura}.`
          },
          { status: 409 }
        );
      }

      // Vínculo órfão: limpar e continuar
      await prisma.ordens_trabalho.update({
        where: { id: ordemTrabalho.id },
        data: { fatura_id: null }
      });
      console.warn('⚠️ Vínculo órfão limpo em ordem_trabalho:', Number(ordemTrabalho.id));
    }

    const faturaExistente = await prisma.faturas.findFirst({
      where: { ordem_trabalho_id: Number(ordemTrabalho.id) },
      select: { id: true, numero_fatura: true }
    });

    if (faturaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: `Esta ordem de trabalho já foi faturada (fatura ${faturaExistente.numero_fatura}).`
        },
        { status: 409 }
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
        cliente_morada: ordemTrabalho.veiculo?.cliente?.endereco,
        cliente_cidade: '', // Campo não disponível em clientes
        cliente_pais: '', // Campo não disponível em clientes
        cliente_codigo_postal: '', // Campo não disponível em clientes
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
        trabalho_realizado: ordemTrabalho.trabalho_realizado,
        itens: ordemTrabalho.itens_ordem_trabalho.map(item => ({
          tipo: item.tipo_item,
          descricao: item.descricao,
          quantidade: parseFloat(item.quantidade?.toString() || '1'),
          preco_unitario: parseFloat(item.preco_unitario.toString()),
          valor_total: parseFloat(item.valor_total.toString())
        }))
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Erro ao obter ordem de trabalho:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao obter ordem de trabalho' },
      { status: 500 }
    );
  }
}


