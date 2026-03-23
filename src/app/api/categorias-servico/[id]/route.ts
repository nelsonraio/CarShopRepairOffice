import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { categoriasServico } from '@/db/schema';
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


    await db.update(categoriasServico)
      .set({
        nome: body.nome,
        descricao: body.descricao || null,
        duracaoEstimada: body.duracao_estimada || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      })
      .where(eq(categoriasServico.id, id));
    const [categoria] = await db.select().from(categoriasServico).where(eq(categoriasServico.id, id));
    if (!categoria) {
      return NextResponse.json({ error: 'Categoria de servico nao encontrada' }, { status: 404 });
    }
    const serialized = {
      ...categoria,
      id: Number(categoria.id)
    };

    await registarAuditoria('UPDATE', 'categorias_servico', id, null, { nome: body.nome }, request);

    return NextResponse.json(serialized);
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
    console.error('Error updating categoria servico:', error);
    return NextResponse.json({ error: 'Failed to update categoria servico' }, { status: 500 });
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


    await db.update(categoriasServico)
      .set(body)
      .where(eq(categoriasServico.id, id));
    const [categoria] = await db.select().from(categoriasServico).where(eq(categoriasServico.id, id));
    if (!categoria) {
      return NextResponse.json({ error: 'Categoria de servico nao encontrada' }, { status: 404 });
    }
    const serialized = {
      ...categoria,
      id: Number(categoria.id)
    };

    return NextResponse.json(serialized);
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
    console.error('Error patching categoria servico:', error);
    return NextResponse.json({ error: 'Failed to patch categoria servico' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);


    await db.delete(categoriasServico).where(eq(categoriasServico.id, id));

    await registarAuditoria('DELETE', 'categorias_servico', id, null, null, request);

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
    console.error('Error deleting categoria servico:', error);
    return NextResponse.json({ error: 'Failed to delete categoria servico' }, { status: 500 });
  }
}


