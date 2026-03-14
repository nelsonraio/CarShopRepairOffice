import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { registarAuditoria } from '@/lib/auditoria';

const prisma = new PrismaClient();
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

    const user = await prisma.utilizadores.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.hash_palavra_passe);

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

    // Atualizar último login
    await prisma.utilizadores.update({
      where: { id: user.id },
      data: { ultimo_login: new Date() },
    });

    // Criar JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      nome_completo: user.nome_completo,
      nome_utilizador: user.nome_utilizador,
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
          nome_completo: user.nome_completo,
          nome_utilizador: user.nome_utilizador,
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
