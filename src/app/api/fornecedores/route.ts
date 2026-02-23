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

    const fornecedores = await prisma.fornecedores.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(fornecedores);
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
    console.error('Error fetching fornecedores:', error);
    return NextResponse.json({ error: 'Failed to fetch fornecedores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const fornecedor = await prisma.fornecedores.create({
      data: {
        nome: body.nome,
        pessoa_contato: body.pessoa_contato || null,
        email: body.email || null,
        telefone: body.telefone || null,
        nif: body.nif || null,
        endereco: body.endereco || null,
        termos_pagamento: body.termos_pagamento || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(fornecedor);
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
    console.error('Error creating fornecedor:', error);
    return NextResponse.json({ error: 'Failed to create fornecedor' }, { status: 500 });
  }
}


