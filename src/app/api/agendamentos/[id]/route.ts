import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Fetch single appointment
    const agendamento = await prisma.agendamentos.findUnique({
      where: { id: parseInt(id) }
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento not found' }, { status: 404 });
    }

    // Get related data
    const cliente = agendamento.cliente_id ? await prisma.clientes.findUnique({ where: { id: agendamento.cliente_id } }) : null;
    const mecanico = agendamento.mecanico_id ? await prisma.mecanicos.findUnique({ where: { id: agendamento.mecanico_id } }) : null;

    // Transform to match Appointment interface
    const transformedAgendamento = {
      id: agendamento.id.toString(),
      clientId: agendamento.cliente_id?.toString() || '',
      client: cliente?.nome || '',
      marca: agendamento.marca || '',
      modelo: agendamento.modelo || '',
      ano: agendamento.ano?.toString() || '',
      matricula: agendamento.matricula || '',
      veiculo_matricula: agendamento.matricula || '', // Para compatibilidade com orçamentos
      title: agendamento.titulo,
      date: agendamento.data_agendamento.toLocaleDateString('pt-PT'),
      time: agendamento.hora_inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      mechanic: mecanico?.nome || '',
      tipoServico: agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
      status: agendamento.estado || 'agendado',
      notas: agendamento.descricao ?? '',
      contacto_nome: agendamento.contacto_nome || null,
      contacto_telefone: agendamento.contacto_telefone || null,
      contacto_email: agendamento.contacto_email || null
    };

    return NextResponse.json(transformedAgendamento);
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
    console.error('Error fetching agendamento:', error);
    return NextResponse.json({ error: 'Failed to fetch agendamento' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Find the client by name
    let clienteId = null;
    if (body.cliente) {
      const cliente = await prisma.clientes.findFirst({
        where: { nome: body.cliente }
      });
      clienteId = cliente?.id || null;
    }

    // Find the mechanic by name
    let mecanicoId = null;
    if (body.mecanico) {
      const mecanico = await prisma.mecanicos.findFirst({
        where: { nome: body.mecanico }
      });
      mecanicoId = mecanico?.id || null;
    }

    // Parse date and time
    const dataAgendamento = new Date(body.data);
    const [hora, minuto] = body.hora.split(':');
    dataAgendamento.setHours(parseInt(hora), parseInt(minuto), 0, 0);

    // Create the title
    const titulo = body.tipoServico + (body.marca ? ` - ${body.marca}` : '') + (body.modelo ? ` ${body.modelo}` : '') + (body.matricula ? ` (${body.matricula})` : '');

    // Update the appointment
    const updateData: any = {
      titulo: titulo,
      data_agendamento: dataAgendamento,
      hora_inicio: dataAgendamento,
      marca: body.marca || null,
      modelo: body.modelo || null,
      ano: body.ano ? parseInt(body.ano) : null,
      matricula: body.matricula || null,
      descricao: body.notas || null,
      estado: 'agendado',
      contacto_nome: body.contacto_nome || null,
      contacto_telefone: body.contacto_telefone || null,
      contacto_email: body.contacto_email || null
    };

    // Only add cliente_id if it's not null
    if (clienteId !== null) {
      updateData.cliente_id = clienteId;
    }

    // Only add mecanico_id if it's not null
    if (mecanicoId !== null) {
      updateData.mecanico_id = mecanicoId;
    }

    const updatedAgendamento = await prisma.agendamentos.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Convert BigInt to string for JSON serialization
    const response = {
      ...updatedAgendamento,
      id: updatedAgendamento.id.toString()
    };

    return NextResponse.json({ success: true, agendamento: response });
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
    console.error('Error updating agendamento:', error);
    return NextResponse.json({ error: 'Failed to update agendamento' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Update only the estado field
    const updatedAgendamento = await prisma.agendamentos.update({
      where: { id: parseInt(id) },
      data: {
        estado: body.estado
      }
    });

    // Convert BigInt fields to string/number for JSON serialization
    const serializedAgendamento = {
      ...updatedAgendamento,
      id: Number(updatedAgendamento.id),
      cliente_id: updatedAgendamento.cliente_id ? Number(updatedAgendamento.cliente_id) : null,
      mecanico_id: updatedAgendamento.mecanico_id ? Number(updatedAgendamento.mecanico_id) : null,
    };

    return NextResponse.json({ success: true, agendamento: serializedAgendamento });
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
    console.error('Error updating agendamento estado:', error);
    return NextResponse.json({ error: 'Failed to update agendamento' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Delete the appointment
    await prisma.agendamentos.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'Agendamento deleted' });
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
    console.error('Error deleting agendamento:', error);
    return NextResponse.json({ error: 'Failed to delete agendamento' }, { status: 500 });
  }
}


