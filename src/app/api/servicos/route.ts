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

    const servicos = await prisma.servicos.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    // Serialize BigInt fields
    const serializedServicos = servicos.map((serv: typeof servicos[number]) => ({
      ...serv,
      id: Number(serv.id)
    }));

    return NextResponse.json(serializedServicos);
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
    console.error('Error fetching servicos:', error);
    return NextResponse.json({ error: 'Failed to fetch servicos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const servico = await prisma.servicos.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        preco_base: body.preco_base ? parseFloat(body.preco_base.toString()) : null,
        duracao_estimada: body.duracao_estimada || null,
        requer_pecas: body.requer_pecas !== undefined ? body.requer_pecas : false,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    // Serialize BigInt fields
    const serialized = {
      ...servico,
      id: Number(servico.id)
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
    console.error('Error creating servico:', error);
    return NextResponse.json({ error: 'Failed to create servico' }, { status: 500 });
  }
}


