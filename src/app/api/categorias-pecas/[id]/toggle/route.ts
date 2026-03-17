import { PrismaClient } from '@prisma/client';
import { handleDatabaseError, successResponse } from '@/lib/api-utils';

const prisma = new PrismaClient({ log: ['error'] });

// PATCH: Ativar/Inativar categoria de peça
export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').slice(-2)[0];
    const { ativo } = await request.json();
    if (!id) return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    const categoria = await prisma.categorias_peca.update({
      where: { id: Number(id) },
      data: { ativo: Boolean(ativo) }
    });
    return successResponse(categoria);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
