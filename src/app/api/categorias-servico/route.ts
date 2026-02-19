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

    const query: Parameters<typeof prisma.categorias_servico.findMany>[0] = {
      orderBy: { nome: 'asc' }
    };

    if (!all) {
      query.where = { ativo: true };
    }

    const categorias = await prisma.categorias_servico.findMany(query);

    // Serialize BigInt fields
    const serializedCategorias = categorias.map(cat => ({
      ...cat,
      id: Number(cat.id)
    }));

    return NextResponse.json(serializedCategorias);
  } catch (error) {
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
    console.error('Error creating categoria servico:', error);
    return NextResponse.json({ error: 'Failed to create categoria servico' }, { status: 500 });
  }
}
