import { handleDatabaseError, successResponse } from '@/lib/api-utils';
import { db } from '@/db/connection';
import { categoriasPeca } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE: Exclusão lógica da categoria (marcar como inativo)
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  if (!id) {
    return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  try {
    await db.update(categoriasPeca)
      .set({ ativo: 0 })
      .where(eq(categoriasPeca.id, Number(id)));
    return successResponse({ message: 'Categoria desativada com sucesso' });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

// PUT: Editar categoria existente
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  const { nome, descricao } = await request.json();
  if (!id) {
    return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }
  try {
    await db.update(categoriasPeca)
      .set({ nome: nome.trim(), descricao: descricao || null })
      .where(eq(categoriasPeca.id, Number(id)));
    // Buscar a categoria atualizada para devolver o objeto completo
    const [categoria] = await db
      .select({ id: categoriasPeca.id, nome: categoriasPeca.nome, descricao: categoriasPeca.descricao })
      .from(categoriasPeca)
      .where(eq(categoriasPeca.id, Number(id)));
    return successResponse(categoria);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
