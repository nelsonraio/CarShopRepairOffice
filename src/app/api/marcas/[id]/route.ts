import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { marcas } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Map fields to Drizzle schema
    const updateObj: any = {
      nome: body.nome,
      paisOrigem: body.pais_origem || null,
      ativo: body.ativo !== undefined ? body.ativo : true
    };

    await db.update(marcas).set(updateObj).where(eq(marcas.id, id));
    const updated = await db.select().from(marcas).where(eq(marcas.id, id));
    if (!updated[0]) {
      return NextResponse.json({ error: 'Marca nao encontrada' }, { status: 404 });
    }

    await registarAuditoria('UPDATE', 'marcas', id, null, { nome: body.nome }, request);

    return successResponse(updated[0]);
  } catch (error) {
    return handleDatabaseError(error as Error);
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

    // Accepts partial update, so just set whatever is present
    const updateObj: any = {};
    for (const key in body) {
      if (key === 'pais_origem') updateObj.paisOrigem = body[key];
      else updateObj[key] = body[key];
    }

    await db.update(marcas).set(updateObj).where(eq(marcas.id, id));
    const updated = await db.select().from(marcas).where(eq(marcas.id, id));
    if (!updated[0]) {
      return NextResponse.json({ error: 'Marca nao encontrada' }, { status: 404 });
    }
    return successResponse(updated[0]);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await db.delete(marcas).where(eq(marcas.id, id));
    await registarAuditoria('DELETE', 'marcas', id, null, null, request);
    return successResponse({ success: true });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


