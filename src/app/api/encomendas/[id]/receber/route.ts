import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { encomendasPecas, itensEncomendaPeca, pecas } from '@/db/schema';
import { registarAuditoria } from '@/lib/auditoria';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const selectedItems: Array<{ id: string; quantity?: number }> =
      body?.items && Array.isArray(body.items) ? body.items : [];


    // Buscar encomenda e itens
    const [encomenda] = await db.select().from(encomendasPecas).where(eq(encomendasPecas.id, Number(id)));
    if (!encomenda) {
      return NextResponse.json({ error: 'Encomenda nao encontrada' }, { status: 404 });
    }
    const itens = await db.select().from(itensEncomendaPeca).where(eq(itensEncomendaPeca.encomendaId, Number(id)));

    for (const item of itens) {
      const totalOrdered = Number(item.quantidadeEncomendada) || 0;
      let qtyToReceive = totalOrdered;

      if (selectedItems.length > 0) {
        const sel = selectedItems.find((s: any) => String(s.id) === String(item.id));
        if (!sel) {
          // user did not select this part, skip entirely
          continue;
        }
        qtyToReceive = Number(sel.quantity ?? 0);
        if (isNaN(qtyToReceive) || qtyToReceive <= 0) {
          continue;
        }
      }

      // never exceed originally ordered quantity
      if (qtyToReceive > totalOrdered) {
        qtyToReceive = totalOrdered;
      }

      if (qtyToReceive > 0) {
        // Atualizar stock da peça
        await db.update(pecas)
          .set({ quantidade_stock: sql`quantidade_stock + ${qtyToReceive}` })
          .where(eq(pecas.id, Number(item.pecaId)));
      }

      // Atualizar item da encomenda
      await db.update(itensEncomendaPeca)
        .set({ quantidadeRecebida: qtyToReceive, estado: 'recebido' })
        .where(eq(itensEncomendaPeca.id, item.id));
    }

    // Atualizar encomenda para recebida
    await db.update(encomendasPecas)
      .set({ estado: 'recebido', dataEntregaReal: new Date().toISOString().slice(0, 10) })
      .where(eq(encomendasPecas.id, Number(id)));

    await registarAuditoria('UPDATE', 'encomendas_pecas', Number(id), null, { estado: 'recebido' }, request);

    return NextResponse.json({ success: true });
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
    console.error('Error receiving encomenda:', error);
    return NextResponse.json({ error: 'Failed to receive encomenda' }, { status: 500 });
  }
}


