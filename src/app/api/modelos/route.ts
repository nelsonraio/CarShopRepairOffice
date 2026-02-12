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

    let whereClause: any = {
      ativo: true
    };

    if (marcaId) {
      whereClause.marca_id = parseInt(marcaId);
    }

    const modelos = await prisma.modelos.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        tipo_veiculo: true,
        marca: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    // Convert BigInt id to string for JSON serialization
    const serializedModelos = modelos.map(modelo => ({
      id: String(modelo.id),
      nome: modelo.nome,
      tipo_veiculo: modelo.tipo_veiculo,
      marca: {
        id: String(modelo.marca.id),
        nome: modelo.marca.nome
      }
    }));

    return NextResponse.json(serializedModelos);
  } catch (error) {
    console.error('Error fetching modelos:', error);
    return NextResponse.json({ error: 'Failed to fetch modelos' }, { status: 500 });
  }
}
