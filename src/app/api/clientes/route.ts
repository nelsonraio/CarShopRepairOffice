import { PrismaClient } from '@prisma/client';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';

const prisma = new PrismaClient({ log: ['error'] });

// Formata cliente para retorno na API
const formatClienteResponse = (cliente: any) => ({
  id: cliente.id,
  nome: cliente.nome,
  email: cliente.email || '',
  telefone: cliente.telefone,
  nif: cliente.nif || '',
  endereco: cliente.endereco || '',
  perfil: cliente.perfil,
  veiculos: 0,
  dataRegistro: cliente.data_registo?.getFullYear().toString() || new Date().getFullYear().toString(),
  totalGasto: Number(cliente.total_gasto),
  visitas: cliente.visitas || 0
});

export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      where: { ativo: true },
      orderBy: { criado_em: 'desc' },
      include: { perfil_cliente: true }
    });

    return successResponse(clientes.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      nif: cliente.nif || '',
      endereco: cliente.endereco || '',
      perfil: cliente.perfil_cliente ? cliente.perfil_cliente.nome : 'Normal',
      veiculos: 0,
      dataRegistro: cliente.data_registo?.getFullYear().toString() || new Date().getFullYear().toString(),
      totalGasto: Number(cliente.total_gasto),
      visitas: cliente.visitas || 0
    })));
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
    let perfilCliente = null;
    if (perfil_id) {
      perfilCliente = await prisma.perfis_clientes.findUnique({ where: { id: perfil_id } });
      if (!perfilCliente) {
        return successResponse({ error: 'Perfil de cliente inválido' }, 400);
      }
    }

    const cliente = await prisma.clientes.create({
      data: {
        nome,
        email: email || null,
        telefone,
        nif: nif || null,
        endereco: endereco || null,
        perfil_id: perfil_id || null,
        ativo: true,
        data_registo: new Date(),
        total_gasto: 0,
        visitas: 0
      },
      include: { perfil_cliente: true }
    });

    await registarAuditoria('CREATE', 'clientes', cliente.id, null, { nome, email, telefone, perfil_id }, request);

    return successResponse({
      ...cliente,
      perfil: cliente.perfil_cliente ? cliente.perfil_cliente.nome : null
    }, 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


