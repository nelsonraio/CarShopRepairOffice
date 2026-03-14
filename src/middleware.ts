import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Páginas públicas que não precisam de autenticação
  if (pathname.startsWith('/login') || pathname.startsWith('/offline')) {
    // Se já estiver autenticado e tentar aceder ao login, redirecionar para kanban
    if (pathname.startsWith('/login')) {
      const token = request.cookies.get('token')?.value;
      if (token) {
        try {
          await jwtVerify(token, secret, { algorithms: ['HS256'] });
          return NextResponse.redirect(new URL('/kanban', request.url));
        } catch {
          // Token inválido, deixar aceder ao login
        }
      }
    }
    return NextResponse.next();
  }

  // Para todas as outras rotas, verificar autenticação
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (logo, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo\\.png|.*\\.svg).*)',
  ],
};
