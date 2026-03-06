import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se utilizador existe
    const utilizador = await prisma.utilizadores.findUnique({
      where: { id: userId },
    });

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Alternar status
    const atualizado = await prisma.utilizadores.update({
      where: { id: userId },
      data: {
        ativo: !utilizador.ativo,
      },
      select: {
        id: true,
        nome_utilizador: true,
        email: true,
        nome_completo: true,
        papel: true,
        ativo: true,
        criado_em: true,
      },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error('Erro ao alternar status:', error);
    return NextResponse.json({ error: 'Erro ao alternar status' }, { status: 500 });
  }
}
