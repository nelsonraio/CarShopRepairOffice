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

    const clientes = await prisma.clientes.findMany({
      where: {
        AND: [
          { ativo: true },
          {
            OR: [
              { nome: { contains: query } },
              { telefone: { contains: query } },
              { email: { contains: query } }
            ]
          }
        ]
      },
      include: { perfil_cliente: true },
      orderBy: { nome: 'asc' },
      take: 10
    });

    const result = clientes.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      nif: cliente.nif,
      endereco: cliente.endereco,
      perfil_id: cliente.perfil_id || null,
      perfil: cliente.perfil_cliente ? cliente.perfil_cliente.nome : 'Normal'
    }));

    return NextResponse.json(result);
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
    console.error('Error searching clientes:', error);
    return NextResponse.json({ error: 'Failed to search clientes' }, { status: 500 });
  }
}


