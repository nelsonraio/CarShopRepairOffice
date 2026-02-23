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

    const servicos = await prisma.servicos.findMany({
      where: {
        AND: [
          { ativo: true },
          { nome: { contains: query } }
        ]
      },
      select: {
        id: true,
        nome: true,
        preco_base: true
      },
      orderBy: { nome: 'asc' },
      take: 10
    });

    // Convert BigInt id to string for JSON serialization
    const serializedServicos = servicos.map((servico: typeof servicos[number]) => ({
      id: String(servico.id),
      nome: servico.nome,
      preco_base: servico.preco_base ? servico.preco_base.toNumber() : 0
    }));

    return NextResponse.json(serializedServicos);
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
    console.error('Error searching servicos:', error);
    return NextResponse.json({ error: 'Failed to search servicos' }, { status: 500 });
  }
}


