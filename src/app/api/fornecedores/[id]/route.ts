import { NextResponse } from 'next/server';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { fornecedores } from '@/db/schema';
import { eq } from 'drizzle-orm';


export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id: rawId } = await params;
    const id = parseInt(rawId);

    // Prepare update data
    const updateData = {
      nome: body.nome,
      pessoa_contato: body.pessoa_contato || null,
      email: body.email || null,
      telefone: body.telefone || null,
      nif: body.nif || null,
      endereco: body.endereco || null,
      termos_pagamento: body.termos_pagamento || null,
      ativo: body.ativo !== undefined ? body.ativo : 1
    };

    await db.update(fornecedores).set(updateData).where(eq(fornecedores.id, id));
    await registarAuditoria('UPDATE', 'fornecedores', id, null, { nome: body.nome, email: body.email }, request);

    // Return updated fornecedor
    const [fornecedor] = await db.select().from(fornecedores).where(eq(fornecedores.id, id));
    return NextResponse.json(fornecedor);
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
    console.error('Error updating fornecedor:', error);
    return NextResponse.json({ error: 'Failed to update fornecedor' }, { status: 500 });
  }
}


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id: rawId } = await params;
    const id = parseInt(rawId);

    await db.update(fornecedores).set(body).where(eq(fornecedores.id, id));
    const [fornecedor] = await db.select().from(fornecedores).where(eq(fornecedores.id, id));
    return NextResponse.json(fornecedor);
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
    console.error('Error patching fornecedor:', error);
    return NextResponse.json({ error: 'Failed to patch fornecedor' }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);

    await db.delete(fornecedores).where(eq(fornecedores.id, id));
    await registarAuditoria('DELETE', 'fornecedores', id, null, null, request);
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
    console.error('Error deleting fornecedor:', error);
    return NextResponse.json({ error: 'Failed to delete fornecedor' }, { status: 500 });
  }
}


