import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { mecanicos } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Drizzle does not have ilike for MySQL, so use LIKE with lower-case
    const search = `%${query.toLowerCase()}%`;
    const results = await db
      .select({ id: mecanicos.id, nome: mecanicos.nome })
      .from(mecanicos)
      .where(
        and(
          eq(mecanicos.ativo, 1),
          sql`LOWER(${mecanicos.nome}) LIKE ${search}`
        )
      )
      .orderBy(mecanicos.nome)
      .limit(10);

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


