import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Configurações OAuth TOConline
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '8f753cea78d995b5b6c877933495bf2b';
const OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'https://app7.toconline.pt/oauth';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';

async function getOAuthToken(code: string) {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const res = await fetch(`${OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE
    })
  });
  
  const json = await res.json();
  
  if (!json.access_token) {
    throw new Error('Falha ao obter access_token: ' + JSON.stringify(json));
  }
  return json.access_token;
}


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
        toconline_id: fatura.toconline_id,
        recibo_toconline_id: fatura.recibo_toconline_id,
        criado_em: fatura.criado_em,
        atualizado_em: fatura.atualizado_em
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

    const updateData: any = { atualizado_em: new Date() };
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.valor_pago !== undefined) updateData.valor_pago = parseFloat(body.valor_pago);
    if (body.notas !== undefined) updateData.notas = body.notas;
    if (body.data_pagamento !== undefined) updateData.data_pagamento = new Date(body.data_pagamento);
    
    if (body.marcar_paga) {
      // Buscar fatura para obter valor_total
      const faturaAtual = await prisma.faturas.findUnique({
        where: { id: BigInt(id) }
      });
      
      if (!faturaAtual) {
        return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
      }

      updateData.estado = 'paga';
      updateData.data_pagamento = new Date();
      updateData.valor_pago = faturaAtual.valor_total || 0;

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


