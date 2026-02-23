import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const fornecedor = await prisma.fornecedores.update({
      where: { id },
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
    console.error('Error updating fornecedor:', error);
    return NextResponse.json({ error: 'Failed to update fornecedor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const fornecedor = await prisma.fornecedores.update({
      where: { id },
      data: body
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
    console.error('Error patching fornecedor:', error);
    return NextResponse.json({ error: 'Failed to patch fornecedor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.fornecedores.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
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
    console.error('Error deleting fornecedor:', error);
    return NextResponse.json({ error: 'Failed to delete fornecedor' }, { status: 500 });
  }
}


