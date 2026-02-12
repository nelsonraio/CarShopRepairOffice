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
      title: agendamento.titulo,
      date: agendamento.data_agendamento.toLocaleDateString('pt-PT'),
      time: agendamento.hora_inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      mechanic: mecanico?.nome || '',
      tipoServico: agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
      status: agendamento.estado === 'em_andamento' ? 'em_andamento' : 'agendado',
      notas: agendamento.notas ?? ''
    };

    return NextResponse.json(transformedAgendamento);
  } catch (error) {
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
    const updatedAgendamento = await prisma.agendamentos.update({
      where: { id: parseInt(id) },
      data: {
        cliente_id: clienteId,
        mecanico_id: mecanicoId,
        titulo: titulo,
        data_agendamento: dataAgendamento,
        hora_inicio: dataAgendamento,
        marca: body.marca || null,
        modelo: body.modelo || null,
        ano: body.ano ? parseInt(body.ano) : null,
        matricula: body.matricula || null,
        notas: body.notas || null,
        estado: 'agendado'
      }
    });

    return NextResponse.json({ success: true, agendamento: updatedAgendamento });
  } catch (error) {
    console.error('Error updating agendamento:', error);
    return NextResponse.json({ error: 'Failed to update agendamento' }, { status: 500 });
  }
}
