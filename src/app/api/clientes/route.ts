import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/client';
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
      perfil: cliente.perfil === 'TVDE_Interno' ? 'TVDE Interno' : (cliente.perfil || 'Normal'),
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
