import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
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
        descricao: agendamento.descricao ?? ''
      };

      return NextResponse.json(transformedAgendamento);
    } else {
      // Fetch all appointments
      const agendamentos = await prisma.agendamentos.findMany({
        where: {
          estado: {
            in: ['agendado', 'em_andamento']
          }
        },
        orderBy: { data_agendamento: 'asc' }
      });

      const clienteIds = Array.from(new Set(agendamentos.map(a => a.cliente_id).filter((v): v is number => v != null)));
      const mecanicoIds = Array.from(new Set(agendamentos.map(a => a.mecanico_id).filter((v): v is number => v != null)));

      const [clientes, mecanicos] = await Promise.all([
        clienteIds.length ? prisma.clientes.findMany({ where: { id: { in: clienteIds } } }) : Promise.resolve([]),
        mecanicoIds.length ? prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds } } }) : Promise.resolve([]),
      ]);

      const clienteMap = new Map(clientes.map(c => [c.id, c]));
      const mecanicoMap = new Map(mecanicos.map(m => [m.id, m]));

      // Transform to match Appointment interface
      type Agendamento = any;
      type TransformedAgendamento = any;

      const transformedAgendamentos: TransformedAgendamento[] = agendamentos.map((agendamento: Agendamento) => ({
        id: agendamento.id.toString(),
        clientId: agendamento.cliente_id?.toString() || '',
        client: (clienteMap.get(agendamento.cliente_id as number) as any)?.nome || '',
        marca: agendamento.marca || '',
        modelo: agendamento.modelo || '',
        ano: agendamento.ano?.toString() || '',
        matricula: agendamento.matricula || '',
        title: agendamento.titulo,
        date: agendamento.data_agendamento.toLocaleDateString('pt-PT'),
        time: agendamento.hora_inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        mechanic: agendamento.mecanico_id != null ? (mecanicoMap.get(agendamento.mecanico_id) as any)?.nome || '' : '',
        tipoServico: agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
        status: agendamento.estado === 'em_andamento' ? 'em_andamento' : 'agendado',
        descricao: agendamento.descricao ?? ''
      }));

      return NextResponse.json(transformedAgendamentos);
    }
  } catch (error) {
    console.error('Error fetching agendamentos:', error);
    return NextResponse.json({ error: 'Failed to fetch agendamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente, marca, modelo, ano, matricula, data, hora, tipoServico, mecanico, descricao } = body;

    // find or create cliente by nome
    let clienteRec = null;
    if (cliente) {
      clienteRec = await prisma.clientes.findFirst({ where: { nome: cliente } });
      if (!clienteRec) {
        clienteRec = await prisma.clientes.create({ data: { nome: cliente, telefone: '', ativo: true } });
      }
    } else {
      // fallback to first cliente
      clienteRec = await prisma.clientes.findFirst();
    }

    if (!clienteRec) {
      return NextResponse.json({ error: 'No cliente available' }, { status: 400 });
    }

    // find or create mecanico by nome
    let mecanicoRec = null;
    if (mecanico) {
      mecanicoRec = await prisma.mecanicos.findFirst({ where: { nome: mecanico } });
      if (!mecanicoRec) {
        mecanicoRec = await prisma.mecanicos.create({ data: { nome: mecanico } });
      }
    }

    // build dates
    const [year, month, day] = data ? data.split('-').map((p: string) => parseInt(p, 10)) : [new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate()];
    const dateObj = new Date(year, (month || 1) - 1, day || 1);
    let horaInicio: Date | null = null;
    if (hora) {
      const [h, m] = hora.split(':').map((s: string) => parseInt(s, 10));
      horaInicio = new Date(dateObj);
      horaInicio.setHours(h ?? 9, m ?? 0, 0, 0);
    }

    const created = await prisma.agendamentos.create({ data: {
      cliente_id: clienteRec.id,
      mecanico_id: mecanicoRec ? mecanicoRec.id : null,
      titulo: cliente ? `${tipoServico || 'Agendamento'} - ${cliente}` : (tipoServico || 'Agendamento'),
      descricao: tipoServico || '',
      data_agendamento: dateObj,
      hora_inicio: horaInicio || new Date(dateObj.setHours(9,0,0,0)),
      estado: 'agendado',
      marca: marca || null,
      modelo: modelo || null,
      ano: ano ? parseInt(ano) : null,
      matricula: matricula || null
    }});

    return NextResponse.json({ success: true, id: String(created.id) });
  } catch (err) {
    console.error('Error creating agendamento:', err);
    return NextResponse.json({ error: 'Failed to create agendamento' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cliente, marca, modelo, ano, matricula, data, hora, tipoServico, mecanico, descricao } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // find or create cliente by nome
    let clienteRec = null;
    if (cliente) {
      clienteRec = await prisma.clientes.findFirst({ where: { nome: cliente } });
      if (!clienteRec) {
        clienteRec = await prisma.clientes.create({ data: { nome: cliente, telefone: '', ativo: true } });
      }
    }

    // find or create mecanico by nome
    let mecanicoRec = null;
    if (mecanico) {
      mecanicoRec = await prisma.mecanicos.findFirst({ where: { nome: mecanico } });
      if (!mecanicoRec) {
        mecanicoRec = await prisma.mecanicos.create({ data: { nome: mecanico } });
      }
    }

    // build dates
    const [year, month, day] = data ? data.split('-').map((p: string) => parseInt(p, 10)) : [new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate()];
    const dateObj = new Date(year, (month || 1) - 1, day || 1);
    let horaInicio: Date | null = null;
    if (hora) {
      const [h, m] = hora.split(':').map((s: string) => parseInt(s, 10));
      horaInicio = new Date(dateObj);
      horaInicio.setHours(h ?? 9, m ?? 0, 0, 0);
    }

    const updateData: any = {
      titulo: cliente ? `${tipoServico || 'Agendamento'} - ${cliente}` : (tipoServico || 'Agendamento'),
      descricao: descricao || '',
      data_agendamento: dateObj,
      hora_inicio: horaInicio || new Date(dateObj.setHours(9,0,0,0)),
      marca: marca || null,
      modelo: modelo || null,
      ano: ano ? parseInt(ano) : null,
      matricula: matricula || null
    };

    if (clienteRec) {
      updateData.cliente_id = clienteRec.id;
    }
    updateData.mecanico_id = mecanicoRec ? mecanicoRec.id : null;

    const updated = await prisma.agendamentos.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({ success: true, id: String(updated.id) });
  } catch (err) {
    console.error('Error updating agendamento:', err);
    return NextResponse.json({ error: 'Failed to update agendamento' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.agendamentos.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting agendamento:', err);
    return NextResponse.json({ error: 'Failed to delete agendamento' }, { status: 500 });
  }
}
