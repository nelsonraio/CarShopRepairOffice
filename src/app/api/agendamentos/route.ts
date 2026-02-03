import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const agendamentos = await prisma.agendamentos.findMany({
      include: {
        clientes: true,
        veiculos: true,
        mecanicos: true
      },
      where: {
        estado: {
          in: ['agendado', 'em_andamento']
        }
      },
      orderBy: { data_agendamento: 'asc' }
    });

    // Transform to match Appointment interface
    interface Agendamento {
      id: number;
      cliente_id: number;
      veiculo_id: number;
      titulo: string;
      data_agendamento: Date;
      hora_inicio: Date;
      mecanicos?: {
        nome: string;
      } | null;
      descricao?: string | null;
      estado: 'agendado' | 'em_andamento';
      notas?: string | null;
    }

    interface TransformedAgendamento {
      id: string;
      clientId: string;
      vehicleId: string;
      title: string;
      date: string;
      time: string;
      mechanic: string;
      tipoServico: string;
      status: 'agendado' | 'em_andamento';
      notes?: string;
    }

    const transformedAgendamentos: TransformedAgendamento[] = agendamentos.map((agendamento: Agendamento) => ({
      id: agendamento.id.toString(),
      clientId: agendamento.cliente_id.toString(),
      vehicleId: agendamento.veiculo_id.toString(),
      title: agendamento.titulo,
      date: agendamento.data_agendamento.toLocaleDateString('pt-PT'),
      time: agendamento.hora_inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      mechanic: agendamento.mecanicos?.nome || '',
      tipoServico: agendamento.descricao || '',
      status: agendamento.estado === 'em_andamento' ? 'em_andamento' : 'agendado',
      notes: agendamento.notas || undefined
    }));

    return NextResponse.json(transformedAgendamentos);
  } catch (error) {
    console.error('Error fetching agendamentos:', error);
    return NextResponse.json({ error: 'Failed to fetch agendamentos' }, { status: 500 });
  }
}
