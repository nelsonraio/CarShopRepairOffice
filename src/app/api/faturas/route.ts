import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Simula API da TOQ Online - Listar Faturas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.estado = status;
    }

    const faturas = await prisma.faturas.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { data_emissao: 'desc' }
    });

    const clienteIds = Array.from(new Set(faturas.map((f: typeof faturas[number]) => f.cliente_id)));
    const clientes = clienteIds.length
      ? await prisma.clientes.findMany({
          where: { id: { in: clienteIds } },
          select: { id: true, nome: true, nif: true }
        })
      : [];

    const clienteMap = new Map<number, { nome: string; nif: string | null }>(
      clientes.map((cliente: typeof clientes[number]) => [cliente.id, { nome: cliente.nome, nif: cliente.nif }])
    );

    const ordemIds = faturas
      .map((f: typeof faturas[number]) => f.ordem_trabalho_id)
      .filter((id: unknown): id is number => typeof id === 'number');

    const ordensTrabalho = ordemIds.length
      ? await prisma.ordens_trabalho.findMany({
          where: { id: { in: ordemIds.map((id: number) => BigInt(id)) } },
          select: { 
            id: true, 
            ref_ordem_trabalho: true,
            veiculo: {
              select: {
                marca: true,
                modelo: true,
                matricula: true
              }
            }
          }
        })
      : [];

    const ordemMap = new Map<number, { ref_ordem_trabalho?: string | null; veiculo?: { marca?: string | null; modelo?: string | null; matricula?: string | null } }>(
      ordensTrabalho.map((ordem: typeof ordensTrabalho[number]) => [
        Number(ordem.id), 
        {
          ref_ordem_trabalho: ordem.ref_ordem_trabalho,
          veiculo: ordem.veiculo
        }
      ])
    );

    const total = await prisma.faturas.count({ where });

    // Converter BigInt para Number para JSON serialization
    const faturasFormatadas = faturas.map((f: typeof faturas[number]) => ({
      id: Number(f.id),
      numero_fatura: f.numero_fatura,
      cliente_id: f.cliente_id,
      cliente_nome: clienteMap.get(f.cliente_id)?.nome,
      cliente_nif: clienteMap.get(f.cliente_id)?.nif,
      ordem_trabalho_ref: f.ordem_trabalho_id
        ? ordemMap.get(f.ordem_trabalho_id)?.ref_ordem_trabalho
        : undefined,
      veiculo_marca: f.ordem_trabalho_id
        ? ordemMap.get(f.ordem_trabalho_id)?.veiculo?.marca
        : undefined,
      veiculo_modelo: f.ordem_trabalho_id
        ? ordemMap.get(f.ordem_trabalho_id)?.veiculo?.modelo
        : undefined,
      veiculo_matricula: f.ordem_trabalho_id
        ? ordemMap.get(f.ordem_trabalho_id)?.veiculo?.matricula
        : undefined,
      data_emissao: f.data_emissao,
      data_vencimento: f.data_vencimento,
      estado: f.estado,
      subtotal: parseFloat(f.subtotal.toString()),
      valor_imposto: parseFloat(f.valor_imposto?.toString() || '0'),
      valor_desconto: parseFloat(f.valor_desconto?.toString() || '0'),
      valor_total: parseFloat(f.valor_total.toString()),
      valor_pago: parseFloat(f.valor_pago?.toString() || '0'),
      notas: f.notas,
      toconline_id: f.toconline_id,
      recibo_toconline_id: f.recibo_toconline_id,
      criado_em: f.criado_em
    }));

    return NextResponse.json({
      success: true,
      data: faturasFormatadas,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
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
    console.error('Erro ao listar faturas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar faturas' },
      { status: 500 }
    );
  }
}

// Simula API da TOQ Online - Criar Fatura
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      cliente_id,
      cliente_nif,
      numero_fatura,
      toconline_id,
      toconline_customer_id,
      ordem_trabalho_id,
      data_emissao,
      data_vencimento,
      subtotal,
      valor_imposto,
      valor_desconto,
      valor_total,
      notas
    } = body;

    if (!numero_fatura) {
      return NextResponse.json(
        { success: false, error: 'numero_fatura obrigatório. Use o número devolvido pelo TOConline.' },
        { status: 400 }
      );
    }

    const ordemTrabalhoIdParsed = ordem_trabalho_id ? parseInt(ordem_trabalho_id) : null;

    if (ordemTrabalhoIdParsed) {
      const faturaExistente = await prisma.faturas.findFirst({
        where: { ordem_trabalho_id: ordemTrabalhoIdParsed },
        select: { id: true, numero_fatura: true }
      });

      if (faturaExistente) {
        return NextResponse.json(
          {
            success: false,
            error: `A ordem de trabalho já está faturada (fatura ${faturaExistente.numero_fatura}).`
          },
          { status: 409 }
        );
      }

      const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
        where: { id: BigInt(ordemTrabalhoIdParsed) },
        select: { id: true, ref_ordem_trabalho: true, fatura_id: true }
      });

      if (!ordemTrabalho) {
        return NextResponse.json(
          { success: false, error: 'Ordem de trabalho não encontrada.' },
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
              error: `A ordem ${ordemTrabalho.ref_ordem_trabalho} já está associada à fatura ${faturaPorVinculo.numero_fatura}.`
            },
            { status: 409 }
          );
        }

        await prisma.ordens_trabalho.update({
          where: { id: BigInt(ordemTrabalhoIdParsed) },
          data: { fatura_id: null }
        });
        console.warn('⚠️ Vínculo órfão limpo em ordens_trabalho.fatura_id:', ordemTrabalhoIdParsed);
      }
    }

    if (cliente_nif && cliente_id) {
      const nifExistente = await prisma.clientes.findFirst({
        where: {
          nif: cliente_nif,
          id: { not: cliente_id }
        },
        select: { id: true }
      });

      if (nifExistente) {
        return NextResponse.json(
          { success: false, error: 'NIF ja associado a outro cliente' },
          { status: 409 }
        );
      }

      await prisma.clientes.update({
        where: { id: cliente_id },
        data: { nif: cliente_nif }
      });
    }

    // Criar fatura
    const fatura = await prisma.faturas.create({
      data: {
        numero_fatura,
        cliente_id,
        ordem_trabalho_id: ordemTrabalhoIdParsed,
        data_emissao: new Date(data_emissao),
        data_vencimento: new Date(data_vencimento),
        subtotal: parseFloat(subtotal),
        valor_imposto: parseFloat(valor_imposto || 0),
        valor_desconto: parseFloat(valor_desconto || 0),
        valor_total: parseFloat(valor_total),
        estado: 'pendente',
        notas,
        valor_pago: 0,
        toconline_id: toconline_id ? String(toconline_id) : null,
        toconline_customer_id: toconline_customer_id ? String(toconline_customer_id) : null
      }
    });
    // Se ordem_trabalho_id existe, associar id da fatura à ordem de trabalho
    if (ordemTrabalhoIdParsed) {
      await prisma.ordens_trabalho.update({
        where: { id: BigInt(ordemTrabalhoIdParsed) },
        data: { fatura_id: fatura.id }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numero_fatura,
        cliente_id: fatura.cliente_id,
        data_emissao: fatura.data_emissao,
        data_vencimento: fatura.data_vencimento,
        estado: fatura.estado,
        subtotal: parseFloat(fatura.subtotal.toString()),
        valor_imposto: parseFloat(fatura.valor_imposto?.toString() || '0'),
        valor_desconto: parseFloat(fatura.valor_desconto?.toString() || '0'),
        valor_total: parseFloat(fatura.valor_total.toString()),
        valor_pago: parseFloat(fatura.valor_pago?.toString() || '0'),
        notas: fatura.notas,
        criado_em: fatura.criado_em
      }
    }, { status: 201 });

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
    console.error('Erro ao criar fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar fatura' },
      { status: 500 }
    );
  }
}


