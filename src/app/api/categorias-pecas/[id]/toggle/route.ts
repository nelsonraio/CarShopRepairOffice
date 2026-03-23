import { handleDatabaseError, successResponse } from '@/lib/api-utils';
import { db } from '@/db/connection';
import { categoriasPeca } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH: Ativar/Inativar categoria de peça
export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').slice(-2)[0];
    const { ativo } = await request.json();
    if (!id) return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    await db.update(categoriasPeca)
      .set({ ativo: ativo ? 1 : 0 })
      .where(eq(categoriasPeca.id, Number(id)));
    // Buscar a categoria atualizada para devolver o objeto completo
    const [categoria] = await db
      .select({ id: categoriasPeca.id, nome: categoriasPeca.nome, descricao: categoriasPeca.descricao, ativo: categoriasPeca.ativo })
      .from(categoriasPeca)
      .where(eq(categoriasPeca.id, Number(id)));
    return successResponse(categoria);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
