import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { clientes, perfisClientes, mecanicos, veiculos, ordens_trabalho } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';

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

    // Fetch client with perfil name
    const clienteArr = await db.select({
      id: clientes.id,
      nome: clientes.nome,
      email: clientes.email,
      telefone: clientes.telefone,
      nif: clientes.nif,
      endereco: clientes.endereco,
      perfilId: clientes.perfilId,
      dataRegisto: clientes.dataRegisto,
      totalGasto: clientes.totalGasto,
      visitas: clientes.visitas,
      perfil_nome: perfisClientes.nome
    })
      .from(clientes)
      .leftJoin(perfisClientes, eq(clientes.perfilId, perfisClientes.id))
      .where(
        and(
          eq(clientes.id, clientId),
          eq(clientes.ativo, 1)
        )
      );
    const cliente = clienteArr[0];
    if (!cliente) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Fetch vehicles for this client
    const veiculosArr = await db.select().from(veiculos).where(eq(veiculos.clienteId, clientId));

    // Fetch work orders for service history
    const ordensArr = await db.select().from(ordens_trabalho).where(eq(ordens_trabalho.clienteId, clientId));

    // Get unique vehicle and mechanic IDs
    const veiculoIds = Array.from(new Set(ordensArr.map((o: any) => o.veiculoId).filter((v: any) => v != null)));
    const mecanicoIds = Array.from(new Set(ordensArr.map((o: any) => o.mecanicoId).filter((v: any) => v != null)));

    // Fetch related vehicles and mechanics
    // Helper for whereIn
    // Drizzle MySQL não suporta whereIn nativo, então filtramos em memória
    const veiculosMapList = veiculoIds.length ? (await db.select().from(veiculos)).filter((v: any) => veiculoIds.includes(Number(v.id))) : [];
    const mecanicosMapList = mecanicoIds.length ? (await db.select().from(mecanicos)).filter((m: any) => mecanicoIds.includes(m.id)) : [];
    const veiculoMap = new Map(veiculosMapList.map((v: any) => [Number(v.id), v]));
    const mecanicoMap = new Map(mecanicosMapList.map((m: any) => [m.id, m]));

    // Transform client data
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil_id: cliente.perfilId || null,
      perfil: cliente.perfil_nome || 'Normal',
      veiculos: veiculosArr.length,
      dataRegistro: cliente.dataRegisto || '',
      totalGasto: Number(cliente.totalGasto || 0),
      visitas: cliente.visitas || 0
    };

    // Transform vehicles data
    const transformedVehicles = veiculosArr.map((veiculo: any) => ({
      id: veiculo.id.toString(),
      clientId: veiculo.clienteId?.toString() || '',
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultimaIntervencao || ''
    }));

    // Transform service history from work orders
    const transformedServiceHistory = ordensArr.map((ordem: any) => ({
      id: ordem.id.toString(),
      vehicleId: ordem.veiculoId?.toString() || '',
      vehicle: `${(veiculoMap.get(Number(ordem.veiculoId)) as any)?.marca || ''} ${(veiculoMap.get(Number(ordem.veiculoId)) as any)?.modelo || ''}`,
      date: ordem.criadoEm || '',
      service: ordem.descricaoProblema || 'Serviço realizado',
      description: ordem.trabalhoRealizado || '',
      value: Number(ordem.totalGeral || 0),
      mechanic: ordem.mecanicoId != null ? (mecanicoMap.get(ordem.mecanicoId) as any)?.nome || '' : '',
      partsUsed: []
    }));

    // Calculate monthly expenses from work orders
    const monthlyTotals: Record<string, number> = {};
    ordensArr.forEach((ordem: any) => {
      if (ordem.criadoEm) {
        const date = new Date(ordem.criadoEm);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(ordem.totalGeral || 0);
      }
    });
    const now = new Date();
    const monthlyExpenses: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses.push(monthlyTotals[key] || 0);
    }

    // Client stats
    const stats = {
      visits: cliente.visitas || 0,
      totalSpent: Number(cliente.totalGasto || 0),
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
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
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
    await db
      .update(clientes)
      .set({ ativo: 0 })
      .where(eq(clientes.id, clientId));
    // Buscar cliente para auditoria
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clientId));
    if (!cliente) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
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
    if (body.perfil_id) {
      const perfilIdInt = typeof body.perfil_id === 'string' ? parseInt(body.perfil_id, 10) : body.perfil_id;
      if (isNaN(perfilIdInt)) {
        return NextResponse.json({ error: 'Perfil de cliente inválido (ID não numérico)' }, { status: 400 });
      }
      const perfilCliente = await db.select().from(perfisClientes).where(eq(perfisClientes.id, perfilIdInt));
      if (!perfilCliente.length) {
        return NextResponse.json({ error: 'Perfil de cliente inválido' }, { status: 400 });
      }
      body.perfil_id = perfilIdInt;
    }
    // Verifica se o NIF já existe em outro registo
    if (body.nif && body.nif.trim()) {
      const clienteComNif = (await db.select().from(clientes))
        .filter((c) => c.nif === body.nif.trim() && c.id !== clientId);
      if (clienteComNif.length) {
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
      updateData.perfilId = body.perfil_id;
    }
    // Get previous client for audit
    const clienteAnteriorArr = await db.select().from(clientes).where(eq(clientes.id, clientId));
    const clienteAnterior = clienteAnteriorArr[0];
    // Update client
    await db.update(clientes).set(updateData).where(eq(clientes.id, clientId));
    // Buscar cliente atualizado para auditoria
    const clienteArr = await db.select().from(clientes).where(eq(clientes.id, clientId));
    const cliente = clienteArr[0];
    if (!cliente) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    await registarAuditoria('UPDATE', 'clientes', clientId, { nome: clienteAnterior?.nome, email: clienteAnterior?.email, perfil_id: clienteAnterior?.perfilId }, updateData, request);
    // Get perfil name
    let perfil_nome = null;
    if (cliente.perfilId) {
      const perfilArr = await db.select().from(perfisClientes).where(eq(perfisClientes.id, cliente.perfilId));
      perfil_nome = perfilArr[0]?.nome || null;
    }
    // Transform and return updated client
    const transformedClient = {
      id: cliente.id.toString(),
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil_id: cliente.perfilId,
      perfil: perfil_nome,
      veiculos: 0,
      dataRegistro: cliente.dataRegisto || '',
      totalGasto: Number(cliente.totalGasto || 0),
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


