import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { db } from '@/db/connection';
import { categoriasPeca } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

/**
 * GET: Fetch all active part categories from categorias_peca table
 */
export async function GET() {
  try {
    const categorias = await db
      .select({ id: categoriasPeca.id, nome: categoriasPeca.nome, descricao: categoriasPeca.descricao })
      .from(categoriasPeca)
      .where(eq(categoriasPeca.ativo, 1))
      .orderBy(asc(categoriasPeca.nome));
    return successResponse(categorias);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create a new part category
 */
export async function POST(request: Request) {
  try {
    const { nome, descricao } = await request.json();
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    const [categoriaId] = await db
      .insert(categoriasPeca)
      .values({ nome: nome.trim(), descricao: descricao || null, ativo: 1 })
      ;
    // Buscar a categoria criada para devolver o objeto completo
    const [categoria] = await db
      .select({ id: categoriasPeca.id, nome: categoriasPeca.nome, descricao: categoriasPeca.descricao })
      .from(categoriasPeca)
      .where(eq(categoriasPeca.nome, nome.trim()));
    return successResponse(categoria);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


