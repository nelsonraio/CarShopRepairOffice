import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    // Fetch all unique categories from pecas table
    const pecas = await prisma.pecas.findMany({
      select: { categoria: true },
      where: { ativo: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' }
    });

    const categorias = pecas
      .map(p => p.categoria)
      .filter(c => c && c.trim() !== '') // Remove null and empty values
      .sort();

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
