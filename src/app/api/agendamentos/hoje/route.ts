import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { agendamentos, clientes, mecanicos, orcamentos } from '../../../../../drizzle/migrations/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDateValue(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return formatLocalDate(value);
  }

  return null;
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = formatLocalDate(today);
    const tomorrowStr = formatLocalDate(tomorrow);

    // Fetch agendamentos for today, join with clientes
    const agendamentosHoje = await db.select({
      id: agendamentos.id,
      matricula: agendamentos.matricula,
      modelo: agendamentos.modelo,
      marca: agendamentos.marca,
      ano: agendamentos.ano,
      prioridade: agendamentos.prioridade,
      estado: agendamentos.estado,
      titulo: agendamentos.titulo,
      descricao: agendamentos.descricao,
      horaInicio: agendamentos.horaInicio,
      contactoNome: agendamentos.contactoNome,
      contactoTelefone: agendamentos.contactoTelefone,
      contactoEmail: agendamentos.contactoEmail,
      mecanico_nome: mecanicos.nome,
      cliente_nome: clientes.nome,
      cliente_telefone: clientes.telefone,
      cliente_email: clientes.email,
      dataAgendamento: agendamentos.dataAgendamento // <-- campo necessário para o Kanban
    })
      .from(agendamentos)
      .leftJoin(clientes, eq(agendamentos.clienteId, clientes.id))
      .leftJoin(mecanicos, eq(agendamentos.mecanicoId, mecanicos.id))
      .where(and(
        gte(agendamentos.dataAgendamento, todayStr),
        lt(agendamentos.dataAgendamento, tomorrowStr)
      ))
      .orderBy(agendamentos.horaInicio);

    // Fetch orcamentos (only needed fields)
    const orcamentosHoje = await db.select({
      data_emissao: orcamentos.dataEmissao,
      cliente_id: orcamentos.clienteId,
      veiculo_id: orcamentos.veiculoId
    }).from(orcamentos);

    const budgetMatriculasByDate = new Set<string>();
    // Original logic was broken; removed veiculo relation dependency

    // Map to UI format
    const mapped = agendamentosHoje.map((agendamento) => {
      const normalizedDate = normalizeDateValue(agendamento.dataAgendamento);

      return {
      id: agendamento.id ? agendamento.id.toString() : '',
      ref_agendamento: agendamento.id ? `AGD-${agendamento.id}` : '',
      cliente_nome: agendamento.cliente_nome || null,
      cliente_telefone: agendamento.cliente_telefone || null,
      cliente_email: agendamento.cliente_email || null,
      veiculo_matricula: agendamento.matricula || 'N/A',
      veiculo_modelo: agendamento.modelo || agendamento.marca || 'N/A',
      veiculo_marca: agendamento.marca || '',
      veiculo_ano: agendamento.ano || '',
      prioridade: agendamento.prioridade || 'normal',
      estado: agendamento.estado || 'agendado',
      titulo: agendamento.titulo,
      descricao: agendamento.descricao || '',
      hora_agendamento: agendamento.horaInicio,
      mecanico_nome: agendamento.mecanico_nome || null,
      contacto_nome: agendamento.contactoNome || agendamento.cliente_nome || null,
      contacto_telefone: agendamento.contactoTelefone || agendamento.cliente_telefone || null,
      contacto_email: agendamento.contactoEmail || agendamento.cliente_email || null,
      dataAgendamento: normalizedDate,
      data_agendamento: normalizedDate,
    };
    });

    return NextResponse.json(mapped);
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
    console.error('Error fetching today appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}


