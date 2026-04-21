import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { veiculos, clientes, perfisClientes, ordensTrabalho, orcamentos } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';

const normalizeText = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ');
const normalizeNullable = (value: unknown) => {
  const normalized = normalizeText(value);
  return normalized || null;
};

async function findMatchingClient(body: Record<string, unknown>) {
  const clientName = normalizeText(body.clientName);
  const clientEmail = normalizeNullable(body.clientEmail);
  const clientPhone = normalizeNullable(body.clientPhone);
  const clientNif = normalizeNullable(body.clientNif);

  if (clientNif) {
    const [clientePorNif] = await db.select().from(clientes).where(eq(clientes.nif, clientNif)).limit(1);
    if (clientePorNif) return { client: clientePorNif, reason: 'nif' as const };
  }

  if (clientEmail) {
    const [clientePorEmail] = await db.select().from(clientes).where(eq(clientes.email, clientEmail)).limit(1);
    if (clientePorEmail) return { client: clientePorEmail, reason: 'email' as const };
  }

  if (clientPhone && clientName) {
    const [clientePorNomeTelefone] = await db.select().from(clientes)
      .where(and(eq(clientes.nome, clientName), eq(clientes.telefone, clientPhone)))
      .limit(1);
    if (clientePorNomeTelefone) return { client: clientePorNomeTelefone, reason: 'name_phone' as const };
  }

  if (clientName) {
    const clientesPorNome = await db.select().from(clientes).where(eq(clientes.nome, clientName)).limit(2);
    if (clientesPorNome.length === 1) {
      return { client: clientesPorNome[0], reason: 'name' as const };
    }

    if (clientesPorNome.length > 1) {
      return { client: null, reason: 'ambiguous_name' as const };
    }
  }

  return { client: null, reason: null };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const vehicleId = parseInt(id);
    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }
    // Fetch vehicle
    const [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, vehicleId));
    if (!veiculo) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    // Fetch client (with perfil)
    let cliente = null;
    let perfilNome = 'Normal';
    if (veiculo.clienteId) {
      [cliente] = await db.select().from(clientes).where(eq(clientes.id, veiculo.clienteId));
      if (cliente && cliente.perfilId) {
        const [perfil] = await db.select().from(perfisClientes).where(eq(perfisClientes.id, cliente.perfilId));
        if (perfil) perfilNome = perfil.nome;
      }
    }
    // Transform to match Vehicle interface
    const transformedVeiculo = {
      id: veiculo.id.toString(),
      clientId: veiculo.clienteId?.toString() || '',
      clientName: cliente?.nome || '',
      clientPhone: cliente?.telefone || '',
      clientEmail: cliente?.email || '',
      clientNif: cliente?.nif || '',
      clientAddress: cliente?.endereco || '',
      clientProfileId: cliente?.perfilId || null,
      clientProfile: perfilNome,
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      mileage: 0, // quilometragem not in schema
      vin: null,
      tipo_motor: null,
      tipo_combustivel: null,
      estado: veiculo.estado,
      ultima_intervencao: veiculo.ultimaIntervencao,
      proxima_revisao: null,
      companhia_seguros: null,
      apolice_seguro: null,
      validade_seguro: null,
      notas: null,
      criado_em: veiculo.criadoEm,
      atualizado_em: veiculo.atualizadoEm,
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultimaIntervencao ? new Date(veiculo.ultimaIntervencao).toLocaleDateString('pt-PT') : ''
    };
    return NextResponse.json(transformedVeiculo);
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
    console.error('Error fetching vehicle:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const vehicleId = parseInt(id);
    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }
    // Check if vehicle exists
    const [existingVehicle] = await db.select().from(veiculos).where(eq(veiculos.id, vehicleId));
    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    const body = await request.json();
    const clientName = normalizeText(body.clientName ?? body.clientSearch);
    const clientProfileId = body.perfil_id ?? body.clientProfileId;
    let clientId: number | null = body.clientId ? parseInt(body.clientId) : null;
    // Handle client creation/update if client data is provided
    if (clientName) {
      if (clientId) {
        // Update existing client
        await db.update(clientes)
          .set({
            nome: clientName,
            telefone: body.clientPhone || '',
            email: body.clientEmail || '',
            nif: body.clientNif || '',
            endereco: body.clientAddress || '',
            perfilId: clientProfileId ? parseInt(clientProfileId) : null,
            atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
          .where(eq(clientes.id, clientId));
      } else {
        const existingClientMatch = await findMatchingClient({
          ...body,
          clientName,
        });
        if (existingClientMatch.reason === 'ambiguous_name') {
          return NextResponse.json(
            { error: 'Já existem vários clientes com este nome. Selecione o cliente existente na pesquisa ou preencha NIF, email ou telefone para identificar corretamente.' },
            { status: 409 }
          );
        }

        if (existingClientMatch.client) {
          clientId = existingClientMatch.client.id;
        }
      }

      if (!clientId) {
        // Create new client
        const insertResult: any = await db.insert(clientes).values({
          nome: clientName,
          telefone: normalizeText(body.clientPhone),
          email: normalizeNullable(body.clientEmail),
          nif: normalizeNullable(body.clientNif),
          endereco: normalizeNullable(body.clientAddress),
          perfilId: clientProfileId ? parseInt(clientProfileId) : null,
          dataRegisto: new Date().toISOString().slice(0, 10),
          visitas: 0,
          totalGasto: '0.00',
          ativo: 1
        });
        // MySQL: get last insertId
        clientId = insertResult.insertId || insertResult[0]?.insertId;
      }
    }
    // Update vehicle
    const updateData: any = {
      marca: body.make,
      modelo: body.model,
      matricula: body.licensePlate,
      ano: body.year ? parseInt(body.year) : null,
      atualizadoEm: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    updateData.clienteId = clientId;
    await db.update(veiculos)
      .set(updateData)
      .where(eq(veiculos.id, vehicleId));
    // Fetch updated vehicle
    const [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, vehicleId));
    if (!veiculo) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    // Transform and return updated vehicle
    const transformedVehicle = {
      id: veiculo.id.toString(),
      clientId: veiculo.clienteId?.toString() || '',
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultimaIntervencao ? new Date(veiculo.ultimaIntervencao).toLocaleDateString('pt-PT') : ''
    };
    await registarAuditoria('UPDATE', 'veiculos', Number(vehicleId), { matricula: existingVehicle.matricula, marca: existingVehicle.marca, modelo: existingVehicle.modelo }, { marca: body.make, modelo: body.model, matricula: body.licensePlate }, request);
    return NextResponse.json(transformedVehicle);
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
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const vehicleId = parseInt(id);
    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }
    // Check if vehicle exists
    const [existingVehicle] = await db.select().from(veiculos).where(eq(veiculos.id, vehicleId));
    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    // Checar dependências (ordens_trabalho, orcamentos)
    let ordensCount = 0, orcamentosCount = 0;
    try {
      const [ordens] = await db.select({ count: sql<number>`count(*)` }).from(ordensTrabalho).where(eq(ordensTrabalho.veiculoId, vehicleId));
      ordensCount = Number(ordens?.count || 0);
    } catch {}
    try {
      const [orcamentosResult] = await db.select({ count: sql<number>`count(*)` }).from(orcamentos).where(eq(orcamentos.veiculoId, vehicleId));
      orcamentosCount = Number(orcamentosResult?.count || 0);
    } catch {}
    if (ordensCount > 0 || orcamentosCount > 0) {
      const refs = [];
      if (ordensCount > 0) refs.push(`${ordensCount} ordem(ns) de trabalho`);
      if (orcamentosCount > 0) refs.push(`${orcamentosCount} orçamento(s)`);
      return NextResponse.json(
        { error: `Não é possível eliminar o veículo. Existem ${refs.join(' e ')} associados.` },
        { status: 409 }
      );
    }
    // Delete the vehicle
    await db.delete(veiculos).where(eq(veiculos.id, vehicleId));
    await registarAuditoria('DELETE', 'veiculos', Number(vehicleId), { matricula: existingVehicle.matricula, marca: existingVehicle.marca, modelo: existingVehicle.modelo }, null, request);
    return NextResponse.json({ message: 'Vehicle deleted successfully' }, { status: 200 });
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
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}


