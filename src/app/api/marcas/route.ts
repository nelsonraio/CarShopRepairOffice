import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { marcas } from '../../../../drizzle/migrations/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * GET: Fetch all brands or active brands only
 * @param request - HTTP request
 * @returns JSON array of brands or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let result;
    if (all) {
      result = await db.select().from(marcas).orderBy(marcas.nome);
    } else {
      result = await db.select().from(marcas).where(eq(marcas.ativo, 1)).orderBy(marcas.nome);
    }
    return successResponse(result);
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
    
    const insertData = {
      nome: body.nome,
      paisOrigem: body.pais_origem || null,
      ativo: body.ativo !== undefined ? (body.ativo ? 1 : 0) : 1
    };
    await db.insert(marcas).values(insertData);
    const [marca] = await db.select().from(marcas).where(eq(marcas.nome, body.nome)).orderBy(desc(marcas.id)).limit(1);
    if (!marca) {
      return handleDatabaseError(new Error('Failed to create marca'));
    }

    await registarAuditoria('CREATE', 'marcas', marca.id, null, { nome: body.nome }, request);

    return successResponse(marca, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


