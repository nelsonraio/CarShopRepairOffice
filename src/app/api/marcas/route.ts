import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const marcas = await prisma.marcas.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        pais_origem: true
      },
      orderBy: { nome: 'asc' }
    });

    // Convert BigInt id to string for JSON serialization
    const serializedMarcas = marcas.map(marca => ({
      id: String(marca.id),
      nome: marca.nome,
      pais_origem: marca.pais_origem
    }));

    return NextResponse.json(serializedMarcas);
  } catch (error) {
    console.error('Error fetching marcas:', error);
    return NextResponse.json({ error: 'Failed to fetch marcas' }, { status: 500 });
  }
}
