import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Fetch client
    const cliente = await prisma.clientes.findUnique({
      where: { id: clientId, ativo: true }
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Fetch vehicles for this client
    const veiculos = await prisma.veiculos.findMany({
      where: { cliente_id: clientId },
      orderBy: { criado_em: 'desc' }
    });

    // Fetch work orders for service history
    const ordensTrabalho = await prisma.ordens_trabalho.findMany({
      where: { cliente_id: clientId },
      orderBy: { criado_em: 'desc' }
    });

    const veiculoIds = Array.from(new Set(ordensTrabalho.map(o => o.veiculo_id).filter((v): v is number => v != null)));
    const mecanicoIds = Array.from(new Set(ordensTrabalho.map(o => o.mecanico_id).filter((v): v is number => v != null)));

    const [veiculosMapList, mecanicosMapList] = await Promise.all([
      veiculoIds.length ? prisma.veiculos.findMany({ where: { id: { in: veiculoIds } } }) : Promise.resolve([]),
      mecanicoIds.length ? prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds } } }) : Promise.resolve([]),
    ]);

    const veiculoMap = new Map(veiculosMapList.map(v => [Number((v.id as any)), v]));
    const mecanicoMap = new Map(mecanicosMapList.map(m => [m.id, m]));

    // Transform client data
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil: cliente.perfil === 'TVDE_Interno' ? 'TVDE Interno' : cliente.perfil === 'TVDE_Externo' ? 'TVDE Externo' : (cliente.perfil || 'Normal'),
      veiculos: veiculos.length,
      dataRegistro: cliente.data_registo ? cliente.data_registo.getFullYear().toString() : new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    };

    // Transform vehicles data
    const transformedVehicles = veiculos.map((veiculo) => ({
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id.toString(),
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultima_intervencao ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT') : ''
     
    }));

    // Transform service history from work orders
    const transformedServiceHistory = ordensTrabalho.map((ordem, index) => ({
      id: ordem.id.toString(),
      vehicleId: ordem.veiculo_id.toString(),
      vehicle: `${(veiculoMap.get(ordem.veiculo_id) as any)?.marca || ''} ${(veiculoMap.get(ordem.veiculo_id) as any)?.modelo || ''}`,
      date: ordem.criado_em ? ordem.criado_em.toLocaleDateString('pt-PT') : '',
      service: ordem.descricao_problema || 'Serviço realizado',
      description: ordem.trabalho_realizado || '',
      value: Number(ordem.total_geral),
      mechanic: ordem.mecanico_id != null ? (mecanicoMap.get(ordem.mecanico_id) as any)?.nome || '' : '',
      partsUsed: [] // TODO: Fetch from pecas_ordem_trabalho if needed
    }));

    // Calculate monthly expenses from work orders
    const monthlyExpenses = calculateMonthlyExpenses(ordensTrabalho);

    // Client stats
    const stats = {
      visits: cliente.visitas || 0,
      totalSpent: Number(cliente.total_gasto),
      monthlyExpenses
    };

    return NextResponse.json({
      client: transformedClient,
      vehicles: transformedVehicles,
      serviceHistory: transformedServiceHistory,
      stats
    });

  } catch (error) {
    console.error('Error fetching client details:', error);
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}

function calculateMonthlyExpenses(ordens: any[]): number[] {
  const monthlyTotals: { [key: string]: number } = {};

  ordens.forEach((ordem) => {
    if (ordem.criado_em) {
      const monthKey = `${ordem.criado_em.getFullYear()}-${String(ordem.criado_em.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(ordem.total_geral);
    }
  });

  // Get last 12 months
  const now = new Date();
  const expenses: number[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    expenses.push(monthlyTotals[key] || 0);
  }

  return expenses;
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Soft delete - mark as inactive
    const cliente = await prisma.clientes.update({
      where: { id: clientId },
      data: { ativo: false }
    });

    return NextResponse.json({ success: true, message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const body = await request.json();

    // Update client
    const perfilMap: Record<string, string> = {
      'TVDE Interno': 'TVDE_Interno',
      'TVDE Externo': 'TVDE_Externo'
    };

    const cliente = await prisma.clientes.update({
      where: { id: clientId },
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        nif: body.nif,
        endereco: body.endereco,
        perfil: perfilMap[body.perfil as string] || body.perfil
      }
    });

    // Transform and return updated client
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil: cliente.perfil === 'TVDE_Interno' ? 'TVDE Interno' : cliente.perfil === 'TVDE_Externo' ? 'TVDE Externo' : (cliente.perfil || 'Normal'),
      veiculos: 0,
      dataRegistro: cliente.data_registo ? cliente.data_registo.getFullYear().toString() : new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    };

    return NextResponse.json(transformedClient);

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}
