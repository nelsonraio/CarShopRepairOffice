import { db } from '@/db/connection';
import { utilizadores } from '../../../../../drizzle/migrations/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { registarAuditoria } from '@/lib/auditoria';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * POST /api/utilizadores/login
 * Autentica um utilizador e devolve um token JWT
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o utilizador pelo email usando Drizzle
    const [user] = await db
      .select()
      .from(utilizadores)
      .where(eq(utilizadores.email, email));

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.hashPalavraPasse);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!user.ativo) {
      return NextResponse.json(
        { error: 'Utilizador inativo' },
        { status: 403 }
      );
    }

    // Atualizar último login com Drizzle
    await db
      .update(utilizadores)
      .set({ ultimoLogin: new Date().toISOString().slice(0, 19).replace('T', ' ') })
      .where(eq(utilizadores.id, user.id));

    // Criar JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      nome_completo: user.nomeCompleto,
      nome_utilizador: user.nomeUtilizador,
      papel: user.papel,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json(
      {
        message: 'Login bem-sucedido',
        token,
        user: {
          id: user.id,
          email: user.email,
          nome_completo: user.nomeCompleto,
          nome_utilizador: user.nomeUtilizador,
          papel: user.papel,
        },
      },
      { status: 200 }
    );

    // Definir o cookie com o token (7 dias)
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    await registarAuditoria('LOGIN', 'utilizadores', user.id, null, { email: user.email, papel: user.papel }, request);

    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
