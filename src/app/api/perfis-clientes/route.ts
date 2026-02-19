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
    console.error('Error creating perfil:', error);
    return NextResponse.json({ error: 'Failed to create perfil' }, { status: 500 });
  }
}
