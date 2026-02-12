import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();

export async function GET() {
  try {
    const veiculos = await prisma.veiculos.findMany({
      include: {
        cliente: true // Include client data
      },
      orderBy: { criado_em: 'desc' }
    });

    // Transform to match Vehicle interface
    const transformedVeiculos = veiculos.map((veiculo) => ({
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id ? veiculo.cliente_id.toString() : '',
      clientName: veiculo.cliente ? veiculo.cliente.nome : 'Cliente não encontrado',
      clientProfile: veiculo.cliente ? (veiculo.cliente.perfil === 'TVDE_Interno' ? 'TVDE Interno' : veiculo.cliente.perfil === 'TVDE_Externo' ? 'TVDE Externo' : (veiculo.cliente.perfil || 'Normal')) : 'Normal',
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultima_intervencao ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT') : ''

    }));


    return NextResponse.json(transformedVeiculos);
  } catch (error) {
    console.error('Error fetching veiculos:', error);
    return NextResponse.json({ error: 'Failed to fetch veiculos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if client exists or create new one
    let clientId = body.clientId;
    if (clientId) {
      clientId = parseInt(clientId);
    }
    if (!clientId) {
      // Create new client
      const perfilMap: Record<string, string> = {
        'TVDE Interno': 'TVDE_Interno',
        'TVDE Externo': 'TVDE_Externo'
      };

      const newClient = await prisma.clientes.create({
        data: {
          nome: body.clientName,
          email: body.clientEmail || null,
          telefone: body.clientPhone,
          nif: body.clientNif || null,
          endereco: body.clientAddress || null,
          perfil: perfilMap[body.clientProfile as string] || body.clientProfile,
          ativo: true,
          data_registo: new Date(),
          total_gasto: 0,
          visitas: 0
        }
      });
      clientId = newClient.id;
    }

    // Create vehicle
    const veiculo = await prisma.veiculos.create({
      data: {
        cliente_id: clientId,
        marca: body.make,
        modelo: body.model,
        matricula: body.licensePlate,
        ano: body.year ? parseInt(body.year) : null,
        numero_chassis: body.vin || null,
        estado: 'disponivel',
        criado_em: new Date(),
        atualizado_em: new Date()
      }
    });

    // Transform and return created vehicle
    const transformedVehicle = {
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id ? veiculo.cliente_id.toString() : '',
      clientName: body.clientName,
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: ''
    };

    return NextResponse.json(transformedVehicle, { status: 201 });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
