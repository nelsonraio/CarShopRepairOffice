import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const servicos = await prisma.servicos.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        preco_base: true,
        descricao: true
      },
      orderBy: { nome: 'asc' }
    });

    // Remove duplicates by nome to ensure unique services in the combo box
    const uniqueServicos = servicos.filter((servico, index, self) =>
      index === self.findIndex(s => s.nome === servico.nome)
    );

    // Convert BigInt id to string for JSON serialization
    const serializedServicos = uniqueServicos.map(servico => ({
      id: String(servico.id),
      nome: servico.nome,
      descricao: servico.descricao || ''
    }));

    return NextResponse.json(serializedServicos);
  } catch (error) {
    console.error('Error fetching servicos:', error);
    return NextResponse.json({ error: 'Failed to fetch servicos' }, { status: 500 });
  }
}
