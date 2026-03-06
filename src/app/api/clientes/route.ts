import { PrismaClient } from '@prisma/client';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';

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
      orderBy: { criado_em: 'desc' }
    });

    return successResponse(clientes.map(formatClienteResponse));
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, nif, endereco, perfil } = await request.json();

    // Validação básica
    if (!nome) {
      return successResponse({ error: 'Nome é obrigatório' }, 400);
    }

    // Normaliza o perfil para os valores válidos do enum `clientes_perfil`
    const normalizePerfil = (rawPerfil: unknown): 'Normal' | 'TVDE_Interno' | 'TVDE_Externo' | 'Empresa' => {
      const perfilStr = String(rawPerfil ?? '').trim();

      const perfilMap: Record<string, 'Normal' | 'TVDE_Interno' | 'TVDE_Externo' | 'Empresa'> = {
        'normal': 'Normal',
        'tvde interno': 'TVDE_Interno',
        'tvde_interno': 'TVDE_Interno',
        'tvde externo': 'TVDE_Externo',
        'tvde_externo': 'TVDE_Externo',
        'empresa': 'Empresa'
      };

      const key = perfilStr.toLowerCase();
      return perfilMap[key] || 'Normal';
    };

    const perfilNormalizado = normalizePerfil(perfil);

    const cliente = await prisma.clientes.create({
      data: {
        nome,
        email: email || null,
        telefone,
        nif: nif || null,
        endereco: endereco || null,
        perfil: perfilNormalizado,
        ativo: true,
        data_registo: new Date(),
        total_gasto: 0,
        visitas: 0
      }
    });

    return successResponse(formatClienteResponse(cliente), 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}


