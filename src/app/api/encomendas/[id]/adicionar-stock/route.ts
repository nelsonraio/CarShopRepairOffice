import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { encomendasPecas, itensEncomendaPeca, pecas } from '@/db/schema';
import { registarAuditoria } from '@/lib/auditoria';
import { eq, sql } from 'drizzle-orm';

/**
 * API endpoint to add items to stock from an already received order
 * This is used when the order is already marked as "recebido" but we want to
 * add remaining quantities to the stock
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    
    const selectedItems: Array<{ id: string; quantity?: number }> =
      body?.items && Array.isArray(body.items) ? body.items : [];

    if (selectedItems.length === 0) {
      return NextResponse.json({ error: 'Nenhum item selecionado' }, { status: 400 });
    }


    // Buscar encomenda e itens
    const encomenda = await db.query.encomendasPecas.findFirst({
      where: eq(encomendasPecas.id, Number(id)),
    });
    if (!encomenda) {
      return NextResponse.json({ error: 'Encomenda não encontrada' }, { status: 404 });
    }
    if (encomenda.estado !== 'recebido') {
      return NextResponse.json({
        error: 'A encomenda deve estar marcada como recebida para adicionar itens ao stock'
      }, { status: 400 });
    }

    // Buscar itens da encomenda
    const itens = await db.select().from(itensEncomendaPeca).where(eq(itensEncomendaPeca.encomendaId, encomenda.id));

    let itemsAdded = 0;

    // Transação para atualizar stock e itens
    await db.transaction(async (tx) => {
      for (const sel of selectedItems) {
        const item = itens.find((i) => String(i.id) === String(sel.id));
        if (!item) continue;

        const totalOrdered = Number(item.quantidadeEncomendada) || 0;
        const alreadyReceived = Number(item.quantidadeRecebida) || 0;
        const remaining = totalOrdered - alreadyReceived;

        let qtyToAdd = Number(sel.quantity ?? 0);
        if (isNaN(qtyToAdd) || qtyToAdd <= 0) continue;
        if (qtyToAdd > remaining) qtyToAdd = remaining;
        if (qtyToAdd > 0) {
          // Atualizar stock da peça
          await tx.update(pecas)
            .set({ quantidade_stock: sql`${pecas.quantidade_stock} + ${qtyToAdd}` })
            .where(eq(pecas.id, Number(item.pecaId)));

          // Atualizar item da encomenda
          await tx.update(itensEncomendaPeca)
            .set({ quantidadeRecebida: alreadyReceived + qtyToAdd, estado: 'recebido' })
            .where(eq(itensEncomendaPeca.id, item.id));

          itemsAdded += qtyToAdd;
        }
      }
    });

    await registarAuditoria('UPDATE', 'encomendas_pecas', Number(id), null, { acao: 'adicionar_stock', itemsAdded }, request);

    return NextResponse.json({ 
      success: true, 
      itemsAdded 
    });
  } catch (error) {
    console.error('Error adding to stock:', error);
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
    return NextResponse.json({ error: 'Failed to add items to stock', details: errorMessage }, { status: 500 });
  }
}
