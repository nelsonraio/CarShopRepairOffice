import { db } from '@/db/connection';
import { faturas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api7.toconline.pt';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token OAuth2 não fornecido' },
        { status: 400 }
      );
    }
    
    console.log('📋 Recibo - Token recebido:');
    console.log('   Comprimento:', token.length);
    console.log('   Primeiros 20 chars:', token.substring(0, 20) + '...');
    console.log('   Últimos 10 chars:', '...' + token.substring(token.length - 10));


    // Buscar fatura
    const [fatura] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));

    if (!fatura) {
      return NextResponse.json(
        { success: false, error: 'Fatura não encontrada' },
        { status: 404 }
      );
    }

    console.log('📋 Fatura encontrada:');
    console.log('   ID local:', fatura.id);
    console.log('   Número fatura local:', fatura.numeroFatura);
    console.log('   TOConline ID:', fatura.toconlineId);
    console.log('   Estado:', fatura.estado);

    if (fatura.estado !== 'pendente') {
      return NextResponse.json(
        { success: false, error: 'Apenas faturas pendentes podem ser marcadas como pagas' },
        { status: 400 }
      );
    }

    // Validar se fatura tem toconline_id (necessário para emitir recibo no TOConline)
    if (!fatura.toconlineId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Esta fatura não está vinculada ao TOConline. Apenas faturas criadas via TOConline podem ter recibos emitidos. Por favor, crie uma nova fatura.' 
        },
        { status: 400 }
      );
    }

    // Sincronizar numero_fatura local com o numero real no TOConline
    let numeroFaturaToconline: string | null = null;
    try {
      const documentoRes = await fetch(`${BASE_URL}/api/v1/commercial_sales_documents/${fatura.toconlineId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const documentoData = await documentoRes.json();
      if (documentoRes.ok) {
        numeroFaturaToconline =
          documentoData?.data?.attributes?.document_number ||
          documentoData?.attributes?.document_number ||
          null;

        if (numeroFaturaToconline) {
          console.log('🔄 Numero fatura TOConline encontrado:', numeroFaturaToconline);
        }
      } else {
        console.warn('⚠️ Não foi possível sincronizar numero_fatura com TOConline.');
        console.warn('   Status:', documentoRes.status);
      }
    } catch (syncError) {
      console.warn('⚠️ Erro ao sincronizar numero_fatura no TOConline:', syncError);
    }

    // Calcular totais - arredondar para 2 casas decimais para evitar erros de ponto flutuante
    const grossTotal = parseFloat(parseFloat(fatura.valorTotal.toString()).toFixed(2));
    const netTotal = parseFloat(parseFloat(fatura.subtotal.toString()).toFixed(2));
    const retentionTotal = parseFloat((grossTotal - netTotal).toFixed(2));

    // Criar payload do recibo (estrutura correta conforme documentação TOConline)
    const reciboPayload = {
      date: new Date().toISOString().split('T')[0],
      payment_mechanism: 'MO',
      gross_total: grossTotal,
      net_total: netTotal,
      customer_id: parseInt(fatura.toconlineCustomerId || '0'),
      lines: [{
        receivable_type: 'Document',
        receivable_id: parseInt(fatura.toconlineId),
        received_value: grossTotal,
        settlement_percentage: 0,
        gross_total: grossTotal,
        settlement_amount: 0,
        net_total: netTotal,
        retention_total: retentionTotal
      }]
    };

    console.log('📤 Emitindo recibo no TOConline...');
    console.log('   Fatura ID TOConline:', fatura.toconlineId);
    console.log('   Token usado (primeiros 20):', token.substring(0, 20) + '...');
    console.log('Payload:', JSON.stringify(reciboPayload, null, 2));

    // Emitir recibo no TOConline
    const reciboRes = await fetch(`${BASE_URL}/api/v1/commercial_sales_receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reciboPayload)
    });
    
    console.log('   Status resposta:', reciboRes.status, reciboRes.ok);
    
    const reciboData = await reciboRes.json();
    console.log('📥 Resposta TOConline completa:', JSON.stringify(reciboData, null, 2));

    if (!reciboRes.ok) {
      console.error('❌ Erro ao emitir recibo:');
      console.error('   Status:', reciboRes.status);
      console.error('   Resposta:', JSON.stringify(reciboData, null, 2));
      return NextResponse.json(
        { 
          success: false, 
          error: reciboData?.errors?.[0]?.detail || 'Erro ao emitir recibo no TOConline',
          details: reciboData 
        },
        { status: reciboRes.status }
      );
    }

    // Extrair ID do recibo da resposta TOConline
    // Tentar múltiplos caminhos possíveis
    let reciboId = reciboData?.id || 
                   reciboData?.data?.id || 
                   reciboData?.data?.attributes?.id;
    
    console.log('🔍 ID do Recibo encontrado:', reciboId);
    console.log('   Estrutura da resposta:', JSON.stringify({
      hasId: !!reciboData?.id,
      hasDataId: !!reciboData?.data?.id,
      hasDataAttributesId: !!reciboData?.data?.attributes?.id,
      dataKeys: reciboData?.data ? Object.keys(reciboData.data) : [],
      dataAttributesKeys: reciboData?.data?.attributes ? Object.keys(reciboData.data.attributes) : []
    }));
    
    // Atualizar fatura: marcar como paga e guardar ID do recibo

    await db.update(faturas)
      .set({
        numeroFatura: numeroFaturaToconline || fatura.numeroFatura,
        estado: 'paga',
        dataPagamento: new Date().toISOString().slice(0, 10),
        valorPago: fatura.valorTotal,
        reciboToconlineId: reciboId ? String(reciboId) : null,
        atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ')
      })
      .where(eq(faturas.id, Number(id)));
    const [faturaAtualizada] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    if (!faturaAtualizada) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
    }

    console.log('✅ Fatura atualizada:');
    console.log('   ID:', Number(faturaAtualizada.id));
    console.log('   Número fatura:', faturaAtualizada.numeroFatura);
    console.log('   Estado:', faturaAtualizada.estado);
    console.log('   Recibo ID armazenado:', reciboId);

    return NextResponse.json({
      success: true,
      data: {
        id: Number(faturaAtualizada.id),
        numero_fatura: faturaAtualizada.numeroFatura,
        estado: faturaAtualizada.estado,
        valor_pago: parseFloat(faturaAtualizada.valorPago?.toString() || '0'),
        recibo_id: reciboId,
        mensagem: 'Recibo emitido com sucesso e fatura marcada como paga'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('❌ Erro ao emitir recibo:', errorMessage);
    console.error('   Stack:', errorStack);
    if (error instanceof Error && 'code' in error) {
      console.error('   Código:', (error as any).code);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao emitir recibo: ' + errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
