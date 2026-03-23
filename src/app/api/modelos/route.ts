import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { modelos, marcas } from '../../../../drizzle/migrations/schema';
import { eq, and } from 'drizzle-orm';


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

    // Montar filtro
    let whereArr = [];
    if (!all) whereArr.push(eq(modelos.ativo, 1));
    if (marcaId) whereArr.push(eq(modelos.marcaId, parseInt(marcaId)));

    // Buscar modelos
    const result = await db
      .select({
        id: modelos.id,
        nome: modelos.nome,
        tipo_veiculo: modelos.tipoVeiculo,
        ativo: modelos.ativo,
        marca: marcas
      })
      .from(modelos)
      .leftJoin(marcas, eq(modelos.marcaId, marcas.id))
      .where(whereArr.length ? and(...whereArr) : undefined)
      .orderBy(modelos.nome);

    // Ajustar formato para compatibilidade
    const modelosArr = result.map((m) => ({
      id: m.id,
      nome: m.nome,
      tipo_veiculo: m.tipo_veiculo,
      ativo: m.ativo,
      marca: m.marca ? { id: m.marca.id, nome: m.marca.nome } : null
    }));
    return successResponse(modelosArr);
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
    const insertData = {
      marcaId: parseInt(body.marca_id),
      nome: body.nome,
      tipoVeiculo: body.tipo_veiculo || null,
      ativo: body.ativo !== undefined ? (body.ativo ? 1 : 0) : 1
    };
    const insertResult = await db.insert(modelos).values(insertData);
    // Buscar pelo campo único (nome + marcaId)
    const [modelo] = await db.select().from(modelos).where(
      and(eq(modelos.nome, body.nome), eq(modelos.marcaId, parseInt(body.marca_id)))
    );
    if (!modelo) {
      return successResponse({ error: 'Falha ao criar modelo' }, 500);
    }
    let marca = null;
    if (modelo.marcaId) {
      const [marcaObj] = await db.select().from(marcas).where(eq(marcas.id, modelo.marcaId));
      if (marcaObj) marca = { id: marcaObj.id, nome: marcaObj.nome };
    }
    await registarAuditoria('CREATE', 'modelos', modelo.id, null, { nome: body.nome, marca_id: parseInt(body.marca_id) }, request);
    return successResponse({ ...modelo, marca }, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


