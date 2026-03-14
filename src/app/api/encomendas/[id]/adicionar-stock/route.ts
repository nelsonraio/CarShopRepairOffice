import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error']
});
const prismaAny = prisma as any;

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

    const bigIntId = BigInt(id);

    const encomenda = await prismaAny.encomendas_pecas.findUnique({
      where: { id: bigIntId },
      include: { itens: true }
    });

    if (!encomenda) {
      return NextResponse.json({ error: 'Encomenda não encontrada' }, { status: 404 });
    }

    // Verify the order is already received
    if (encomenda.estado !== 'recebido') {
      return NextResponse.json({ 
        error: 'A encomenda deve estar marcada como recebida para adicionar itens ao stock' 
      }, { status: 400 });
    }

    let itemsAdded = 0;

    await prismaAny.$transaction(async (tx: any) => {
      for (const sel of selectedItems) {
        const item = encomenda.itens.find((i: any) => String(i.id) === String(sel.id));
        if (!item) {
          continue;
        }

        const totalOrdered = Number(item.quantidade_encomendada) || 0;
        const alreadyReceived = Number(item.quantidade_recebida) || 0;
        const remaining = totalOrdered - alreadyReceived;

        let qtyToAdd = Number(sel.quantity ?? 0);
        if (isNaN(qtyToAdd) || qtyToAdd <= 0) continue;

        // Never exceed remaining quantity
        if (qtyToAdd > remaining) {
          qtyToAdd = remaining;
        }

        if (qtyToAdd > 0) {
          // Add to stock
          await tx.pecas.update({
            where: { id: item.peca_id },
            data: {
              quantidade_stock: {
                increment: qtyToAdd
              }
            }
          });

          // Update received quantity
          await tx.itens_encomenda_peca.update({
            where: { id: item.id },
            data: {
              quantidade_recebida: alreadyReceived + qtyToAdd,
              estado: 'recebido'
            }
          });

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
