import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { veiculos, clientes, perfisClientes } from '../../../../../drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let matricula = searchParams.get('matricula');

    if (!matricula) {
      return NextResponse.json({ error: 'Matrícula is required' }, { status: 400 });
    }

    // Normalizar matrícula: remover hífens e deixar maiúscula
    const normalize = (str: string) => str.replace(/-/g, '').toUpperCase();
    const matriculaNorm = normalize(matricula);

    // Buscar todos veículos e comparar matrícula normalizada
    const veiculosList = await db.select().from(veiculos);
    const veiculo = veiculosList.find(v => normalize(v.matricula) === matriculaNorm);
    if (!veiculo) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    // Buscar cliente associado
    if (veiculo.clienteId == null) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, veiculo.clienteId));
    if (!cliente) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    // Buscar perfil_cliente associado (se existir)
    let perfilNome = 'Normal';
    if (cliente.perfilId) {
      const [perfil] = await db.select().from(perfisClientes).where(eq(perfisClientes.id, cliente.perfilId));
      if (perfil) perfilNome = perfil.nome;
    }
    const result = {
      found: true,
      vehicle: {
        id: veiculo.id.toString(),
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        matricula: veiculo.matricula
      },
      client: {
        id: cliente.id.toString(),
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        nif: cliente.nif,
        endereco: cliente.endereco,
        perfil_id: cliente.perfilId || null,
        perfil: perfilNome
      }
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
    console.error('Error searching vehicle:', error);
    return NextResponse.json({ error: 'Failed to search vehicle' }, { status: 500 });
  }
}


