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

    return NextResponse.json(serialized);
  } catch (error) {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting servico:', error);
    return NextResponse.json({ error: 'Failed to delete servico' }, { status: 500 });
  }
}
