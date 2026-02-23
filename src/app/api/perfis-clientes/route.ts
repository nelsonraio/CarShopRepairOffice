import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const perfis = await prisma.perfis_clientes.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(perfis);
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
    console.error('Error fetching perfis clientes:', error);
    return NextResponse.json({ error: 'Failed to fetch perfis clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const perfil = await prisma.perfis_clientes.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        perclucro: body.perclucro ? parseFloat(body.perclucro.toString()) : 0,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(perfil);
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
    console.error('Error creating perfil:', error);
    return NextResponse.json({ error: 'Failed to create perfil' }, { status: 500 });
  }
}


