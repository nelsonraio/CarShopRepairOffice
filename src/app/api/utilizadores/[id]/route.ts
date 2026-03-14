import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registarAuditoria } from '@/lib/auditoria';

const prisma = new PrismaClient();

export async function GET(
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
    const userId = parseInt(id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

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

    // Preparar dados de atualização
    const updateData: any = {
      email,
      nome_completo,
      papel: papel as any,
    };

    // Se foi fornecida nova palavra-passe, fazer hash
    if (body.hash_palavra_passe && body.hash_palavra_passe.trim()) {
      updateData.hash_palavra_passe = await bcrypt.hash(body.hash_palavra_passe, 10);
    }

    // Atualizar utilizador
    const atualizado = await prisma.utilizadores.update({
      where: { id: userId },
      data: updateData,
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

    await registarAuditoria('UPDATE', 'utilizadores', userId, { email: utilizador.email, papel: utilizador.papel }, { email, nome_completo, papel }, request);

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

    // Nunca permitir remover o último admin para evitar bloqueio de acesso.
    if (utilizador.papel === 'admin') {
      const totalAdmins = await prisma.utilizadores.count({
        where: { papel: 'admin' },
      });

      if (totalAdmins <= 1) {
        return NextResponse.json(
          { error: 'Não é permitido eliminar o último utilizador com perfil admin.' },
          { status: 409 }
        );
      }
    }

    // Eliminar utilizador
    await prisma.utilizadores.delete({
      where: { id: userId },
    });

    await registarAuditoria('DELETE', 'utilizadores', userId, { nome_utilizador: utilizador.nome_utilizador, email: utilizador.email }, null, request);

    return NextResponse.json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao eliminar utilizador' }, { status: 500 });
  }
}
