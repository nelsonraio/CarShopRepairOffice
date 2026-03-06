import { successResponse, handleDatabaseError, serializeBigInt } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';

/**
 * Initialize Prisma Client for database operations
 */
// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * GET: Fetch all service categories or active only
 * @param request - HTTP request
 * @returns JSON array of service categories or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const query: any = {
      orderBy: { nome: 'asc' }
    };

    if (!all) {
      query.where = { ativo: true };
    }

    const categorias = await prisma.categorias_servico.findMany(query);

    // Serialize BigInt fields
    const serializedCategorias = categorias.map(serializeBigInt);

    return successResponse(serializedCategorias);
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
    
    const categoria = await prisma.categorias_servico.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        duracao_estimada: body.duracao_estimada || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    // Serialize BigInt fields
    const serialized = serializeBigInt(categoria);

    return successResponse(serialized, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


