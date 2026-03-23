import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { db } from '@/db/connection';
import { perfisClientes } from '@/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';

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
    const perfis = all
      ? await db.select().from(perfisClientes).orderBy(asc(perfisClientes.nome))
      : await db.select().from(perfisClientes).where(eq(perfisClientes.ativo, 1)).orderBy(asc(perfisClientes.nome));
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
    const safePercent = toSafePercent(body.perclucro);
    await db.insert(perfisClientes).values({
      nome: body.nome,
      descricao: body.descricao || null,
      perclucro: String(safePercent),
      ativo: body.ativo !== undefined ? body.ativo : 1
    });
    const [perfil] = await db.select().from(perfisClientes).where(eq(perfisClientes.nome, body.nome)).orderBy(desc(perfisClientes.id)).limit(1);
    if (!perfil) {
      return handleDatabaseError(new Error('Failed to create perfil cliente'));
    }
    await registarAuditoria('CREATE', 'perfis_clientes', perfil.id, null, { nome: body.nome, perclucro: safePercent }, request);
    return successResponse({
      ...perfil,
      perclucro: Number(perfil.perclucro?.toString() || '0'),
    }, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


