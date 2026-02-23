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

    const query: any = {
      orderBy: { nome: 'asc' }
    };

    if (!all) {
      query.where = { ativo: true };
    }

    const categorias = await prisma.categorias_servico.findMany(query);

    // Serialize BigInt fields
    const serializedCategorias = categorias.map((cat: typeof categorias[number]) => ({
      ...cat,
      id: Number(cat.id)
    }));

    return NextResponse.json(serializedCategorias);
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
    console.error('Error fetching categorias servico:', error);
    return NextResponse.json({ error: 'Failed to fetch categorias servico' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const categoria = await prisma.categorias_servico.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        duracao_estimada: body.duracao_estimada || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    // Serialize BigInt fields
    const serialized = {
      ...categoria,
      id: Number(categoria.id)
    };

    return NextResponse.json(serialized);
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
    console.error('Error creating categoria servico:', error);
    return NextResponse.json({ error: 'Failed to create categoria servico' }, { status: 500 });
  }
}


