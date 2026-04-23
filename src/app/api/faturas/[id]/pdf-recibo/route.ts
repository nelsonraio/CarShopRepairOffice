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

    console.log('📄 Buscando PDF do recibo:', id);
    console.log('   Token (primeiros 20):', token.substring(0, 20) + '...');


    // Buscar fatura para obter o reciboToconlineId
    const faturaArr = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    const fatura = faturaArr[0];

    if (!fatura) {
      return NextResponse.json(
        { success: false, error: 'Fatura não encontrada' },
        { status: 404 }
      );
    }

    if (!fatura.reciboToconlineId) {
      return NextResponse.json(
        { success: false, error: 'Recibo não emitido. Primeiro emita o recibo antes de tentar obter o PDF.' },
        { status: 400 }
      );
    }

    // Sincronizar numeroFatura local com TOConline quando houver vínculo
    if (fatura.toconlineId) {
      try {
        const documentoRes = await fetch(`${BASE_URL}/api/v1/commercial_sales_documents/${fatura.toconlineId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const documentoData = await documentoRes.json();
        const numeroFaturaToconline =
          documentoData?.data?.attributes?.document_number ||
          documentoData?.attributes?.document_number ||
          null;

        if (documentoRes.ok && numeroFaturaToconline && numeroFaturaToconline !== fatura.numeroFatura) {
          await db.update(faturas)
            .set({ numeroFatura: numeroFaturaToconline, atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ') })
            .where(eq(faturas.id, Number(id)));
          console.log('🔄 Numero fatura local sincronizado:', numeroFaturaToconline);
        }
      } catch (syncError) {
        console.warn('⚠️ Erro ao sincronizar numero_fatura em pdf-recibo:', syncError);
      }
    }

    console.log('   Recibo ID a procurar:', fatura.reciboToconlineId);

    // Tentar obter PDF com diferentes filtros (Document e Receipt)
    let lastPdfData: any = null;
    for (const filterType of ['Document', 'Receipt']) {
      console.log(`📡 Tentando obter PDF do recibo com filter[type]=${filterType}...`);
      
      const pdfRes = await fetch(`${BASE_URL}/api/url_for_print/${fatura.reciboToconlineId}?filter[type]=${filterType}`, {
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
        console.warn(`⚠️ Resposta PDF TOConline (${filterType}) não é JSON:`, pdfRawText.substring(0, 300));
        continue;
      }
      lastPdfData = pdfData;
      console.log(`📡 Resposta TOConline PDF Recibo (${filterType}):`, JSON.stringify(pdfData, null, 2));

      if (pdfRes.ok && (pdfData as Record<string, unknown> & { data?: { attributes?: { url?: unknown } } })?.data?.attributes?.url) {
        type PdfResponse = { data?: { attributes?: { url?: unknown } } };
        const typedPdf = pdfData as PdfResponse;
        const urlObj = typedPdf.data!.attributes!.url;
        
        // Construir URL a partir do objeto (scheme, host, port, path)
        let pdfUrl: string;
        if (typeof urlObj === 'string') {
          // Se já for string, usar direto
          pdfUrl = urlObj;
        } else if (urlObj && typeof urlObj === 'object') {
          // Se for objeto, construir a partir dos componentes
          const typedUrlObj = urlObj as { scheme?: string; host?: string; port?: number; path?: string };
          const scheme = typedUrlObj.scheme || 'https';
          const host = typedUrlObj.host || '';
          const port = typedUrlObj.port || 443;
          const path = typedUrlObj.path || '';
          
          // Adicionar porta apenas se não for 80 (HTTP) ou 443 (HTTPS)
          const portStr = (scheme === 'https' && port === 443) || (scheme === 'http' && port === 80) 
            ? '' 
            : `:${port}`;
          
          pdfUrl = `${scheme}://${host}${portStr}${path}`;
        } else {
          throw new Error('URL format inválido');
        }
        
        console.log('✅ URL do PDF obtido com sucesso (tipo:', filterType + ')');
        console.log('   URL construída:', pdfUrl);
        
        return NextResponse.json({
          success: true,
          pdfUrl: pdfUrl,
          recibo_id: fatura.reciboToconlineId
        });
      }
    }

    // Se chegou aqui, nenhum dos filtros funcionou
    return NextResponse.json(
      { 
        success: false, 
        error: 'Resposta inválida do TOConline - URL do PDF não encontrado',
        details: lastPdfData 
      },
      { status: 500 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Erro ao obter PDF do recibo:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao obter PDF do recibo: ' + errorMessage 
      },
      { status: 500 }
    );
  }
}
