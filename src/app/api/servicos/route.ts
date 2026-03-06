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
 * GET: Fetch all services or active services only
 * @param request - HTTP request
 * @returns JSON array of services or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const servicos = await prisma.servicos.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    // Serialize BigInt fields
    const serializedServicos = servicos.map(serializeBigInt);

    return successResponse(serializedServicos);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new service
 * @param request - HTTP request with service data
 * @returns Created service or error response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const servico = await prisma.servicos.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        preco_base: body.preco_base ? parseFloat(body.preco_base.toString()) : null,
        duracao_estimada: body.duracao_estimada || null,
        requer_pecas: body.requer_pecas !== undefined ? body.requer_pecas : false,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    // Serialize BigInt fields
    const serialized = serializeBigInt(servico);

    return successResponse(serialized, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


