import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const utilizador = await prisma.utilizadores.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome_utilizador: true,
        email: true,
        nome_completo: true,
        papel: true,
        ativo: true,
        ultimo_login: true,
        criado_em: true,
      },
    });

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(utilizador);
  } catch (error) {
    console.error('Erro ao buscar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao buscar utilizador' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { email, nome_completo, papel } = body;

    // Validar campos
    if (!email || !nome_completo || !papel) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta' },
        { status: 400 }
      );
    }

    // Validar papéis
    const papeisValidos = ['admin', 'gestor', 'mecanico', 'rececionista'];
    if (!papeisValidos.includes(papel)) {
      return NextResponse.json(
        { error: 'Papel inválido' },
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

    // Verificar se email já existe (em outro utilizador)
    if (email !== utilizador.email) {
      const emailExistente = await prisma.utilizadores.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (emailExistente) {
        return NextResponse.json(
          { error: 'Email já existe' },
          { status: 409 }
        );
      }
    }

    // Atualizar utilizador
    const atualizado = await prisma.utilizadores.update({
      where: { id: userId },
      data: {
        email,
        nome_completo,
        papel: papel as any,
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
    console.error('Erro ao atualizar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao atualizar utilizador' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

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

    // Eliminar utilizador
    await prisma.utilizadores.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao eliminar utilizador' }, { status: 500 });
  }
}
