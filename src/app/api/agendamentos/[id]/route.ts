import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { agendamentos, clientes, mecanicos } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { registarAuditoria } from '@/lib/auditoria';


export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Buscar agendamento pelo ID
    const agendamentoArr = await db.select().from(agendamentos).where(eq(agendamentos.id, Number(id)));
    const agendamento = agendamentoArr[0];
    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento not found' }, { status: 404 });
    }

    // Buscar cliente e mecânico relacionados
    const cliente = agendamento.clienteId ? (await db.select().from(clientes).where(eq(clientes.id, agendamento.clienteId)))[0] : null;
    const mecanico = agendamento.mecanicoId ? (await db.select().from(mecanicos).where(eq(mecanicos.id, agendamento.mecanicoId)))[0] : null;

    // Converter datas
    const dataObj = agendamento.dataAgendamento ? new Date(agendamento.dataAgendamento) : null;

    // Transformar resposta
    const transformedAgendamento = {
      id: agendamento.id.toString(),
      clientId: agendamento.clienteId?.toString() || '',
      client: cliente?.nome || '',
      marca: agendamento.marca || '',
      modelo: agendamento.modelo || '',
      ano: agendamento.ano?.toString() || '',
      matricula: agendamento.matricula || '',
      veiculo_matricula: agendamento.matricula || '',
      title: agendamento.titulo,
      date: dataObj ? dataObj.toLocaleDateString('pt-PT') : '',
      time: agendamento.horaInicio ? agendamento.horaInicio.slice(0, 5) : '',
      mechanic: mecanico?.nome || '',
      tipoServico: agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
      status: agendamento.estado || 'agendado',
      notas: agendamento.descricao ?? '',
      contacto_nome: agendamento.contactoNome || null,
      contacto_telefone: agendamento.contactoTelefone || null,
      contacto_email: agendamento.contactoEmail || null
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

    // Buscar cliente pelo nome
    let clienteId = null;
    if (body.cliente) {
      const clienteArr = await db.select().from(clientes).where(eq(clientes.nome, body.cliente));
      clienteId = clienteArr[0]?.id || null;
    }

    // Buscar mecânico pelo nome
    let mecanicoId = null;
    if (body.mecanico) {
      const mecanicoArr = await db.select().from(mecanicos).where(eq(mecanicos.nome, body.mecanico));
      mecanicoId = mecanicoArr[0]?.id || null;
    }

    // Parse date and time com validação
    let dataAgendamento: Date | null = null;
    if (body.data && body.hora) {
      dataAgendamento = new Date(body.data);
      if (!isNaN(dataAgendamento.getTime())) {
        const [hora, minuto] = body.hora.split(":");
        dataAgendamento.setHours(parseInt(hora), parseInt(minuto), 0, 0);
      } else {
        dataAgendamento = null;
      }
    }

    // Criar título
    const titulo = body.tipoServico + (body.marca ? ` - ${body.marca}` : '') + (body.modelo ? ` ${body.modelo}` : '') + (body.matricula ? ` (${body.matricula})` : '');

    // Montar dados para update
    if (!dataAgendamento || isNaN(dataAgendamento.getTime())) {
      return NextResponse.json({ error: 'Data e hora do agendamento são obrigatórias e devem ser válidas.' }, { status: 400 });
    }
    const updateData: any = {
      titulo: titulo,
      dataAgendamento: dataAgendamento.toISOString().slice(0, 10),
      horaInicio: dataAgendamento.toTimeString().slice(0, 5),
      marca: body.marca || null,
      modelo: body.modelo || null,
      ano: body.ano ? parseInt(body.ano) : null,
      matricula: body.matricula || null,
      descricao: body.notas || null,
      estado: 'agendado',
      contactoNome: body.contacto_nome || null,
      contactoTelefone: body.contacto_telefone || null,
      contactoEmail: body.contacto_email || null
    };

    if (clienteId) updateData.clienteId = clienteId;
    if (mecanicoId) updateData.mecanicoId = mecanicoId;

    // Atualizar agendamento
    await db.update(agendamentos).set(updateData).where(eq(agendamentos.id, Number(id)));
    await registarAuditoria('UPDATE', 'agendamentos', parseInt(id), null, { titulo, data_agendamento: dataAgendamento, estado: 'agendado' }, request);
    // Buscar agendamento atualizado para resposta
    const agendamentoArr = await db.select().from(agendamentos).where(eq(agendamentos.id, Number(id)));
    const agendamento = agendamentoArr[0];
    return NextResponse.json({ success: true, agendamento });
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

    // Atualizar apenas o campo estado
    await db.update(agendamentos).set({ estado: body.estado }).where(eq(agendamentos.id, Number(id)));
    await registarAuditoria('UPDATE', 'agendamentos', parseInt(id), null, { estado: body.estado }, request);
    // Buscar agendamento atualizado para resposta
    const agendamentoArr = await db.select().from(agendamentos).where(eq(agendamentos.id, Number(id)));
    const agendamento = agendamentoArr[0];
    return NextResponse.json({ success: true, agendamento });
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


    // Eliminar o agendamento usando Drizzle
    await db.delete(agendamentos).where(eq(agendamentos.id, Number(id)));

    await registarAuditoria('DELETE', 'agendamentos', parseInt(id), null, null, request);

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


