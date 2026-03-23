import { NextResponse } from 'next/server';
import { db } from '../../../../db/connection';
import { servicos } from '../../../../db/schema';
import { like, eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Drizzle ORM: buscar servicos ativos e nome contendo query
    const results = await db.select({
      id: servicos.id,
      nome: servicos.nome,
      preco_base: servicos.precoBase
    })
      .from(servicos)
      .where(and(
        eq(servicos.ativo, 1),
        like(servicos.nome, `%${query}%`)
      ))
      .orderBy(servicos.nome)
      .limit(10);

    // Serializar para JSON
    const serializedServicos = results.map((servico) => ({
      id: String(servico.id),
      nome: servico.nome,
      preco_base: servico.preco_base ? Number(servico.preco_base) : 0
    }));

    return NextResponse.json(serializedServicos);
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
    console.error('Error searching servicos:', error);
    return NextResponse.json({ error: 'Failed to search servicos' }, { status: 500 });
  }
}


