import { successResponse, handleDatabaseError, serializeBigInt } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { servicos } from '../../../../drizzle/migrations/schema';
import { eq } from 'drizzle-orm';



/**
 * GET: Fetch all services or active services only
 * @param request - HTTP request
 * @returns JSON array of services or error response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let result;
    if (all) {
      result = await db.select().from(servicos).orderBy(servicos.nome);
    } else {
      result = await db.select().from(servicos).where(eq(servicos.ativo, 1)).orderBy(servicos.nome);
    }
    // Serialize BigInt fields (se necessário)
    const serializedServicos = result.map(serializeBigInt);
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
    const insertData = {
      nome: body.nome,
      descricao: body.descricao || null,
      precoBase: body.preco_base !== undefined && body.preco_base !== null ? body.preco_base.toString() : null,
      duracaoEstimada: body.duracao_estimada || null,
      requerPecas: body.requer_pecas !== undefined ? (body.requer_pecas ? 1 : 0) : 0,
      ativo: body.ativo !== undefined ? (body.ativo ? 1 : 0) : 1
    };
    await db.insert(servicos).values(insertData);
    // Buscar o serviço criado para devolver o objeto completo
    const [servico] = await db.select().from(servicos).where(eq(servicos.nome, body.nome));
    if (!servico) {
      return Response.json({ error: 'Serviço não encontrado após inserção.' }, { status: 500 });
    }
    const serialized = serializeBigInt(servico);
    await registarAuditoria('CREATE', 'servicos', Number(servico.id), null, { nome: body.nome, preco_base: body.preco_base }, request);
    return successResponse(serialized, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


