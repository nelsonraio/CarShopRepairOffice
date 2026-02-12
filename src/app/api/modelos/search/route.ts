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
    const marcaId = url.searchParams.get('marca_id');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const whereClause: any = {
      AND: [
        { ativo: true },
        { nome: { contains: query } }
      ]
    };

    if (marcaId) {
      whereClause.AND.push({ marca_id: BigInt(marcaId) });
    }

    const modelos = await prisma.modelos.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        marca_id: true
      },
      orderBy: { nome: 'asc' },
      take: 10
    });

    // Convert BigInt id to string for JSON serialization
    const serializedModelos = modelos.map((modelo: any) => ({
      id: String(modelo.id),
      nome: modelo.nome,
      marca_id: String(modelo.marca_id)
    }));

    return NextResponse.json(serializedModelos);
  } catch (error) {
    console.error('Error searching modelos:', error);
    return NextResponse.json({ error: 'Failed to search modelos' }, { status: 500 });
  }
}
