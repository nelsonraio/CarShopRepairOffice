import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const perfis = await prisma.perfis_clientes.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });

    // Transform to match frontend format
    const transformedPerfis = perfis.map((perfil) => ({
      id: perfil.id.toString(),
      nome: perfil.nome,
      descricao: perfil.descricao,
      desconto: Number(perfil.desconto),
      ativo: perfil.ativo
    }));

    return NextResponse.json(transformedPerfis);
  } catch (error) {
    console.error('Error fetching perfis clientes:', error);
    return NextResponse.json({ error: 'Failed to fetch perfis clientes' }, { status: 500 });
  }
}
