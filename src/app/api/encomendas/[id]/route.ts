import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { encomendasPecas, itensEncomendaPeca } from '@/drizzle/schema';
import { registarAuditoria } from '@/lib/auditoria';
import { eq } from 'drizzle-orm';

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

    // Atualizar encomenda usando Drizzle
    await db.update(encomendasPecas)
      .set({ estado })
      .where(eq(encomendasPecas.id, Number(id)));

    // Buscar encomenda atualizada para resposta
    const [updated] = await db.select().from(encomendasPecas).where(eq(encomendasPecas.id, Number(id)));
    if (!updated) {
      return NextResponse.json({ error: 'Encomenda nao encontrada' }, { status: 404 });
    }

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
    const encomendaId = Number(id);
    // Apagar todos os itens da encomenda primeiro
    await db.delete(itensEncomendaPeca).where(eq(itensEncomendaPeca.encomendaId, encomendaId));
    // Depois apagar a encomenda
    await db.delete(encomendasPecas).where(eq(encomendasPecas.id, encomendaId));
    await registarAuditoria('DELETE', 'encomendas_pecas', encomendaId, null, null, request);
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


