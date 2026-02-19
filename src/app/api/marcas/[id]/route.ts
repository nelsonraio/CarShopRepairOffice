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

    const marca = await prisma.marcas.update({
      where: { id },
      data: {
        nome: body.nome,
        pais_origem: body.pais_origem || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(marca);
  } catch (error) {
    console.error('Error updating marca:', error);
    return NextResponse.json({ error: 'Failed to update marca' }, { status: 500 });
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

    const marca = await prisma.marcas.update({
      where: { id },
      data: body
    });

    return NextResponse.json(marca);
  } catch (error) {
    console.error('Error patching marca:', error);
    return NextResponse.json({ error: 'Failed to patch marca' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.marcas.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting marca:', error);
    return NextResponse.json({ error: 'Failed to delete marca' }, { status: 500 });
  }
}
