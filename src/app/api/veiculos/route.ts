import { PrismaClient } from '@prisma/client';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';

const prisma = new PrismaClient();

/**
 * Formata veículo para retorno na API
 */
const formatVeiculoResponse = (veiculo: any, cliente: any = null) => ({
  id: veiculo.id,
  clientId: veiculo.cliente_id || '',
  clientName: cliente?.nome || 'Cliente não encontrado',
  clientProfile: formatPerfilCliente(cliente?.perfil),
  make: veiculo.marca,
  model: veiculo.modelo,
  licensePlate: veiculo.matricula,
  year: veiculo.ano || new Date().getFullYear(),
  status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
  lastIntervention: veiculo.ultima_intervencao
    ? veiculo.ultima_intervencao.toLocaleDateString('pt-PT')
    : ''
});

/**
 * Formata perfil do cliente para exibição
 */
const formatPerfilCliente = (perfil: string | null): string => {
  const perfilMap: Record<string, string> = {
    'TVDE_Interno': 'TVDE Interno',
    'TVDE_Externo': 'TVDE Externo'
  };
  return perfilMap[perfil || ''] || perfil || 'Normal';
};

/**
 * Normaliza perfil do cliente para valor enum válido
 */
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
  return perfilMap[perfilStr.toLowerCase()] || 'Normal';
};

/**
 * GET: Lista todos os veículos com dados de cliente
 */
export async function GET() {
  try {
    const veiculos = await prisma.veiculos.findMany({
      include: { cliente: true },
      orderBy: { criado_em: 'desc' }
    });

    const transformados = veiculos.map(v => formatVeiculoResponse(v, v.cliente));
    return successResponse(transformados);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Cria novo veículo e cliente associado se necessário
 */
export async function POST(request: Request) {
  try {
    const { clientId, clientName, clientEmail, clientPhone, clientNif, clientAddress, clientProfile, make, model, licensePlate, year, vin } = await request.json();

    // Validação básica
    if (!clientName || !make || !model || !licensePlate) {
      return successResponse(
        { error: 'Cliente, marca, modelo e matrícula são obrigatórios' },
        400
      );
    }

    // Converter ou criar cliente
    let vehicleClientId = clientId ? parseInt(clientId) : null;
    if (!vehicleClientId) {
      const newClient = await prisma.clientes.create({
        data: {
          nome: clientName,
          email: clientEmail || null,
          telefone: clientPhone || '',
          nif: clientNif || null,
          endereco: clientAddress || null,
          perfil: normalizePerfil(clientProfile),
          ativo: true,
          data_registo: new Date(),
          total_gasto: 0,
          visitas: 0
        }
      });
      vehicleClientId = newClient.id;
    }

    // Criar veículo
    const veiculo = await prisma.veiculos.create({
      data: {
        cliente_id: vehicleClientId,
        marca: make,
        modelo: model,
        matricula: licensePlate,
        ano: year ? parseInt(year) : null,
        numero_chassis: vin || null,
        estado: 'disponivel',
        criado_em: new Date(),
        atualizado_em: new Date()
      },
      include: { cliente: true }
    });

    return successResponse(
      formatVeiculoResponse(veiculo, veiculo.cliente),
      201
    );
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
