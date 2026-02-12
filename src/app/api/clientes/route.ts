import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      where: { ativo: true },
      orderBy: { criado_em: 'desc' }
    });

    // Transform to match Cliente interface
    const transformedClientes = clientes.map((cliente) => ({
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil: cliente.perfil === 'TVDE_Interno' ? 'TVDE Interno' : cliente.perfil === 'TVDE_Externo' ? 'TVDE Externo' : (cliente.perfil || 'Normal'),
      veiculos: 0, // TODO: Count vehicles for this client
      dataRegistro: cliente.data_registo ? cliente.data_registo.getFullYear().toString() : new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    }));

    return NextResponse.json(transformedClientes);
  } catch (error) {
    console.error('Error fetching clientes:', error);
    return NextResponse.json({ error: 'Failed to fetch clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create new client
    const perfilMap: Record<string, string> = {
      'TVDE Interno': 'TVDE_Interno',
      'TVDE Externo': 'TVDE_Externo'
    };

    const cliente = await prisma.clientes.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        nif: body.nif,
        endereco: body.endereco,
        perfil: perfilMap[body.perfil as string] || body.perfil,
        ativo: true,
        data_registo: new Date(),
        total_gasto: 0,
        visitas: 0
      }
    });

    // Transform and return created client
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil: cliente.perfil === 'TVDE_Interno' ? 'TVDE Interno' : (cliente.perfil || 'Normal'),
      veiculos: 0,
      dataRegistro: cliente.data_registo ? cliente.data_registo.getFullYear().toString() : new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    };

    return NextResponse.json(transformedClient, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
