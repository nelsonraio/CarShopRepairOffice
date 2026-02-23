import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const mecanico = await prisma.mecanicos.update({
      where: { id },
      data: {
        nome: body.nome,
        especialidade: body.especialidade || null,
        telefone: body.telefone || null,
        email: body.email || null,
        tarifa_horaria: body.tarifa_horaria ? parseFloat(body.tarifa_horaria.toString()) : null,
        data_contratacao: body.data_contratacao ? new Date(body.data_contratacao) : null,
        ativo: body.ativo !== undefined ? body.ativo : true
      }
    });

    return NextResponse.json(mecanico);
  } catch (error: any) {
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
    console.error('Error updating mecanico:', error);
    return NextResponse.json({ 
      error: 'Failed to update mecanico',
      details: error.message 
    }, { status: 500 });
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

    const mecanico = await prisma.mecanicos.update({
      where: { id },
      data: body
    });

    return NextResponse.json(mecanico);
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
    console.error('Error patching mecanico:', error);
    return NextResponse.json({ error: 'Failed to patch mecanico' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.mecanicos.delete({
      where: { id }
    });

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
    console.error('Error deleting mecanico:', error);
    return NextResponse.json({ error: 'Failed to delete mecanico' }, { status: 500 });
  }
}


