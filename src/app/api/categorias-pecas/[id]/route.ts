// DELETE: Exclusão lógica da categoria (marcar como inativo)
export async function DELETE(request: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  // Unwrap params if it's a Promise
  const params = 'then' in context.params ? await context.params : context.params;
  const id = params.id;
  if (!id) {
    return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  try {
    const categoria = await prisma.categorias_peca.update({
      where: { id: Number(id) },
      data: { ativo: false }
    });
    return successResponse({ message: 'Categoria desativada com sucesso', categoria });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
import { PrismaClient } from '@prisma/client';
import { handleDatabaseError, successResponse } from '@/lib/api-utils';

const prisma = new PrismaClient({ log: ['error'] });

// PUT: Editar categoria existente
export async function PUT(request: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  // Unwrap params if it's a Promise
  const params = 'then' in context.params ? await context.params : context.params;
  const id = params.id;
  console.log('params recebido no PUT:', params, 'id:', id);
  const { nome, descricao } = await request.json();
  if (!id) {
    return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }
  try {
    const categoria = await prisma.categorias_peca.update({
      where: { id: Number(id) },
      data: { nome: nome.trim(), descricao: descricao || null }
    });
    return successResponse(categoria);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
