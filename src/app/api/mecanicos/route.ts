import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const mecanicos = await prisma.mecanicos.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: { nome: 'asc' }
    });

    // Convert BigInt id to string for JSON serialization
    const serializedMecanicos = mecanicos.map(mecanico => ({
      id: String(mecanico.id),
      nome: mecanico.nome
    }));

    return NextResponse.json(serializedMecanicos);
  } catch (error) {
    console.error('Error fetching mecanicos:', error);
    return NextResponse.json({ error: 'Failed to fetch mecanicos' }, { status: 500 });
  }
}
