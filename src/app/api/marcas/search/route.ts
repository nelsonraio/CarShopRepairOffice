import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const marcas = await prisma.marcas.findMany({
      where: {
        AND: [
          { ativo: true },
          { nome: { contains: query } }
        ]
      },
      select: {
        id: true,
        nome: true,
        pais_origem: true
      },
      orderBy: { nome: 'asc' },
      take: 10
    });

    // Convert BigInt id to string for JSON serialization
    const serializedMarcas = marcas.map((marca: any) => ({
      id: String(marca.id),
      nome: marca.nome,
      pais_origem: marca.pais_origem
    }));

    return NextResponse.json(serializedMarcas);
  } catch (error) {
    console.error('Error searching marcas:', error);
    return NextResponse.json({ error: 'Failed to search marcas' }, { status: 500 });
  }
}
