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

    const modelo = await prisma.modelos.update({
      where: { id },
      data: {
        marca_id: parseInt(body.marca_id),
        nome: body.nome,
        tipo_veiculo: body.tipo_veiculo || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      },
      include: {
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return NextResponse.json(modelo);
  } catch (error) {
    console.error('Error updating modelo:', error);
    return NextResponse.json({ error: 'Failed to update modelo' }, { status: 500 });
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

    const modelo = await prisma.modelos.update({
      where: { id },
      data: body,
      include: {
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return NextResponse.json(modelo);
  } catch (error) {
    console.error('Error patching modelo:', error);
    return NextResponse.json({ error: 'Failed to patch modelo' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.modelos.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting modelo:', error);
    return NextResponse.json({ error: 'Failed to delete modelo' }, { status: 500 });
  }
}
