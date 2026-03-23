
import { db } from '@/db/connection';
import { clientes, perfisClientes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';


// Formata cliente para retorno na API
const formatClienteResponse = (cliente: any) => ({
  id: cliente.id,
  nome: cliente.nome,
  email: cliente.email || '',
  telefone: cliente.telefone,
  nif: cliente.nif || '',
  endereco: cliente.endereco || '',
  perfil: cliente.perfil_nome || 'Normal',
  veiculos: 0,
  dataRegistro: cliente.dataRegisto || '',
  totalGasto: Number(cliente.totalGasto || cliente.total_gasto || 0),
  visitas: cliente.visitas || 0
});

export async function GET() {
  try {
    // Join clientes with perfis_clientes to get perfil name
    const clientesArr = await db
      .select({
        cliente: clientes,
        perfil_nome: perfisClientes.nome
      })
      .from(clientes)
      .leftJoin(perfisClientes, eq(clientes.perfilId, perfisClientes.id))
      .where(eq(clientes.ativo, 1));
    return successResponse(clientesArr.map(({ cliente, perfil_nome }) => formatClienteResponse({ ...cliente, perfil_nome })));
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, nif, endereco, perfil_id } = await request.json();

    if (!nome) {
      return successResponse({ error: 'Nome é obrigatório' }, 400);
    }

    // Verifica se o perfil_id existe
    if (perfil_id) {
      const perfilCliente = await db.select().from(perfisClientes).where(eq(perfisClientes.id, perfil_id));
      if (!perfilCliente.length) {
        return successResponse({ error: 'Perfil de cliente inválido' }, 400);
      }
    }

    // Cria cliente
    const insertResult: any = await db.insert(clientes).values({
      nome,
      email: email || null,
      telefone,
      nif: nif || null,
      endereco: endereco || null,
      perfilId: perfil_id || null,
      ativo: 1,
      dataRegisto: new Date().toISOString().slice(0, 10),
      totalGasto: '0.00',
      visitas: 0
    });
    // MySQL: get last insertId
    const insertedId = insertResult.insertId || insertResult[0]?.insertId;
    if (!insertedId) {
      return handleDatabaseError(new Error('Failed to create cliente'));
    }
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, insertedId));
    if (!cliente) {
      return handleDatabaseError(new Error('Created cliente not found'));
    }

    await registarAuditoria('CREATE', 'clientes', cliente.id, null, { nome, email, telefone, perfil_id }, request);

    // Busca nome do perfil
    let perfil_nome = null;
    if (cliente.perfilId) {
      const perfilArr = await db.select().from(perfisClientes).where(eq(perfisClientes.id, cliente.perfilId));
      perfil_nome = perfilArr[0]?.nome || null;
    }

    return successResponse({
      ...cliente,
      perfil: perfil_nome
    }, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


