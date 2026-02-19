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

    return NextResponse.json(serialized);
  } catch (error) {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting categoria servico:', error);
    return NextResponse.json({ error: 'Failed to delete categoria servico' }, { status: 500 });
  }
}
