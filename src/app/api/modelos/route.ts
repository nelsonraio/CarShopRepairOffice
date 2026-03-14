import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * Initialize Prisma Client for database operations
 */
// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * GET: Fetch all models or models by brand
 * @param request - HTTP request
 * @returns JSON array of models or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marcaId = searchParams.get('marca_id');
    const all = searchParams.get('all') === 'true';

    let whereClause: any = all ? {} : { ativo: true };

    if (marcaId) {
      whereClause.marca_id = parseInt(marcaId);
    }

    const modelos = await prisma.modelos.findMany({
      where: whereClause,
      include: {
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    return successResponse(modelos);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new model
 * @param request - HTTP request with model data
 * @returns Created model or error response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const modelo = await prisma.modelos.create({
      data: {
        marca_id: parseInt(body.marca_id),
        nome: body.nome,
        tipo_veiculo: body.tipo_veiculo || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      },
      include: {
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    await registarAuditoria('CREATE', 'modelos', modelo.id, null, { nome: body.nome, marca_id: parseInt(body.marca_id) }, request);

    return successResponse(modelo, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


