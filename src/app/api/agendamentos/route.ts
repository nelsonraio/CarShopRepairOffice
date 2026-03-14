import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { PrismaClient } from '@prisma/client';
import { registarAuditoria } from '@/lib/auditoria';

/**
 * Initialize Prisma Client for database operations
 */
// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

/**
 * Helper: Parse date string (YYYY-MM-DD format)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or current date if invalid
 */
function parseDateString(dateString?: string): Date {
  if (!dateString) {
    return new Date();
  }
  const parts = dateString.split('-').map((p: string) => parseInt(p, 10) || 0);
  const year = parts[0] || new Date().getFullYear();
  const month = Math.max(1, parts[1] || 1);
  const day = Math.max(1, parts[2] || 1);
  return new Date(year, month - 1, day);
}

/**
 * Helper: Parse time string (HH:MM format) and set on date
 * @param timeString - Time string in HH:MM format
 * @param dateObj - Date object to apply time to
 * @returns Date with time applied, or 9:00 AM if invalid
 */
function parseTimeString(timeString: string | undefined, dateObj: Date): Date {
  if (!timeString) {
    return new Date(dateObj.setHours(9, 0, 0, 0));
  }
  const [h, m] = timeString.split(':').map((s: string) => parseInt(s, 10));
  const result = new Date(dateObj);
  result.setHours(h ?? 9, m ?? 0, 0, 0);
  return result;
}

/**
 * Helper: Transform appointment to API response format
 */
function formatAgendamentoResponse(agendamento: any, cliente?: any, mecanico?: any): any {
  return {
    id: agendamento.id.toString(),
    clientId: agendamento.cliente_id?.toString() || '',
    client: cliente?.nome || '',
    clientPhone: cliente?.telefone || '',
    clientEmail: cliente?.email || '',
    marca: agendamento.marca || '',
    modelo: agendamento.modelo || '',
    ano: agendamento.ano?.toString() || '',
    matricula: agendamento.matricula || '',
    title: agendamento.titulo,
    date: agendamento.data_agendamento.toLocaleDateString('pt-PT'),
    time: agendamento.hora_inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    mechanic: mecanico?.nome || '',
    tipoServico: agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
    status: agendamento.estado || 'agendado',
    descricao: agendamento.descricao ?? '',
    contacto_nome: agendamento.contacto_nome || '',
    contacto_telefone: agendamento.contacto_telefone || '',
    contacto_email: agendamento.contacto_email || ''
  };
}

/**
 * Helper: Find or create client by name
 */
async function getOrCreateCliente(clienteNome?: string) {
  if (clienteNome) {
    let cliente = await prisma.clientes.findFirst({ where: { nome: clienteNome } });
    if (!cliente) {
      cliente = await prisma.clientes.create({ 
        data: { nome: clienteNome, telefone: '', ativo: true } 
      });
    }
    return cliente;
  }
  // Fallback to first client
  return prisma.clientes.findFirst();
}

/**
 * Helper: Find or create mechanic by name
 */
async function getOrCreateMecanico(mecanicoNome?: string) {
  if (!mecanicoNome) return null;
  
  let mecanico = await prisma.mecanicos.findFirst({ where: { nome: mecanicoNome } });
  if (!mecanico) {
    mecanico = await prisma.mecanicos.create({ data: { nome: mecanicoNome } });
  }
  return mecanico;
}

/**
 * GET: Fetch appointments (single by ID or all filtered)
 */
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
        return successResponse({ error: 'Agendamento not found' }, 404);
      }

      // Get related data
      const cliente = agendamento.cliente_id 
        ? await prisma.clientes.findUnique({ where: { id: agendamento.cliente_id } }) 
        : null;
      const mecanico = agendamento.mecanico_id 
        ? await prisma.mecanicos.findUnique({ where: { id: agendamento.mecanico_id } }) 
        : null;

      return successResponse(formatAgendamentoResponse(agendamento, cliente, mecanico));
    } else {
      // Fetch all appointments
      const agendamentos = await prisma.agendamentos.findMany({
        where: {
          estado: { in: ['agendado', 'em_aprovacao', 'em_andamento'] }
        },
        orderBy: { data_agendamento: 'asc' }
      });

      // Filter by matricula: show highest priority status per license plate
      const filteredAgendamentos = agendamentos.filter((agendamento) => {
        if (!agendamento.matricula) return true;
        const sameMatricula = agendamentos.filter(a => a.matricula === agendamento.matricula);
        if (sameMatricula.length <= 1) return true;
        
        const prioridade = { 'em_andamento': 3, 'em_aprovacao': 2, 'agendado': 1 };
        const getPrioridade = (estado: string | null | undefined): number => 
          prioridade[estado as keyof typeof prioridade] || 0;
        
        const sorted = sameMatricula.sort((a, b) => getPrioridade(b.estado) - getPrioridade(a.estado));
        const firstSorted = sorted[0];
        return firstSorted ? agendamento.id === firstSorted.id : false;
      });

      // Fetch related data efficiently
      const clienteIds = Array.from(new Set(
        filteredAgendamentos
          .map(a => a.cliente_id)
          .filter((v): v is number => v !== null)
      ));
      const mecanicoIds = Array.from(new Set(
        filteredAgendamentos
          .map(a => a.mecanico_id)
          .filter((v): v is number => v !== null)
      ));

      const [clientes, mecanicos] = await Promise.all([
        clienteIds.length ? prisma.clientes.findMany({ where: { id: { in: clienteIds } } }) : Promise.resolve([]),
        mecanicoIds.length ? prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds } } }) : Promise.resolve([]),
      ]);

      const clienteMap = new Map(clientes.map(c => [c.id, c]));
      const mecanicoMap = new Map(mecanicos.map(m => [m.id, m]));

      const transformedAgendamentos = filteredAgendamentos.map(agendamento => 
        formatAgendamentoResponse(
          agendamento,
          clienteMap.get(agendamento.cliente_id as number),
          mecanicoMap.get(agendamento.mecanico_id as number)
        )
      );

      return successResponse(transformedAgendamentos);
    }
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Create new appointment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente, marca, modelo, ano, matricula, data, hora, tipoServico, mecanico, descricao, notas, contacto_nome, contacto_telefone, contacto_email } = body;

    const clienteRec = await getOrCreateCliente(cliente);
    if (!clienteRec) {
      return successResponse({ error: 'No cliente available' }, 400);
    }

    const mecanicoRec = await getOrCreateMecanico(mecanico);

    const dateObj = parseDateString(data);
    const horaInicio = parseTimeString(hora, dateObj);

    const created = await prisma.agendamentos.create({
      data: {
        cliente_id: clienteRec.id,
        mecanico_id: mecanicoRec?.id || null,
        titulo: cliente ? `${tipoServico || 'Agendamento'} - ${cliente}` : (tipoServico || 'Agendamento'),
        descricao: notas || descricao || '',
        data_agendamento: dateObj,
        hora_inicio: horaInicio,
        estado: 'agendado',
        marca: marca || null,
        modelo: modelo || null,
        ano: ano ? parseInt(ano) : null,
        matricula: matricula || null,
        contacto_nome: contacto_nome || null,
        contacto_telefone: contacto_telefone || null,
        contacto_email: contacto_email || null
      }
    });

    await registarAuditoria('CREATE', 'agendamentos', Number(created.id), null, { cliente: body.cliente, titulo: created.titulo, data: body.data, hora: body.hora }, request);

    return successResponse({ success: true, id: String(created.id) }, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * PUT: Update existing appointment
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cliente, marca, modelo, ano, matricula, data, hora, tipoServico, mecanico, descricao, notas, contacto_nome, contacto_telefone, contacto_email } = body;

    if (!id) {
      return successResponse({ error: 'ID is required' }, 400);
    }

    const clienteRec = await getOrCreateCliente(cliente);
    const mecanicoRec = await getOrCreateMecanico(mecanico);

    const dateObj = parseDateString(data);
    const horaInicio = parseTimeString(hora, dateObj);

    const updateData: any = {
      titulo: cliente ? `${tipoServico || 'Agendamento'} - ${cliente}` : (tipoServico || 'Agendamento'),
      descricao: notas || descricao || '',
      data_agendamento: dateObj,
      hora_inicio: horaInicio,
      marca: marca || null,
      modelo: modelo || null,
      ano: ano ? parseInt(ano) : null,
      matricula: matricula || null,
      contacto_nome: contacto_nome || null,
      contacto_telefone: contacto_telefone || null,
      contacto_email: contacto_email || null,
      mecanico_id: mecanicoRec?.id || null
    };

    if (clienteRec) {
      updateData.cliente_id = clienteRec.id;
    }

    const updated = await prisma.agendamentos.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    await registarAuditoria('UPDATE', 'agendamentos', parseInt(id), null, { titulo: body.tipoServico, data: body.data, hora: body.hora, estado: body.estado }, request);

    return successResponse({ success: true, id: String(updated.id) });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


