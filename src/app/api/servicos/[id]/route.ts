import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

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

    const servico = await prisma.servicos.update({
      where: { id: BigInt(id) },
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

    await registarAuditoria('UPDATE', 'servicos', id, null, { nome: body.nome, preco_base: body.preco_base }, request);

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
    console.error('Error updating servico:', error);
    return NextResponse.json({ error: 'Failed to update servico' }, { status: 500 });
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

    const servico = await prisma.servicos.update({
      where: { id: BigInt(id) },
      data: body
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
    console.error('Error patching servico:', error);
    return NextResponse.json({ error: 'Failed to patch servico' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.servicos.delete({
      where: { id: BigInt(id) }
    });

    await registarAuditoria('DELETE', 'servicos', id, null, null, request);

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
    console.error('Error deleting servico:', error);
    return NextResponse.json({ error: 'Failed to delete servico' }, { status: 500 });
  }
}


