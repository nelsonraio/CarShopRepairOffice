import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { servicos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const updateData = {
      nome: body.nome,
      descricao: body.descricao || null,
      precoBase: body.preco_base !== undefined && body.preco_base !== null ? body.preco_base.toString() : null,
      duracaoEstimada: body.duracao_estimada || null,
      requerPecas: body.requer_pecas !== undefined ? (body.requer_pecas ? 1 : 0) : 0,
      ativo: body.ativo !== undefined ? (body.ativo ? 1 : 0) : 1
    };
    await db.update(servicos).set(updateData).where(eq(servicos.id, id));
    const [servico] = await db.select().from(servicos).where(eq(servicos.id, id));
    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado após atualização.' }, { status: 404 });
    }
    await registarAuditoria('UPDATE', 'servicos', id, null, { nome: body.nome, preco_base: body.preco_base }, request);
    return NextResponse.json({ ...servico, id: Number(servico.id) });
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
    console.error('Error updating servico:', error);
    return NextResponse.json({ error: 'Failed to update servico' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await db.update(servicos).set(body).where(eq(servicos.id, id));
    const [servico] = await db.select().from(servicos).where(eq(servicos.id, id));
    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado após atualização.' }, { status: 404 });
    }
    return NextResponse.json({ ...servico, id: Number(servico.id) });
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
    console.error('Error patching servico:', error);
    return NextResponse.json({ error: 'Failed to patch servico' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await db.delete(servicos).where(eq(servicos.id, id));
    await registarAuditoria('DELETE', 'servicos', id, null, null, request);
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
    console.error('Error deleting servico:', error);
    return NextResponse.json({ error: 'Failed to delete servico' }, { status: 500 });
  }
}


