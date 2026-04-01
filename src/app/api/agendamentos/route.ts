import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';

import { db } from '@/db/connection';
import { agendamentos, clientes, mecanicos } from '../../../../drizzle/migrations/schema';
import { eq, inArray } from 'drizzle-orm';

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
  // Aceitar snake_case e camelCase para data/hora
  const dataRaw = agendamento.data_agendamento || agendamento.dataAgendamento;
  const horaRaw = agendamento.hora_inicio || agendamento.horaInicio;
  const dataObj = dataRaw ? new Date(dataRaw) : null;
  let horaStr = '';
  if (typeof horaRaw === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(horaRaw)) {
    // Aceita HH:MM ou HH:MM:SS
    horaStr = horaRaw.slice(0,5);
  }
  return {
    id: agendamento.id.toString(),
    clientId: agendamento.cliente_id?.toString() || agendamento.clienteId?.toString() || '',
    client: cliente?.nome || '',
    clientPhone: cliente?.telefone || '',
    clientEmail: cliente?.email || '',
    marca: agendamento.marca || '',
    modelo: agendamento.modelo || '',
    ano: agendamento.ano?.toString() || '',
    matricula: agendamento.matricula || '',
    title: agendamento.titulo,
    date: dataObj ? dataObj.toLocaleDateString('pt-PT') : '',
    time: horaStr,
    mechanic: mecanico?.nome || '',
    tipoServico: agendamento.titulo && agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
    status: agendamento.estado || 'agendado',
    descricao: agendamento.descricao ?? '',
    contacto_nome: agendamento.contacto_nome || agendamento.contactoNome || '',
    contacto_telefone: agendamento.contacto_telefone || agendamento.contactoTelefone || '',
    contacto_email: agendamento.contacto_email || agendamento.contactoEmail || ''
  };
}

/**
 * Helper: Find or create client by name
 */
async function getOrCreateCliente(clienteNome?: string) {
  if (clienteNome) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.nome, clienteNome));
    return cliente || null;
  }
  // Não cria cliente novo, retorna null
  return null;
}

/**
 * Helper: Find or create mechanic by name
 */
async function getOrCreateMecanico(mecanicoNome?: string) {
  if (!mecanicoNome) return null;
  const [mecanico] = await db.select().from(mecanicos).where(eq(mecanicos.nome, mecanicoNome));
  if (mecanico) return mecanico;
  await db.insert(mecanicos).values({ nome: mecanicoNome });
  const [novoMecanico] = await db.select().from(mecanicos).where(eq(mecanicos.nome, mecanicoNome));
  return novoMecanico;
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
      const [agendamento] = await db.select().from(agendamentos).where(eq(agendamentos.id, parseInt(id)));
      if (!agendamento) {
        return successResponse({ error: 'Agendamento not found' }, 404);
      }
      const [cliente] = agendamento.clienteId ? await db.select().from(clientes).where(eq(clientes.id, agendamento.clienteId)) : [null];
      const [mecanico] = agendamento.mecanicoId ? await db.select().from(mecanicos).where(eq(mecanicos.id, agendamento.mecanicoId)) : [null];
      return successResponse(formatAgendamentoResponse(agendamento, cliente, mecanico));
    } else {
      // Fetch all appointments
      const ags = await db.select().from(agendamentos);
      // Filter by estado
      const agendamentosFiltrados = ags.filter(a => a.estado != null && ['agendado', 'em_aprovacao', 'em_andamento'].includes(a.estado));
      // Filter by matricula: show highest priority status per license plate
      const filteredAgendamentos = agendamentosFiltrados.filter((agendamento) => {
        if (!agendamento.matricula) return true;
        const sameMatricula = agendamentosFiltrados.filter(a => a.matricula === agendamento.matricula);
        if (sameMatricula.length <= 1) return true;
        const prioridade = { 'em_andamento': 3, 'em_aprovacao': 2, 'agendado': 1 };
        const getPrioridade = (estado: string | null | undefined): number => prioridade[estado as keyof typeof prioridade] || 0;
        const sorted = sameMatricula.sort((a, b) => getPrioridade(b.estado) - getPrioridade(a.estado));
        const firstSorted = sorted[0];
        return firstSorted ? agendamento.id === firstSorted.id : false;
      });
      // Fetch related data efficiently
      const clienteIds = Array.from(new Set(filteredAgendamentos.map(a => a.clienteId).filter((v): v is number => v !== null)));
      const mecanicoIds = Array.from(new Set(filteredAgendamentos.map(a => a.mecanicoId).filter((v): v is number => v !== null)));
      const clientesArr = clienteIds.length ? await db.select().from(clientes).where(inArray(clientes.id, clienteIds)) : [];
      const mecanicosArr = mecanicoIds.length ? await db.select().from(mecanicos).where(inArray(mecanicos.id, mecanicoIds)) : [];
      const clienteMap = new Map(clientesArr.map(c => [c.id, c]));
      const mecanicoMap = new Map(mecanicosArr.map(m => [m.id, m]));
      const transformedAgendamentos = filteredAgendamentos.map(agendamento => formatAgendamentoResponse(
        agendamento,
        clienteMap.get(agendamento.clienteId as number),
        mecanicoMap.get(agendamento.mecanicoId as number)
      ));
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

    // Validação obrigatória da hora
    if (!hora || typeof hora !== 'string' || !/^\d{2}:\d{2}$/.test(hora)) {
      return new Response(JSON.stringify({ error: 'O campo hora é obrigatório e deve estar no formato HH:MM.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const clienteRec = await getOrCreateCliente(cliente);
    const mecanicoRec = await getOrCreateMecanico(mecanico);
    const dateObj = parseDateString(data);
    console.log('DEBUG - data recebida:', data);
    console.log('DEBUG - dataAgendamento gravada:', dateObj.toISOString().slice(0, 10));
    const horaInicio = parseTimeString(hora, dateObj);
    const result = await db.insert(agendamentos).values({
      clienteId: clienteRec ? clienteRec.id : null,
      mecanicoId: mecanicoRec?.id || null,
      titulo: cliente ? `${tipoServico || 'Agendamento'} - ${cliente}` : (tipoServico || 'Agendamento'),
      descricao: notas || descricao || '',
      dataAgendamento: data,
      horaInicio: horaInicio.toTimeString().slice(0, 5),
      estado: 'agendado',
      marca: marca || null,
      modelo: modelo || null,
      ano: ano ? parseInt(ano) : null,
      matricula: matricula || null,
      contactoNome: contacto_nome || null,
      contactoTelefone: contacto_telefone || null,
      contactoEmail: contacto_email || null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertedId = (result as any)?.[0]?.insertId ?? null;
    await registarAuditoria('CREATE', 'agendamentos', Number(insertedId), null, { cliente: body.cliente, titulo: body.titulo, data: body.data, hora: body.hora }, request);
    return successResponse({ success: true, id: String(insertedId) }, 201);
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

    await db.update(agendamentos)
      .set(updateData)
      .where(eq(agendamentos.id, parseInt(id)));
    await registarAuditoria('UPDATE', 'agendamentos', parseInt(id), null, { titulo: body.tipoServico, data: body.data, hora: body.hora, estado: body.estado }, request);
    return successResponse({ success: true, id: String(id) });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


