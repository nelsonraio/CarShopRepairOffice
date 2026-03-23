import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { mecanicos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api-utils';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Prepare update object, mapping camelCase to snake_case as needed
    const updateObj: any = {
      nome: body.nome,
      especialidade: body.especialidade || null,
      telefone: body.telefone || null,
      email: body.email || null,
      tarifaHoraria: body.tarifa_horaria ? parseFloat(body.tarifa_horaria.toString()) : null,
      dataContratacao: body.data_contratacao ? new Date(body.data_contratacao) : null,
      ativo: body.ativo !== undefined ? body.ativo : true
    };

    const result = await db
      .update(mecanicos)
      .set(updateObj)
      .where(eq(mecanicos.id, id));

    // Fetch updated record
    const updated = await db
      .select()
      .from(mecanicos)
      .where(eq(mecanicos.id, id));

    await registarAuditoria('UPDATE', 'mecanicos', id, null, { nome: body.nome, especialidade: body.especialidade }, request);

    return successResponse(updated[0]);
  } catch (error: any) {
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
      // Map snake_case to camelCase for Drizzle schema
      if (key === 'tarifa_horaria') updateObj.tarifaHoraria = body[key];
      else if (key === 'data_contratacao') updateObj.dataContratacao = body[key] ? new Date(body[key]) : null;
      else updateObj[key] = body[key];
    }

    await db.update(mecanicos).set(updateObj).where(eq(mecanicos.id, id));
    const updated = await db.select().from(mecanicos).where(eq(mecanicos.id, id));
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

    await db.delete(mecanicos).where(eq(mecanicos.id, id));
    await registarAuditoria('DELETE', 'mecanicos', id, null, null, request);
    return successResponse({ success: true });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


