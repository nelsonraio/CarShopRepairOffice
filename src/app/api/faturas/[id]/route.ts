import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Simula API da TOQ Online - Obter Fatura por ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fatura = await prisma.faturas.findUnique({
      where: { id: BigInt(id) }
    });

    if (!fatura) {
      return NextResponse.json(
        { success: false, error: 'Fatura não encontrada' },
        { status: 404 }
      );
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
        criado_em: fatura.criado_em,
        atualizado_em: fatura.atualizado_em
      }
    });
  } catch (error) {
    console.error('Erro ao obter fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao obter fatura' },
      { status: 500 }
    );
  }
}

// Simula API da TOQ Online - Atualizar Fatura
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { atualizado_em: new Date() };
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.valor_pago !== undefined) updateData.valor_pago = parseFloat(body.valor_pago);
    if (body.notas !== undefined) updateData.notas = body.notas;
    if (body.data_pagamento !== undefined) updateData.data_pagamento = new Date(body.data_pagamento);

    const fatura = await prisma.faturas.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numero_fatura,
        cliente_id: fatura.cliente_id,
        estado: fatura.estado,
        subtotal: parseFloat(fatura.subtotal.toString()),
        valor_imposto: parseFloat(fatura.valor_imposto?.toString() || '0'),
        valor_desconto: parseFloat(fatura.valor_desconto?.toString() || '0'),
        valor_total: parseFloat(fatura.valor_total.toString()),
        valor_pago: parseFloat(fatura.valor_pago?.toString() || '0'),
        criado_em: fatura.criado_em,
        atualizado_em: fatura.atualizado_em
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar fatura' },
      { status: 500 }
    );
  }
}

// Simula API da TOQ Online - Marcar como Paga
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { atualizado_em: new Date() };
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.valor_pago !== undefined) updateData.valor_pago = parseFloat(body.valor_pago);
    if (body.notas !== undefined) updateData.notas = body.notas;
    if (body.data_pagamento !== undefined) updateData.data_pagamento = new Date(body.data_pagamento);
    if (body.marcar_paga) {
      updateData.estado = 'paga';
      updateData.data_pagamento = new Date();
    }

    const fatura = await prisma.faturas.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numero_fatura,
        cliente_id: fatura.cliente_id,
        estado: fatura.estado,
        subtotal: parseFloat(fatura.subtotal.toString()),
        valor_total: parseFloat(fatura.valor_total.toString()),
        valor_pago: parseFloat(fatura.valor_pago?.toString() || '0'),
        criado_em: fatura.criado_em,
        atualizado_em: fatura.atualizado_em
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status da fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar fatura' },
      { status: 500 }
    );
  }
}

// Simula API da TOQ Online - Eliminar Fatura (Anular)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const fatura = await prisma.faturas.update({
      where: { id: BigInt(id) },
      data: {
        estado: 'cancelada',
        atualizado_em: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fatura anulada com sucesso',
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numero_fatura,
        estado: fatura.estado
      }
    });
  } catch (error) {
    console.error('Erro ao anular fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao anular fatura' },
      { status: 500 }
    );
  }
}
