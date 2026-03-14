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

    const categoria = await prisma.categorias_servico.update({
      where: { id: BigInt(id) },
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        duracao_estimada: body.duracao_estimada || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    // Serialize BigInt fields
    const serialized = {
      ...categoria,
      id: Number(categoria.id)
    };

    await registarAuditoria('UPDATE', 'categorias_servico', id, null, { nome: body.nome }, request);

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
    console.error('Error updating categoria servico:', error);
    return NextResponse.json({ error: 'Failed to update categoria servico' }, { status: 500 });
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

    const categoria = await prisma.categorias_servico.update({
      where: { id: BigInt(id) },
      data: body
    });

    // Serialize BigInt fields
    const serialized = {
      ...categoria,
      id: Number(categoria.id)
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
    console.error('Error patching categoria servico:', error);
    return NextResponse.json({ error: 'Failed to patch categoria servico' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.categorias_servico.delete({
      where: { id: BigInt(id) }
    });

    await registarAuditoria('DELETE', 'categorias_servico', id, null, null, request);

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
    console.error('Error deleting categoria servico:', error);
    return NextResponse.json({ error: 'Failed to delete categoria servico' }, { status: 500 });
  }
}


