import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const pecas = await prisma.pecas.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        preco_venda: true
      },
      orderBy: { nome: 'asc' }
    });

    // Remove duplicates by nome to ensure unique parts in the combo box
    const uniquePecas = pecas.filter((peca, index, self) =>
      index === self.findIndex(p => p.nome === peca.nome)
    );

    // Convert BigInt id to string for JSON serialization
    const serializedPecas = uniquePecas.map(peca => ({
      id: String(peca.id),
      nome: peca.nome,
      preco_venda: peca.preco_venda
    }));

    return NextResponse.json(serializedPecas);
  } catch (error) {
    console.error('Error fetching pecas:', error);
    return NextResponse.json({ error: 'Failed to fetch pecas' }, { status: 500 });
  }
}
