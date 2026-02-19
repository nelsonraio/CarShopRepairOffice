import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    const perfil = await prisma.perfis_clientes.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        perclucro: body.perclucro ? parseFloat(body.perclucro.toString()) : 0,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(perfil);
  } catch (error) {
    console.error('Error updating perfil:', error);
    return NextResponse.json({ error: 'Failed to update perfil' }, { status: 500 });
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

    const perfil = await prisma.perfis_clientes.update({
      where: { id },
      data: body
    });

    return NextResponse.json(perfil);
  } catch (error) {
    console.error('Error patching perfil:', error);
    return NextResponse.json({ error: 'Failed to patch perfil' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.perfis_clientes.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting perfil:', error);
    return NextResponse.json({ error: 'Failed to delete perfil' }, { status: 500 });
  }
}
