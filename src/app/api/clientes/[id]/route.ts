import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

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
      where: { id: clientId, ativo: true },
      include: { perfil_cliente: true }
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

    const veiculoIds = Array.from(new Set(ordensTrabalho.map((o: typeof ordensTrabalho[number]) => o.veiculo_id).filter((v: bigint | null | undefined): v is bigint => v != null)));
    const mecanicoIds = Array.from(new Set(ordensTrabalho.map((o: typeof ordensTrabalho[number]) => o.mecanico_id).filter((v: number | null | undefined): v is number => v != null)));

    const [veiculosMapList, mecanicosMapList] = await Promise.all([
      veiculoIds.length ? prisma.veiculos.findMany({ where: { id: { in: veiculoIds } } }) : Promise.resolve([]),
      mecanicoIds.length ? prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds } } }) : Promise.resolve([]),
    ]);

    const veiculoMap = new Map(veiculosMapList.map((v: typeof veiculosMapList[number]) => [Number((v.id as any)), v]));
    const mecanicoMap = new Map(mecanicosMapList.map((m: typeof mecanicosMapList[number]) => [m.id, m]));

    // Transform client data
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil_id: cliente.perfil_id || null,
      perfil: cliente.perfil_cliente ? cliente.perfil_cliente.nome : 'Normal',
      veiculos: veiculos.length,
      dataRegistro: cliente.data_registo ? cliente.data_registo.getFullYear().toString() : new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    };

    // Transform vehicles data
    const transformedVehicles = veiculos.map((veiculo: typeof veiculos[number]) => ({
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id?.toString() || '',
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultima_intervencao ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT') : ''
     
    }));

    // Transform service history from work orders
    const transformedServiceHistory = ordensTrabalho.map((ordem: typeof ordensTrabalho[number], index: number) => ({
      id: ordem.id.toString(),
      vehicleId: ordem.veiculo_id.toString(),
      vehicle: `${(veiculoMap.get(Number(ordem.veiculo_id)) as any)?.marca || ''} ${(veiculoMap.get(Number(ordem.veiculo_id)) as any)?.modelo || ''}`,
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

    await registarAuditoria('DELETE', 'clientes', clientId, { nome: cliente.nome }, null, request);

    return NextResponse.json({ success: true, message: 'Client deleted successfully' });

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

    // Verifica se o perfil_id existe
    let perfilCliente = null;
    if (body.perfil_id) {
      const perfilIdInt = typeof body.perfil_id === 'string' ? parseInt(body.perfil_id, 10) : body.perfil_id;
      if (isNaN(perfilIdInt)) {
        return NextResponse.json({ error: 'Perfil de cliente inválido (ID não numérico)' }, { status: 400 });
      }
      perfilCliente = await prisma.perfis_clientes.findUnique({ where: { id: perfilIdInt } });
      if (!perfilCliente) {
        return NextResponse.json({ error: 'Perfil de cliente inválido' }, { status: 400 });
      }
      body.perfil_id = perfilIdInt;
    }

    // Verifica se o NIF já existe em outro registo
    if (body.nif && body.nif.trim()) {
      const clienteComNif = await prisma.clientes.findFirst({
        where: {
          nif: body.nif.trim(),
          NOT: { id: clientId } // Exclude current client
        }
      });

      if (clienteComNif) {
        return NextResponse.json(
          { error: 'NIF já existe noutro cliente' },
          { status: 409 }
        );
      }
    }

    // Constrói objeto de dados apenas com campos fornecidos
    const updateData: any = {};
    if (body.nome !== undefined && body.nome !== null) {
      updateData.nome = body.nome;
    }
    if (body.email !== undefined && body.email !== null) {
      updateData.email = body.email;
    }
    if (body.telefone !== undefined && body.telefone !== null) {
      updateData.telefone = body.telefone;
    }
    if (body.nif !== undefined && body.nif !== null) {
      const nifTrimmed = body.nif.trim();
      updateData.nif = nifTrimmed === '' ? null : nifTrimmed;
    }
    if (body.endereco !== undefined && body.endereco !== null) {
      updateData.endereco = body.endereco;
    }
    if (body.perfil_id !== undefined) {
      updateData.perfil_id = body.perfil_id;
    }

    const clienteAnterior = await prisma.clientes.findUnique({ where: { id: clientId } });

    const cliente = await prisma.clientes.update({
      where: { id: clientId },
      data: updateData,
      include: { perfil_cliente: true }
    });

    await registarAuditoria('UPDATE', 'clientes', clientId, { nome: clienteAnterior?.nome, email: clienteAnterior?.email, perfil_id: clienteAnterior?.perfil_id }, updateData, request);

    // Transform and return updated client
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil_id: cliente.perfil_id,
      perfil: cliente.perfil_cliente ? cliente.perfil_cliente.nome : null,
      veiculos: 0,
      dataRegistro: cliente.data_registo ? cliente.data_registo.getFullYear().toString() : new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    };

    return NextResponse.json(transformedClient);

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
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}


