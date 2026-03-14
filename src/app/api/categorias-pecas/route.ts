import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * GET: Fetch all active part categories from categorias_peca table
 */
export async function GET() {
  try {
    const categorias = await prisma.categorias_peca.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, descricao: true }
    });
    // Devolve array de objetos {id, nome, descricao}
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
    const categoria = await prisma.categorias_peca.create({
      data: { nome: nome.trim(), descricao: descricao || null }
    });
    return successResponse(categoria);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


