import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { utilizadores } from '@/db/schema';
import { desc, eq, or } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db.select({
      id: utilizadores.id,
      nome_utilizador: utilizadores.nomeUtilizador,
      email: utilizadores.email,
      nome_completo: utilizadores.nomeCompleto,
      papel: utilizadores.papel,
      ativo: utilizadores.ativo,
      ultimo_login: utilizadores.ultimoLogin,
      criado_em: utilizadores.criadoEm,
    })
      .from(utilizadores)
      .orderBy(utilizadores.nomeUtilizador);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erro ao listar utilizadores:', error);
    return NextResponse.json({ error: 'Erro ao listar utilizadores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome_utilizador, email, nome_completo, papel, hash_palavra_passe } = body;

    // Validar campos obrigatórios
    if (!nome_utilizador || !email || !nome_completo || !hash_palavra_passe) {
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

    // Verificar se utilizador já existe
    const existente = await db.select().from(utilizadores)
      .where(
        or(
          eq(utilizadores.nomeUtilizador, nome_utilizador),
          eq(utilizadores.email, email)
        )
      ).limit(1);

    if (existente && existente.length > 0) {
      return NextResponse.json(
        { error: 'Nome de utilizador ou email já existe' },
        { status: 409 }
      );
    }

    // Hash da palavra-passe
    const hashedPassword = await bcrypt.hash(hash_palavra_passe, 10);

    // Criar utilizador
    await db.insert(utilizadores).values({
      nomeUtilizador: nome_utilizador,
      email,
      nomeCompleto: nome_completo,
      papel,
      hashPalavraPasse: hashedPassword,
      ativo: 1,
    });

    const [novoUtilizador] = await db.select({
      id: utilizadores.id,
      nome_utilizador: utilizadores.nomeUtilizador,
      email: utilizadores.email,
      nome_completo: utilizadores.nomeCompleto,
      papel: utilizadores.papel,
      ativo: utilizadores.ativo,
      criado_em: utilizadores.criadoEm,
    })
      .from(utilizadores)
      .where(eq(utilizadores.email, email))
      .orderBy(desc(utilizadores.id))
      .limit(1);

    if (!novoUtilizador) {
      return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 });
    }

    await registarAuditoria('CREATE', 'utilizadores', novoUtilizador.id, null, { nome_utilizador, email, papel }, request);

    return NextResponse.json(novoUtilizador, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 });
  }
}
