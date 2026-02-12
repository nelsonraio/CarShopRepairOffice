import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matricula = searchParams.get('matricula');

    if (!matricula) {
      return NextResponse.json({ error: 'Matrícula is required' }, { status: 400 });
    }

    const veiculo = await prisma.veiculos.findUnique({
      where: { matricula },
      include: {
        cliente: true
      }
    });

    if (!veiculo || !veiculo.cliente) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const result = {
      found: true,
      vehicle: {
        id: veiculo.id.toString(),
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        matricula: veiculo.matricula
      },
      client: {
        id: veiculo.cliente.id.toString(),
        nome: veiculo.cliente.nome,
        telefone: veiculo.cliente.telefone,
        email: veiculo.cliente.email,
        nif: veiculo.cliente.nif,
        endereco: veiculo.cliente.endereco,
        perfil: veiculo.cliente.perfil
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching vehicle:', error);
    return NextResponse.json({ error: 'Failed to search vehicle' }, { status: 500 });
  }
}
