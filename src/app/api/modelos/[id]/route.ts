import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { modelos, marcas } from '@/db/schema';
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

    await db.update(modelos)
      .set({
        marcaId: parseInt(body.marca_id),
        nome: body.nome,
        tipoVeiculo: body.tipo_veiculo || null,
        ativo: body.ativo !== undefined ? (body.ativo ? 1 : 0) : 1
      })
      .where(eq(modelos.id, id));
    const [modelo] = await db
      .select({
        id: modelos.id,
        nome: modelos.nome,
        tipoVeiculo: modelos.tipoVeiculo,
        ativo: modelos.ativo,
        marca: {
          id: marcas.id,
          nome: marcas.nome
        }
      })
      .from(modelos)
      .leftJoin(marcas, eq(modelos.marcaId, marcas.id))
      .where(eq(modelos.id, id));
    await registarAuditoria('UPDATE', 'modelos', id, null, { nome: body.nome, marca_id: parseInt(body.marca_id) }, request);
    return NextResponse.json(modelo);
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
    console.error('Error updating modelo:', error);
    return NextResponse.json({ error: 'Failed to update modelo' }, { status: 500 });
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

    await db.update(modelos)
      .set(body)
      .where(eq(modelos.id, id));
    const [modelo] = await db
      .select({
        id: modelos.id,
        nome: modelos.nome,
        tipoVeiculo: modelos.tipoVeiculo,
        ativo: modelos.ativo,
        marca: {
          id: marcas.id,
          nome: marcas.nome
        }
      })
      .from(modelos)
      .leftJoin(marcas, eq(modelos.marcaId, marcas.id))
      .where(eq(modelos.id, id));
    return NextResponse.json(modelo);
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
    console.error('Error patching modelo:', error);
    return NextResponse.json({ error: 'Failed to patch modelo' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await db.delete(modelos).where(eq(modelos.id, id));
    await registarAuditoria('DELETE', 'modelos', id, null, null, request);
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
    console.error('Error deleting modelo:', error);
    return NextResponse.json({ error: 'Failed to delete modelo' }, { status: 500 });
  }
}


