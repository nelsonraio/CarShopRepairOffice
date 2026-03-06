import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';

/**
 * Initialize Prisma Client for database operations
 */
// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * GET: Fetch all unique part categories from database
 * @returns JSON array of unique categories or error response
 */
export async function GET() {
  try {
    // Fetch all unique categories from pecas table
    const pecas = await prisma.pecas.findMany({
      select: { categoria: true },
      where: { ativo: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' }
    });

    const categorias = pecas
      .map((p: typeof pecas[number]) => p.categoria)
      .filter((c: string | null | undefined) => c && c.trim() !== '') // Remove null and empty values
      .sort();

    return successResponse(categorias);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


