import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const matricula = url.searchParams.get('matricula');

    if (!matricula) {
      return NextResponse.json({ error: 'Matrícula is required' }, { status: 400 });
    }

    // Find any appointment for this license plate (remove status and date filters)
    const agendamentos = await prisma.agendamentos.findMany({
      where: {
        matricula: matricula
      },
      include: {
        cliente: { include: { perfil_cliente: true } }
      },
      orderBy: {
        data_agendamento: 'desc' // Get the most recent appointment
      },
      take: 1 // Just get the first one
    });

    if (agendamentos.length === 0) {
      return NextResponse.json({ found: false });
    }

    const agendamento = agendamentos[0];

    if (!agendamento) {
      return NextResponse.json({ found: false });
    }

    // Return the vehicle and service data
    const result = {
      found: true,
      id: agendamento.id.toString(),
      estado: agendamento.estado || 'agendado',
      marca: agendamento.marca || '',
      modelo: agendamento.modelo || '',
      ano: agendamento.ano?.toString() || '',
      tipoServico: agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
      notas: agendamento.descricao || '',
      descricao: agendamento.descricao ? agendamento.descricao : (agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo),
      contacto_nome: agendamento.contacto_nome || null,
      contacto_telefone: agendamento.contacto_telefone || null,
      contacto_email: agendamento.contacto_email || null,
        cliente: agendamento.cliente ? {
          id: agendamento.cliente.id.toString(),
          nome: agendamento.cliente.nome,
          telefone: agendamento.cliente.telefone,
          email: agendamento.cliente.email || '',
          nif: agendamento.cliente.nif || '',
          endereco: agendamento.cliente.endereco || '',
          perfil_id: agendamento.cliente.perfil_id || null,
          perfil: agendamento.cliente.perfil_cliente ? agendamento.cliente.perfil_cliente.nome : 'Normal'
        } : null
    };

    return NextResponse.json(result);
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
    console.error('Error searching agendamentos:', error);
    return NextResponse.json({ error: 'Failed to search agendamentos' }, { status: 500 });
  }
}


