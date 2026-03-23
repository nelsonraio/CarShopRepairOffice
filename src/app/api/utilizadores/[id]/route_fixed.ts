import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { utilizadores } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const result = await db.select().from(utilizadores)
      .where(eq(utilizadores.id, userId));
    const utilizador = result[0];

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Normalizar campos para manter compatibilidade
    return NextResponse.json({
      id: utilizador.id,
      nome_utilizador: utilizador.nomeUtilizador,
      email: utilizador.email,
      nome_completo: utilizador.nomeCompleto,
      papel: utilizador.papel,
      ativo: !!utilizador.ativo,
      ultimo_login: utilizador.ultimoLogin,
      criado_em: utilizador.criadoEm,
    });
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
    const result = await db.select().from(utilizadores).where(eq(utilizadores.id, userId));
    const utilizador = result[0];
    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se email já existe (em outro utilizador)
    if (email !== utilizador.email) {
      const emailExistente = await db.select().from(utilizadores)
        .where(and(eq(utilizadores.email, email), ne(utilizadores.id, userId)));
      if (emailExistente.length > 0) {
        return NextResponse.json(
          { error: 'Email já existe' },
          { status: 409 }
        );
      }
    }

    // Atualizar utilizador
    await db.update(utilizadores)
      .set({
        email,
        nomeCompleto: nome_completo,
        papel,
      })
      .where(eq(utilizadores.id, userId));

    // Buscar atualizado
    const atualizadoArr = await db.select().from(utilizadores).where(eq(utilizadores.id, userId));
    if (!atualizadoArr || atualizadoArr.length === 0) {
      return NextResponse.json({ error: 'Erro ao atualizar utilizador' }, { status: 500 });
    }
    const atualizado = atualizadoArr[0]!;
    return NextResponse.json({
      id: atualizado.id,
      nome_utilizador: atualizado.nomeUtilizador,
      email: atualizado.email,
      nome_completo: atualizado.nomeCompleto,
      papel: atualizado.papel,
      ativo: !!atualizado.ativo,
      criado_em: atualizado.criadoEm,
    });
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
    const result = await db.select().from(utilizadores).where(eq(utilizadores.id, userId));
    const utilizador = result[0];
    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Eliminar utilizador
    await db.delete(utilizadores).where(eq(utilizadores.id, userId));

    return NextResponse.json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao eliminar utilizador' }, { status: 500 });
  }
}
