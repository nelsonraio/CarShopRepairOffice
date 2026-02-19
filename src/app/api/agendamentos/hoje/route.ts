import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const agendamentos = await prisma.agendamentos.findMany({
      where: {
        data_agendamento: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        cliente: {
          select: {
            nome: true,
            telefone: true,
            email: true
          }
        }
      },
      orderBy: {
        hora_inicio: 'asc'
      }
    });

    const orcamentos = await prisma.orcamentos.findMany({
      select: {
        data_emissao: true,
        cliente_id: true,
        veiculo_id: true
      }
    });

    const budgetMatriculasByDate = new Set<string>();
    // Original logic was broken; removed veiculo relation dependency

    const filteredAgendamentos = agendamentos;

    // Map to UI format
    const mapped = filteredAgendamentos.map(agendamento => ({
      id: agendamento.id.toString(),
      ref_agendamento: `AGD-${agendamento.id}`,
      cliente_nome: agendamento.cliente.nome,
      cliente_telefone: agendamento.cliente.telefone || null,
      cliente_email: agendamento.cliente.email || null,
      veiculo_matricula: agendamento.matricula || 'N/A',
      veiculo_modelo: agendamento.modelo || agendamento.marca || 'N/A',
      prioridade: agendamento.prioridade || 'normal',
      estado: agendamento.estado || 'agendado',
      titulo: agendamento.titulo,
      descricao: agendamento.descricao || '',
      hora_agendamento: agendamento.hora_inicio,
      mecanico_nome: 'N/A' // Mecânico ainda não atribuído
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
