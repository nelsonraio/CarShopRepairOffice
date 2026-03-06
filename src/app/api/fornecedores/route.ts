import { PrismaClient } from '@prisma/client';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';

const prisma = new PrismaClient({ log: ['error'] });

/**
 * GET: Lista fornecedores ativos ou todos
 * Query params:
 *   - all=true: lista todos (incluindo inativos)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const fornecedores = await prisma.fornecedores.findMany({
      where: all ? {} : { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return successResponse(fornecedores);
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

    const fornecedor = await prisma.fornecedores.create({
      data: {
        nome,
        pessoa_contato: pessoa_contato || null,
        email: email || null,
        telefone: telefone || null,
        nif: nif || null,
        endereco: endereco || null,
        termos_pagamento: termos_pagamento || null,
        ativo: ativo !== undefined ? ativo : true
      }
    });

    return successResponse(fornecedor, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


