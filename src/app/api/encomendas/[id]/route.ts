import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error']
});
const prismaAny = prisma as any;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { estado } = body;

    if (!estado) {
      return NextResponse.json({ error: 'Estado obrigatorio' }, { status: 400 });
    }

    const updated = await prismaAny.encomendas_pecas.update({
      where: { id: BigInt(id) },
      data: { estado }
    });

    return NextResponse.json({
      id: String(updated.id),
      estado: updated.estado
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
    console.error('Error updating encomenda:', error);
    return NextResponse.json({ error: 'Failed to update encomenda' }, { status: 500 });
  }
}


