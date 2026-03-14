import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * Cliente Prisma configurado para logar apenas erros
 */
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * Converte valor para percentagem segura
 * 
 * Suporta:
 * - String com vírgula: '55,5' → 55.5
 * - String com ponto: '55.5' → 55.5
 * - Número: 55 → 55
 * - Valores inválidos → 0
 * 
 * @param value - Valor a converter
 * @returns Número finito ou 0
 */
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
 * PUT /api/perfis-clientes/[id]
 * Atualiza perfil de cliente existente (substituição completa)
 * 
 * Body esperado:
 * - nome: string (obrigatório)
 * - descricao: string | null
 * - perclucro: number (percentagem de lucro)
 * - ativo: boolean
 * 
 * IMPORTANTE: Normaliza perclucro de Decimal para number na resposta
 * 
 * @param request - HTTP request com dados do perfil
 * @param params - Parâmetros da rota (id do perfil)
 * @returns Perfil atualizado ou erro
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const perfil = await prisma.perfis_clientes.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        perclucro: toSafePercent(body.perclucro),
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    await registarAuditoria('UPDATE', 'perfis_clientes', id, null, { nome: body.nome, perclucro: toSafePercent(body.perclucro) }, request);

    // Normalizar Decimal para number antes de retornar
    return NextResponse.json({
      ...perfil,
      perclucro: Number(perfil.perclucro?.toString() || '0'),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 } // Service Unavailable
      );
    }
    console.error('Error updating perfil:', error);
    return NextResponse.json({ error: 'Failed to update perfil' }, { status: 500 });
  }
}

/**
 * PATCH /api/perfis-clientes/[id]
 * Atualiza perfil parcialmente (apenas campos enviados)
 * 
 * Útil para operações como toggle ativo/inativo sem enviar todos os campos
 * 
 * Body: Qualquer combinação de campos do perfil
 * 
 * IMPORTANTE: Normaliza perclucro de Decimal para number na resposta
 * 
 * @param request - HTTP request com dados parciais
 * @param params - Parâmetros da rota (id do perfil)
 * @returns Perfil atualizado ou erro
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Atualização parcial - apenas campos fornecidos
    const perfil = await prisma.perfis_clientes.update({
      where: { id },
      data: body
    });

    // Normalizar Decimal para number
    return NextResponse.json({
      ...perfil,
      perclucro: Number(perfil.perclucro?.toString() || '0'),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Error patching perfil:', error);
    return NextResponse.json({ error: 'Failed to patch perfil' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.perfis_clientes.delete({
      where: { id }
    });

    await registarAuditoria('DELETE', 'perfis_clientes', id, null, null, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Error deleting perfil:', error);
    return NextResponse.json({ error: 'Failed to delete perfil' }, { status: 500 });
  }
}


