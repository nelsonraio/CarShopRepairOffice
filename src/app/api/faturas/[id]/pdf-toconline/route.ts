import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { faturas } from '@/db/schema';
import { eq } from 'drizzle-orm';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api7.toconline.pt';

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

    console.log('📄 Buscando PDF da fatura:', id);
    console.log('   Token (primeiros 20):', token.substring(0, 20) + '...');


    // Buscar fatura para obter o toconlineId
    const faturaArr = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    const fatura = faturaArr[0];

    if (!fatura) {
      return NextResponse.json(
        { success: false, error: 'Fatura não encontrada' },
        { status: 404 }
      );
    }

    if (!fatura.toconlineId) {
      return NextResponse.json(
        { success: false, error: 'Fatura não possui ID do TOConline. Apenas faturas criadas via TOConline têm PDF disponível.' },
        { status: 400 }
      );
    }

    // Buscar URL do PDF no TOConline
    const pdfRes = await fetch(`${BASE_URL}/api/url_for_print/${fatura.toconlineId}?filter[type]=Document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const pdfRawText = await pdfRes.text();
    let pdfData: Record<string, unknown> = {};
    try {
      pdfData = JSON.parse(pdfRawText);
    } catch {
      console.error('❌ Resposta PDF TOConline não é JSON:', pdfRawText.substring(0, 500));
      return NextResponse.json(
        { success: false, error: `Resposta inválida do TOConline (HTTP ${pdfRes.status})`, details: pdfRawText.substring(0, 500) },
        { status: 502 }
      );
    }
    console.log('📡 Resposta TOConline PDF:', JSON.stringify(pdfData, null, 2));

    if (!pdfRes.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao obter PDF do TOConline',
          details: pdfData 
        },
        { status: pdfRes.status }
      );
    }

    type PdfResponse = { data?: { attributes?: { url?: unknown } } };
    const typedPdf = pdfData as PdfResponse;

    // Extrair URL do PDF
    if (!typedPdf.data || !typedPdf.data.attributes || !typedPdf.data.attributes.url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Resposta inválida do TOConline - URL do PDF não encontrado',
          details: pdfData 
        },
        { status: 500 }
      );
    }

    const urlObj = typedPdf.data.attributes.url;
    let pdfUrl: string;

    if (typeof urlObj === 'string') {
      pdfUrl = urlObj;
    } else if (urlObj && typeof urlObj === 'object') {
      const typedUrlObj = urlObj as { scheme?: string; host?: string; port?: number; path?: string };
      const scheme = typedUrlObj.scheme || 'https';
      const host = typedUrlObj.host || '';
      const port = typedUrlObj.port || 443;
      const path = typedUrlObj.path || '';
      const portStr = (scheme === 'https' && port === 443) || (scheme === 'http' && port === 80)
        ? ''
        : `:${port}`;
      pdfUrl = `${scheme}://${host}${portStr}${path}`;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato inválido de URL recebido do TOConline',
          details: pdfData
        },
        { status: 500 }
      );
    }

    console.log('✅ URL da fatura construída:', pdfUrl);

    return NextResponse.json({
      success: true,
      pdfUrl: pdfUrl,
      toconline_id: fatura.toconlineId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Erro ao obter PDF:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao obter PDF: ' + errorMessage 
      },
      { status: 500 }
    );
  }
}
