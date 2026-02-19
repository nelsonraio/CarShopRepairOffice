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
    console.error('Error updating encomenda:', error);
    return NextResponse.json({ error: 'Failed to update encomenda' }, { status: 500 });
  }
}
