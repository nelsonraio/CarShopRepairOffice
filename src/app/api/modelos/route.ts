import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marcaId = searchParams.get('marca_id');
    const all = searchParams.get('all') === 'true';

    let whereClause: any = all ? {} : { ativo: true };

    if (marcaId) {
      whereClause.marca_id = parseInt(marcaId);
    }

    const modelos = await prisma.modelos.findMany({
      where: whereClause,
      include: {
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(modelos);
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
    console.error('Error fetching modelos:', error);
    return NextResponse.json({ error: 'Failed to fetch modelos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const modelo = await prisma.modelos.create({
      data: {
        marca_id: parseInt(body.marca_id),
        nome: body.nome,
        tipo_veiculo: body.tipo_veiculo || null,
        ativo: body.ativo !== undefined ? body.ativo : true
      },
      include: {
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

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
    console.error('Error creating modelo:', error);
    return NextResponse.json({ error: 'Failed to create modelo' }, { status: 500 });
  }
}


