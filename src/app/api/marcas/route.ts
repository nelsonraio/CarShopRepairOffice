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
 * GET: Fetch all brands or active brands only
 * @param request - HTTP request
 * @returns JSON array of brands or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const marcas = await prisma.marcas.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return successResponse(marcas);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new brand
 * @param request - HTTP request with brand data
 * @returns Created brand or error response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const marca = await prisma.marcas.create({
      data: {
        nome: body.nome,
        pais_origem: body.pais_origem || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    await registarAuditoria('CREATE', 'marcas', marca.id, null, { nome: body.nome }, request);

    return successResponse(marca, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


