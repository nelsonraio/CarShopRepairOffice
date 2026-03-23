
import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { agendamentos, clientes, perfisClientes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const matricula = url.searchParams.get('matricula');

    if (!matricula) {
      return NextResponse.json({ error: 'Matrícula is required' }, { status: 400 });
    }

    // Buscar agendamento mais recente para a matrícula
    const ags = await db.select().from(agendamentos).where(eq(agendamentos.matricula, matricula)).orderBy(desc(agendamentos.dataAgendamento));
    if (!ags.length) {
      return NextResponse.json({ found: false });
    }
    const agendamento = ags[0];
    if (!agendamento) {
      return NextResponse.json({ found: false });
    }

    // Buscar cliente e perfil
    let cliente = null;
    let perfil = 'Normal';
    if (agendamento.clienteId) {
      const [cli] = await db.select().from(clientes).where(eq(clientes.id, agendamento.clienteId));
      if (cli) {
        cliente = {
          id: cli.id.toString(),
          nome: cli.nome,
          telefone: cli.telefone,
          email: cli.email || '',
          nif: cli.nif || '',
          endereco: cli.endereco || '',
          perfil_id: cli.perfilId || null,
        };
        if (cli.perfilId) {
          const [perfilObj] = await db.select().from(perfisClientes).where(eq(perfisClientes.id, cli.perfilId));
          if (perfilObj) perfil = perfilObj.nome;
        }
      }
    }

    const result = {
      found: true,
      id: agendamento.id.toString(),
      estado: agendamento.estado || 'agendado',
      marca: agendamento.marca || '',
      modelo: agendamento.modelo || '',
      ano: agendamento.ano?.toString() || '',
      tipoServico: agendamento.titulo && agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo,
      notas: agendamento.descricao || '',
      descricao: agendamento.descricao ? agendamento.descricao : (agendamento.titulo && agendamento.titulo.includes(' - ') ? agendamento.titulo.split(' - ')[0] : agendamento.titulo),
      contacto_nome: agendamento.contactoNome || null,
      contacto_telefone: agendamento.contactoTelefone || null,
      contacto_email: agendamento.contactoEmail || null,
      cliente: cliente ? { ...cliente, perfil } : null
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


