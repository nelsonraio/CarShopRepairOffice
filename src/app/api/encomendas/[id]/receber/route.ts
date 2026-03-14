import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error']
});
const prismaAny = prisma as any;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const selectedItems: Array<{ id: string; quantity?: number }> =
      body?.items && Array.isArray(body.items) ? body.items : [];

    const encomenda = await prismaAny.encomendas_pecas.findUnique({
      where: { id: BigInt(id) },
      include: { itens: true }
    });

    if (!encomenda) {
      return NextResponse.json({ error: 'Encomenda nao encontrada' }, { status: 404 });
    }

    await prismaAny.$transaction(async (tx: any) => {
      for (const item of encomenda.itens) {
        const totalOrdered = Number(item.quantidade_encomendada) || 0;
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
          await tx.pecas.update({
            where: { id: item.peca_id },
            data: {
              quantidade_stock: {
                increment: qtyToReceive
              }
            }
          });
        }

        await tx.itens_encomenda_peca.update({
          where: { id: item.id },
          data: {
            quantidade_recebida: qtyToReceive,
            estado: 'recebido'
          }
        });
      }

      await tx.encomendas_pecas.update({
        where: { id: BigInt(id) },
        data: {
          estado: 'recebido',
          data_entrega_real: new Date()
        }
      });
    });

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


