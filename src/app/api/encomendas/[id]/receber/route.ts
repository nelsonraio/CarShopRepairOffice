import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    const encomenda = await prismaAny.encomendas_pecas.findUnique({
      where: { id: BigInt(id) },
      include: { itens: true }
    });

    if (!encomenda) {
      return NextResponse.json({ error: 'Encomenda nao encontrada' }, { status: 404 });
    }

    await prismaAny.$transaction(async (tx: any) => {
      for (const item of encomenda.itens) {
        const quantidade = Number(item.quantidade_encomendada) || 0;
        if (quantidade > 0) {
          await tx.pecas.update({
            where: { id: item.peca_id },
            data: {
              quantidade_stock: {
                increment: quantidade
              }
            }
          });
        }

        await tx.itens_encomenda_peca.update({
          where: { id: item.id },
          data: {
            quantidade_recebida: quantidade,
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


