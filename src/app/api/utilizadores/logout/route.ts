import { NextResponse } from 'next/server';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * POST /api/utilizadores/logout
 * Remove o token do cookie
 */
export async function POST() {
  await registarAuditoria('LOGOUT', 'utilizadores');

  const response = NextResponse.json(
    { message: 'Logout bem-sucedido' },
    { status: 200 }
  );

  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
