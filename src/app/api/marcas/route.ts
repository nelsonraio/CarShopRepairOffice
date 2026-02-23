import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const marcas = await prisma.marcas.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(marcas);
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
    console.error('Error fetching marcas:', error);
    return NextResponse.json({ error: 'Failed to fetch marcas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const marca = await prisma.marcas.create({
      data: {
        nome: body.nome,
        pais_origem: body.pais_origem || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(marca);
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
    console.error('Error creating marca:', error);
    return NextResponse.json({ error: 'Failed to create marca' }, { status: 500 });
  }
}


