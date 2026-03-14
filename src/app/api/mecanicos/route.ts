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
 * GET: Fetch all mechanics or active mechanics only
 * @param request - HTTP request
 * @returns JSON array of mechanics or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const mecanicos = await prisma.mecanicos.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return successResponse(mecanicos);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new mechanic
 * @param request - HTTP request with mechanic data
 * @returns Created mechanic or error response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const mecanico = await prisma.mecanicos.create({
      data: {
        nome: body.nome,
        especialidade: body.especialidade || null,
        telefone: body.telefone || null,
        email: body.email || null,
        tarifa_horaria: body.tarifa_horaria ? parseFloat(body.tarifa_horaria.toString()) : null,
        data_contratacao: body.data_contratacao ? new Date(body.data_contratacao) : null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    await registarAuditoria('CREATE', 'mecanicos', mecanico.id, null, { nome: body.nome, especialidade: body.especialidade }, request);

    return successResponse(mecanico, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


