
import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { pecas } from '@/db/schema';
import { like, eq, asc, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

   
    const pecasList = await db
      .select({
        id: pecas.id,
        referencia: pecas.referencia,
        nome: pecas.nome,
        preco_venda: pecas.preco_venda,
        margem_lucro: pecas.margem_lucro
      })
      .from(pecas)
      .where(and(like(pecas.nome, `%${query}%`), eq(pecas.ativo, 1)))
      .orderBy(asc(pecas.nome))
      .limit(10);

    // Serializar para garantir compatibilidade
    const serializedPecas = pecasList.map((peca) => ({
      id: String(peca.id),
      referencia: peca.referencia || '',
      nome: peca.nome,
      preco_venda: Number(peca.preco_venda) || 0,
      margem_lucro: peca.margem_lucro ? Number(peca.margem_lucro) : 0
    }));

    return NextResponse.json(serializedPecas);
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
    console.error('Error searching pecas:', error);
    return NextResponse.json({ error: 'Failed to search pecas' }, { status: 500 });
  }
}


