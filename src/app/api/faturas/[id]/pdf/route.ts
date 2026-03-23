import { db } from '@/db/connection';
import { faturas, clientes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import path from 'path';


export const runtime = 'nodejs';

const FONT_REGULAR =
  process.platform === 'win32'
    ? 'C:\\Windows\\Fonts\\arial.ttf'
    : process.platform === 'darwin'
      ? '/System/Library/Fonts/Supplemental/Arial.ttf'
      : '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

const FONT_BOLD =
  process.platform === 'win32'
    ? 'C:\\Windows\\Fonts\\arialbd.ttf'
    : process.platform === 'darwin'
      ? '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
      : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

// Simula API da TOQ Online - Gerar PDF da Fatura
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    

    // Obter fatura com dados do cliente
    const [fatura] = await db.select().from(faturas).where(eq(faturas.id, Number(id)));
    if (!fatura) {
      return NextResponse.json(
        { success: false, error: 'Fatura não encontrada' },
        { status: 404 }
      );
    }
    // Obter dados do cliente
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, fatura.clienteId));

    // Criar PDF
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
      font: FONT_REGULAR
    });

    // Cabeçalho
    doc.fontSize(24).font(FONT_BOLD).text('FATURA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font(FONT_REGULAR).text(fatura.numeroFatura, { align: 'center' });
    
    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Informações da empresa (simulado)
    doc.fontSize(12).font(FONT_BOLD).text('Car Shop Repair Office', { width: 250 });
    doc.fontSize(9).font(FONT_REGULAR)
      .text('Rua da Oficina, 123', { width: 250 })
      .text('1000-001 Lisboa, Portugal', { width: 250 })
      .text('Tel: +351 21 1234567', { width: 250 })
      .text('Email: info@carshop.pt', { width: 250 })
      .text('NIF: 123456789', { width: 250 });

    // Informações do cliente (lado direito)
    const rightX = 350;
    doc.fontSize(11).font(FONT_BOLD).text('CLIENTE:', rightX, 80);
    doc.fontSize(10).font(FONT_REGULAR)
      .text(cliente?.nome || 'Cliente', rightX, 100)
      .text(`NIF: ${cliente?.nif || 'N/A'}`, rightX)
      .text(`Tel: ${cliente?.telefone || 'N/A'}`, rightX)
      .text(`Email: ${cliente?.email || 'N/A'}`, rightX);

    // Datas
    const dataEmissao = fatura.dataEmissao ? new Date(fatura.dataEmissao).toLocaleDateString('pt-PT') : 'N/A';
    const dataVencimento = fatura.dataVencimento ? new Date(fatura.dataVencimento).toLocaleDateString('pt-PT') : 'N/A';
    
    doc.fontSize(10).font(FONT_REGULAR);
    doc.text(`Data de Emissão: ${dataEmissao}`, rightX, 165);
    doc.text(`Data de Vencimento: ${dataVencimento}`, rightX, 185);
    doc.text(`Estado: ${fatura.estado?.toUpperCase()}`, rightX, 205);

    doc.moveDown(3);

    // Tabela de itens
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 300;
    const col3 = 450;
    const col4 = 520;
    const rowHeight = 25;

    // Cabeçalho da tabela
    doc.fontSize(10).font(FONT_BOLD);
    doc.text('Descrição', col1, tableTop);
    doc.text('Quantidade', col2, tableTop);
    doc.text('Valor Unit.', col3, tableTop);
    doc.text('Total', col4, tableTop);

    // Linha separadora
    doc.moveTo(col1, tableTop + rowHeight - 5).lineTo(550, tableTop + rowHeight - 5).stroke();

    // Dado fictício (em um caso real, viria de itens da fatura)
    doc.fontSize(9).font(FONT_REGULAR);
    let currentY = tableTop + rowHeight + 5;

    doc.text('Serviços técnicos gerais', col1, currentY);
    doc.text('1', col2, currentY);
    doc.text(`€${parseFloat(fatura.subtotal.toString()).toFixed(2)}`, col3, currentY, { width: 80, align: 'right' });
    doc.text(`€${parseFloat(fatura.subtotal.toString()).toFixed(2)}`, col4, currentY, { width: 30, align: 'right' });

    currentY += rowHeight + 10;

    // Seção de totais (lado direito)
    const totalX = 400;
    const totalColWidth = 100;

    doc.moveTo(totalX - 10, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    doc.fontSize(9).font(FONT_REGULAR)
      .text('Subtotal:', totalX, currentY, { width: 80 })
      .text(`€${parseFloat(fatura.subtotal.toString()).toFixed(2)}`, totalX + 80, currentY, { width: 60, align: 'right' });

    currentY += 20;
    doc.text('Imposto (IVA):', totalX, currentY, { width: 80 })
      .text(`€${parseFloat(fatura.valorImposto?.toString() || '0').toFixed(2)}`, totalX + 80, currentY, { width: 60, align: 'right' });

    currentY += 20;
    doc.text('Desconto:', totalX, currentY, { width: 80 })
      .text(`€${parseFloat(fatura.valorDesconto?.toString() || '0').toFixed(2)}`, totalX + 80, currentY, { width: 60, align: 'right' });

    currentY += 25;
    doc.fontSize(11).font(FONT_BOLD)
      .moveTo(totalX - 10, currentY - 5).lineTo(550, currentY - 5).stroke()
      .text('TOTAL:', totalX, currentY, { width: 80 })
      .fontSize(12)
      .text(`€${parseFloat(fatura.valorTotal.toString()).toFixed(2)}`, totalX + 80, currentY, { width: 60, align: 'right' });

    // Rodapé
    currentY += 50;
    if (fatura.notas) {
      doc.fontSize(9).font(FONT_REGULAR).text('Observações:', 50, currentY);
      doc.fontSize(8).font(FONT_REGULAR).text(fatura.notas, 50, currentY + 20, { width: 500 });
    }

    // Última linha
    doc.fontSize(8).font(FONT_REGULAR).text('Obrigado pela sua confiança!', 50, 750, { align: 'center' });

    // Bufferizar o PDF
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve());
      doc.on('error', reject);
      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);

    // Retornar como PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fatura.numeroFatura}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
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
    console.error('Erro ao gerar PDF:', error);
    const details =
      process.env.NODE_ENV !== 'production'
        ? {
            message: error instanceof Error ? error.message : String(error),
            cwd: process.cwd(),
            initCwd: process.env.INIT_CWD,
            fontRegular: FONT_REGULAR,
            fontBold: FONT_BOLD,
            moduleUrl: import.meta.url
          }
        : undefined;
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar PDF', details },
      { status: 500 }
    );
  }
}


