import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();
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

    // Buscar fatura para obter o toconline_id
    const fatura = await prisma.faturas.findUnique({
      where: { id: BigInt(id) }
    });

    if (!fatura) {
      return NextResponse.json(
        { success: false, error: 'Fatura não encontrada' },
        { status: 404 }
      );
    }

    if (!fatura.toconline_id) {
      return NextResponse.json(
        { success: false, error: 'Fatura não possui ID do TOConline. Apenas faturas criadas via TOConline têm PDF disponível.' },
        { status: 400 }
      );
    }

    // Buscar URL do PDF no TOConline
    const pdfRes = await fetch(`${BASE_URL}/api/url_for_print/${fatura.toconline_id}?filter[type]=Document`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const pdfData = await pdfRes.json();
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

    // Extrair URL do PDF
    if (!pdfData.data || !pdfData.data.attributes || !pdfData.data.attributes.url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Resposta inválida do TOConline - URL do PDF não encontrado',
          details: pdfData 
        },
        { status: 500 }
      );
    }

    const urlObj = pdfData.data.attributes.url;
    let pdfUrl: string;

    if (typeof urlObj === 'string') {
      pdfUrl = urlObj;
    } else if (typeof urlObj === 'object') {
      const scheme = urlObj.scheme || 'https';
      const host = urlObj.host || '';
      const port = urlObj.port || 443;
      const path = urlObj.path || '';
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
      toconline_id: fatura.toconline_id
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
