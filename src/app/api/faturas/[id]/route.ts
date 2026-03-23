import { NextRequest, NextResponse } from 'next/server';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { faturas } from '@/db/schema';
import { eq } from 'drizzle-orm';


// Simula API da TOQ Online - Obter Fatura por ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [fatura] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));

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
        numero_fatura: fatura.numeroFatura,
        cliente_id: fatura.clienteId,
        data_emissao: fatura.dataEmissao,
        data_vencimento: fatura.dataVencimento,
        estado: fatura.estado,
        subtotal: parseFloat(fatura.subtotal.toString()),
        valor_imposto: parseFloat(fatura.valorImposto?.toString() || '0'),
        valor_desconto: parseFloat(fatura.valorDesconto?.toString() || '0'),
        valor_total: parseFloat(fatura.valorTotal.toString()),
        valor_pago: parseFloat(fatura.valorPago?.toString() || '0'),
        notas: fatura.notas,
        toconline_id: fatura.toconlineId,
        recibo_toconline_id: fatura.reciboToconlineId,
        criado_em: fatura.criadoEm,
        atualizado_em: fatura.atualizadoEm
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

    const updateData: any = { atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ') };
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.valor_pago !== undefined) updateData.valorPago = String(parseFloat(body.valor_pago));
    if (body.notas !== undefined) updateData.notas = body.notas;
    if (body.data_pagamento !== undefined) updateData.dataPagamento = new Date(body.data_pagamento).toISOString().slice(0, 10);

    await db.update(faturas).set(updateData).where(eq(faturas.id, Number(id)));
    const [fatura] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    if (!fatura) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
    }

    await registarAuditoria('UPDATE', 'faturas', Number(id), null, updateData, req);

    return NextResponse.json({
      success: true,
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numeroFatura,
        cliente_id: fatura.clienteId,
        estado: fatura.estado,
        subtotal: parseFloat(fatura.subtotal.toString()),
        valor_imposto: parseFloat(fatura.valorImposto?.toString() || '0'),
        valor_desconto: parseFloat(fatura.valorDesconto?.toString() || '0'),
        valor_total: parseFloat(fatura.valorTotal.toString()),
        valor_pago: parseFloat(fatura.valorPago?.toString() || '0'),
        criado_em: fatura.criadoEm,
        atualizado_em: fatura.atualizadoEm
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
    console.error('Erro ao atualizar fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar fatura' },
      { status: 500 }
    );
  }
}

// Marcar como Paga e Emitir Recibo no TOConline
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = { atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ') };
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.valor_pago !== undefined) updateData.valorPago = String(parseFloat(body.valor_pago));
    if (body.notas !== undefined) updateData.notas = body.notas;
    if (body.data_pagamento !== undefined) updateData.dataPagamento = new Date(body.data_pagamento).toISOString().slice(0, 10);
    
    if (body.marcar_paga) {
      // Buscar fatura para obter valor_total
      const [faturaAtual] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
      
      if (!faturaAtual) {
        return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
      }

      updateData.estado = 'paga';
      updateData.dataPagamento = new Date().toISOString().slice(0, 10);
      updateData.valorPago = faturaAtual.valorTotal || '0.00';

      // TODO: Emitir recibo no TOConline (requer OAuth)
      // Se implementar sistema de tokens persistentes, descomentar código abaixo
      /*
      if (faturaAtual.toconline_id && body.authCode) {
        try {
          const token = await getOAuthToken(body.authCode);
          const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api7.toconline.pt';
          
          const grossTotal = parseFloat(faturaAtual.valor_total.toString());
          const netTotal = parseFloat(faturaAtual.subtotal.toString());
          const retentionTotal = grossTotal - netTotal;

          const reciboPayload = {
            date: new Date().toISOString().split('T')[0],
            payment_mechanism: 'MO',
            gross_total: grossTotal,
            net_total: netTotal,
            cash_account_id: 2,
            customer_id: parseInt(faturaAtual.toconline_customer_id || '0'),
            lines: [{
              receivable_type: 'Document',
              receivable_id: parseInt(faturaAtual.toconline_id),
              received_value: grossTotal,
              settlement_percentage: 0,
              gross_total: grossTotal,
              settlement_amount: 0.0,
              net_total: netTotal,
              retention_total: retentionTotal
            }]
          };

          const reciboRes = await fetch(`${BASE_URL}/api/v1/commercial_sales_receipts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/vnd.api+json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reciboPayload)
          });

          const reciboData = await reciboRes.json();
          console.log('✅ Recibo emitido:', reciboData);
          
          if (reciboData.id) {
            updateData.recibo_toconline_id = String(reciboData.id);
          }
        } catch (reciboError) {
          console.error('⚠️ Erro ao emitir recibo no TOConline:', reciboError);
        }
      }
      */
    }

    await db.update(faturas).set(updateData).where(eq(faturas.id, Number(id)));
    const [fatura] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    if (!fatura) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
    }

    await registarAuditoria('UPDATE', 'faturas', Number(id), null, { estado: fatura.estado, valor_pago: fatura.valorPago ? parseFloat(fatura.valorPago.toString()) : null }, req);

    return NextResponse.json({
      success: true,
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numeroFatura,
        cliente_id: fatura.clienteId,
        estado: fatura.estado,
        subtotal: parseFloat(fatura.subtotal.toString()),
        valor_total: parseFloat(fatura.valorTotal.toString()),
        valor_pago: parseFloat(fatura.valorPago?.toString() || '0'),
        criado_em: fatura.criadoEm,
        atualizado_em: fatura.atualizadoEm
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
    console.error('Erro ao atualizar status da fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar fatura' },
      { status: 500 }
    );
  }
}

// Simula API da TOQ Online - Eliminar Fatura (Anular)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db.update(faturas).set({ estado: 'cancelada', atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ') }).where(eq(faturas.id, Number(id)));
    const [fatura] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    if (!fatura) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
    }

    await registarAuditoria('DELETE', 'faturas', Number(id), null, { estado: 'cancelada', numero_fatura: fatura.numeroFatura }, _req);

    return NextResponse.json({
      success: true,
      message: 'Fatura anulada com sucesso',
      data: {
        id: Number(fatura.id),
        numero_fatura: fatura.numeroFatura,
        estado: fatura.estado
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
    console.error('Erro ao anular fatura:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao anular fatura' },
      { status: 500 }
    );
  }
}


