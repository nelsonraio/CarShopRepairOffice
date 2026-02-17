import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const fornecedores = await prisma.fornecedores.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: { nome: 'asc' }
    });

    // Convert BigInt id to string for JSON serialization
    const serializedFornecedores = fornecedores.map(fornecedor => ({
      id: String(fornecedor.id),
      nome: fornecedor.nome
    }));

    return NextResponse.json(serializedFornecedores);
  } catch (error) {
    console.error('Error fetching fornecedores:', error);
    return NextResponse.json({ error: 'Failed to fetch fornecedores' }, { status: 500 });
  }
}
