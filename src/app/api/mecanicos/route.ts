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

    const mecanicos = await prisma.mecanicos.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(mecanicos);
  } catch (error) {
    console.error('Error fetching mecanicos:', error);
    return NextResponse.json({ error: 'Failed to fetch mecanicos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const mecanico = await prisma.mecanicos.create({
      data: {
        nome: body.nome,
        especialidade: body.especialidade || null,
        telefone: body.telefone || null,
        email: body.email || null,
        tarifa_horaria: body.tarifa_horaria ? parseFloat(body.tarifa_horaria.toString()) : null,
        data_contratacao: body.data_contratacao ? new Date(body.data_contratacao) : null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(mecanico);
  } catch (error: any) {
    console.error('Error creating mecanico:', error);
    return NextResponse.json({ 
      error: 'Failed to create mecanico',
      details: error.message 
    }, { status: 500 });
  }
}
