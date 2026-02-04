import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/client';

// @ts-ignore
const prisma = new PrismaClient();

export async function GET() {
  try {
    const veiculos = await prisma.veiculos.findMany({
      // @ts-ignore
      include: {
        clientes: true // Include client data for transformation
      },
      orderBy: { criado_em: 'desc' }
    });

    // Transform to match Vehicle interface
    const transformedVeiculos = veiculos.map((veiculo) => ({
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id.toString(),
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultima_intervencao ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT') : '',
      mileage: veiculo.quilometragem || 0
    }));

    return NextResponse.json(transformedVeiculos);
  } catch (error) {
    console.error('Error fetching veiculos:', error);
    return NextResponse.json({ error: 'Failed to fetch veiculos' }, { status: 500 });
  }
}
