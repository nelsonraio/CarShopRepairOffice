import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * Initialize Prisma Client for database operations
 */
const prisma = new PrismaClient({
  log: ['error'],
});

const toSafePercent = (value: unknown): number => {
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    if (!normalized) return 0;
    const parsedString = Number(normalized);
    return Number.isFinite(parsedString) ? parsedString : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * GET: Fetch all client profiles or active profiles only
 * @param request - HTTP request
 * @returns JSON array of profiles or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const perfis = await prisma.perfis_clientes.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    const normalized = perfis.map((perfil) => ({
      ...perfil,
      perclucro: Number(perfil.perclucro?.toString() || '0'),
    }));

    return successResponse(normalized);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new client profile
 * @param request - HTTP request with profile data
 * @returns Created profile or error response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const perfil = await prisma.perfis_clientes.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        perclucro: toSafePercent(body.perclucro),
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    await registarAuditoria('CREATE', 'perfis_clientes', perfil.id, null, { nome: body.nome, perclucro: toSafePercent(body.perclucro) }, request);

    return successResponse({
      ...perfil,
      perclucro: Number(perfil.perclucro?.toString() || '0'),
    }, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


