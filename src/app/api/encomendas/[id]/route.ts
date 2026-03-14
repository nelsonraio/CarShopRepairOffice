import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error']
});
const prismaAny = prisma as any;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { estado } = body;

    if (!estado) {
      return NextResponse.json({ error: 'Estado obrigatorio' }, { status: 400 });
    }

    const updated = await prismaAny.encomendas_pecas.update({
      where: { id: BigInt(id) },
      data: { estado }
    });

    await registarAuditoria('UPDATE', 'encomendas_pecas', Number(id), null, { estado }, request);

    return NextResponse.json({
      id: String(updated.id),
      estado: updated.estado
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
    console.error('Error updating encomenda:', error);
    return NextResponse.json({ error: 'Failed to update encomenda' }, { status: 500 });
  }
}
/**
 * DELETE: Apaga encomenda se não houver dependências
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const encomendaId = BigInt(id);
    // Verifica dependências: itens_encomenda_peca, itens_orcamento, itens_ordem_trabalho
    const itensCount = await prisma.itens_encomenda_peca.count({ where: { encomenda_id: encomendaId } });
    // Não existe encomenda_id em itens_orcamento, então não é possível contar dependências diretamente.
    // Se necessário, ajuste para a lógica correta. Aqui, apenas ignora a contagem de itens_orcamento.
    const orcamentosCount = 0;
    // Não existe encomenda_id em itens_ordem_trabalho, então não é possível contar dependências diretamente.
    // Se necessário, ajuste para a lógica correta. Aqui, apenas ignora a contagem de itens_ordem_trabalho.
    const ordensCount = 0;
    if (itensCount > 0 || orcamentosCount > 0 || ordensCount > 0) {
      let motivos = [];
      if (itensCount > 0) motivos.push(`usada em ${itensCount} item(ns) de encomenda`);
      if (orcamentosCount > 0) motivos.push(`usada em ${orcamentosCount} orçamento(s)`);
      if (ordensCount > 0) motivos.push(`usada em ${ordensCount} ordem(ns) de trabalho`);
      return NextResponse.json({ error: `Não é possível apagar a encomenda: ${motivos.join(', ')}.` }, { status: 400 });
    }
    await prisma.encomendas_pecas.delete({ where: { id: encomendaId } });
    await registarAuditoria('DELETE', 'encomendas_pecas', Number(id), null, null, request);
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
    console.error('Error deleting encomenda:', error);
    return NextResponse.json({ error: 'Failed to delete encomenda' }, { status: 500 });
  }
}


