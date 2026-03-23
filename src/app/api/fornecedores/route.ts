import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { fornecedores } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

/**
 * GET: Lista fornecedores ativos ou todos
 * Query params:
 *   - all=true: lista todos (incluindo inativos)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const query = db
      .select()
      .from(fornecedores)
      .orderBy(asc(fornecedores.nome));
    let result = await query;
    if (!all) {
      result = result.filter(f => f.ativo === 1);
    }
    return successResponse(result);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Cria novo fornecedor
 */
export async function POST(request: Request) {
  try {
    const { nome, pessoa_contato, email, telefone, nif, endereco, termos_pagamento, ativo } = await request.json();

    if (!nome || nome.trim().length === 0) {
      return successResponse({ error: 'Nome do fornecedor é obrigatório' }, 400);
    }

    const insertData: any = {
      nome,
      email: email || null,
      telefone: telefone || null,
      nif: nif || null,
      endereco: endereco || null,
      ativo: ativo !== undefined ? ativo : 1
    };
    // pessoa_contato e termos_pagamento só se existirem na tabela drizzle
    if ('pessoa_contato' in fornecedores) insertData.pessoa_contato = pessoa_contato || null;
    if ('termos_pagamento' in fornecedores) insertData.termos_pagamento = termos_pagamento || null;

    const result = await db.insert(fornecedores).values(insertData);
    // Buscar o fornecedor criado
    const [fornecedor] = await db.select().from(fornecedores).where(eq(fornecedores.nome, nome));

    await registarAuditoria('CREATE', 'fornecedores', fornecedor?.id, null, { nome, email, telefone }, request);

    return successResponse(fornecedor, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


