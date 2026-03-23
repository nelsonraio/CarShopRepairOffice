import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { marcas } from '../../../../../drizzle/migrations/schema';
import { and, like, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const result = await db
      .select({ id: marcas.id, nome: marcas.nome, pais_origem: marcas.paisOrigem })
      .from(marcas)
      .where(and(eq(marcas.ativo, 1), like(marcas.nome, `%${query}%`)))
      .orderBy(marcas.nome)
      .limit(10);

    // Convert BigInt id to string for JSON serialization
    const serializedMarcas = result.map((marca: any) => ({
      id: String(marca.id),
      nome: marca.nome,
      pais_origem: marca.pais_origem
    }));

    return NextResponse.json(serializedMarcas);
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
    console.error('Error searching marcas:', error);
    return NextResponse.json({ error: 'Failed to search marcas' }, { status: 500 });
  }
}


