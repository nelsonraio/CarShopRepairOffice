import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { clientes, perfisClientes } from '../../../../../drizzle/migrations/schema';
import { and, or, like, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Montar filtro
    const whereArr = [
      eq(clientes.ativo, 1),
      or(
        like(clientes.nome, `%${query}%`),
        like(clientes.telefone, `%${query}%`),
        like(clientes.email, `%${query}%`)
      )
    ];

    // Buscar clientes
    const result = await db
      .select({
        id: clientes.id,
        nome: clientes.nome,
        telefone: clientes.telefone,
        email: clientes.email,
        nif: clientes.nif,
        endereco: clientes.endereco,
        perfil_id: clientes.perfilId,
        perfil_nome: perfisClientes.nome
      })
      .from(clientes)
      .leftJoin(perfisClientes, eq(clientes.perfilId, perfisClientes.id))
      .where(and(...whereArr))
      .orderBy(clientes.nome)
      .limit(10);

    const serialized = result.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      nif: cliente.nif,
      endereco: cliente.endereco,
      perfil_id: cliente.perfil_id || null,
      perfil: cliente.perfil_nome || 'Normal'
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Error searching clientes:', error);
    return NextResponse.json({ error: 'Failed to search clientes' }, { status: 500 });
  }
}


