import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

// @ts-ignore
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const vehicleId = BigInt(id);

    const veiculo = await prisma.veiculos.findUnique({
      where: { id: vehicleId },
      include: {
        cliente: { include: { perfil_cliente: true } }
      }
    });

    if (!veiculo) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Transform to match Vehicle interface
    const transformedVeiculo = {
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id?.toString() || '',
      clientName: veiculo.cliente?.nome || '',
      clientPhone: veiculo.cliente?.telefone || '',
      clientEmail: veiculo.cliente?.email || '',
      clientNif: veiculo.cliente?.nif || '',
      clientAddress: veiculo.cliente?.endereco || '',
      clientProfileId: veiculo.cliente?.perfil_id || null,
      clientProfile: veiculo.cliente?.perfil_cliente ? veiculo.cliente.perfil_cliente.nome : 'Normal',
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      mileage: 0, // quilometragem not in schema
      vin: veiculo.numero_chassis,
      tipo_motor: veiculo.tipo_motor,
      tipo_combustivel: veiculo.tipo_combustivel,
      estado: veiculo.estado,
      ultima_intervencao: veiculo.ultima_intervencao,
      proxima_revisao: veiculo.proxima_revisao,
      companhia_seguros: veiculo.companhia_seguros,
      apolice_seguro: veiculo.apolice_seguro,
      validade_seguro: veiculo.validade_seguro,
      notas: veiculo.notas,
      criado_em: veiculo.criado_em,
      atualizado_em: veiculo.atualizado_em,
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultima_intervencao ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT') : ''
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
    const vehicleId = BigInt(id);

    // Check if vehicle exists
    const existingVehicle = await prisma.veiculos.findUnique({
      where: { id: vehicleId }
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body = await request.json();

    let clientId: number | null = body.clientId ? parseInt(body.clientId) : null;

    // Handle client creation/update if client data is provided
    if (body.clientName) {
      if (clientId) {
        // Update existing client
        await prisma.clientes.update({
          where: { id: clientId },
          data: {
            nome: body.clientName,
            telefone: body.clientPhone || '',
            email: body.clientEmail || '',
            nif: body.clientNif || '',
            endereco: body.clientAddress || '',
            perfil_id: body.perfil_id ? parseInt(body.perfil_id) : null
          }
        });
      } else {
        // Create new client
        const newClient = await prisma.clientes.create({
          data: {
            nome: body.clientName,
            telefone: body.clientPhone || '',
            email: body.clientEmail || '',
            nif: body.clientNif || '',
            endereco: body.clientAddress || '',
            perfil_id: body.perfil_id ? parseInt(body.perfil_id) : null,
            data_registo: new Date(),
            visitas: 0,
            total_gasto: 0,
            ativo: true
          }
        });
        clientId = newClient.id;
      }
    }

    // Update vehicle
    const updateData: any = {
      marca: body.make,
      modelo: body.model,
      matricula: body.licensePlate,
      ano: body.year ? parseInt(body.year) : null,
      numero_chassis: body.vin || null,
      atualizado_em: new Date()
    };

    // Only update cliente_id if we have a valid clientId
    if (clientId !== null) {
      updateData.cliente_id = clientId;
    }

    const veiculo = await prisma.veiculos.update({
      where: { id: vehicleId },
      data: updateData
    });

    // Transform and return updated vehicle
    const transformedVehicle = {
      id: veiculo.id.toString(),
      clientId: veiculo.cliente_id?.toString() || '',
      make: veiculo.marca,
      model: veiculo.modelo,
      licensePlate: veiculo.matricula,
      year: veiculo.ano || new Date().getFullYear(),
      status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
      lastIntervention: veiculo.ultima_intervencao ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT') : ''
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
    const vehicleId = BigInt(id);

    // Check if vehicle exists
    const existingVehicle = await prisma.veiculos.findUnique({
      where: { id: vehicleId }
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check for related records that prevent deletion
    const [ordensCount, orcamentosCount] = await Promise.all([
      prisma.ordens_trabalho.count({ where: { veiculo_id: vehicleId } }),
      prisma.orcamentos.count({ where: { veiculo_id: vehicleId } }),
    ]);

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
    await prisma.veiculos.delete({
      where: { id: vehicleId }
    });

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


