import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { modelos } from '../../../../../drizzle/migrations/schema';
import { and, like, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const marcaId = url.searchParams.get('marca_id');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Montar filtro
    let whereArr = [eq(modelos.ativo, 1), like(modelos.nome, `%${query}%`)];
    if (marcaId) whereArr.push(eq(modelos.marcaId, parseInt(marcaId)));

    const result = await db
      .select({ id: modelos.id, nome: modelos.nome, marca_id: modelos.marcaId })
      .from(modelos)
      .where(and(...whereArr))
      .orderBy(modelos.nome)
      .limit(10);

    // Convert BigInt id to string for JSON serialization
    const serializedModelos = result.map((modelo: any) => ({
      id: String(modelo.id),
      nome: modelo.nome,
      marca_id: String(modelo.marca_id)
    }));

    return NextResponse.json(serializedModelos);
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
    console.error('Error searching modelos:', error);
    return NextResponse.json({ error: 'Failed to search modelos' }, { status: 500 });
  }
}


