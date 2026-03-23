import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { mecanicos } from '../../../../drizzle/migrations/schema';
import { desc, eq } from 'drizzle-orm';



/**
 * GET: Fetch all mechanics or active mechanics only
 * @param request - HTTP request
 * @returns JSON array of mechanics or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let result;
    if (all) {
      result = await db.select().from(mecanicos).orderBy(mecanicos.nome);
    } else {
      result = await db.select().from(mecanicos).where(eq(mecanicos.ativo, 1)).orderBy(mecanicos.nome);
    }
    return successResponse(result);
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
    
    const insertData = {
      nome: body.nome,
      especialidade: body.especialidade || null,
      telefone: body.telefone || null,
      email: body.email || null,
      tarifaHoraria: body.tarifa_horaria ? String(parseFloat(body.tarifa_horaria.toString())) : null,
      dataContratacao: body.data_contratacao || null,
      ativo: body.ativo !== undefined ? (body.ativo ? 1 : 0) : 1
    };
    await db.insert(mecanicos).values(insertData);
    const [mecanico] = await db.select().from(mecanicos).where(eq(mecanicos.nome, body.nome)).orderBy(desc(mecanicos.id)).limit(1);
    if (!mecanico) {
      return handleDatabaseError(new Error('Failed to create mecanico'));
    }
    await registarAuditoria('CREATE', 'mecanicos', mecanico.id, null, { nome: body.nome, especialidade: body.especialidade }, request);
    return successResponse(mecanico, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


