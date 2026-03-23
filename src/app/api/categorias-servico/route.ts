import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { db } from '@/db/connection';
import { categoriasServico } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * GET: Fetch all service categories or active only
 * @param request - HTTP request
 * @returns JSON array of service categories or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const categorias = all
      ? await db.select().from(categoriasServico).orderBy(asc(categoriasServico.nome))
      : await db.select().from(categoriasServico).where(eq(categoriasServico.ativo, 1)).orderBy(asc(categoriasServico.nome));
    return successResponse(categorias);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new service category
 * @param request - HTTP request with category data
 * @returns Created category or error response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao, duracao_estimada, ativo } = body;
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    const [inserted] = await db
      .insert(categoriasServico)
      .values({
        nome: nome.trim(),
        descricao: descricao || null,
        duracaoEstimada: duracao_estimada || null,
        ativo: ativo !== undefined ? ativo : 1
      });
    // Buscar a categoria criada para devolver o objeto completo
    const [categoria] = await db
      .select()
      .from(categoriasServico)
      .where(eq(categoriasServico.nome, nome.trim()));
    await registarAuditoria('CREATE', 'categorias_servico', categoria?.id, null, { nome: nome.trim() }, request);
    return successResponse(categoria, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


