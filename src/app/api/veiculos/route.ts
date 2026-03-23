import { db } from '@/db/connection';
import { veiculos, clientes } from '@/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';

const normalizeText = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ');
const normalizeNullable = (value: unknown) => {
  const normalized = normalizeText(value);
  return normalized || null;
};

type ClientPayload = {
  clientName?: unknown;
  clientEmail?: unknown;
  clientPhone?: unknown;
  clientNif?: unknown;
  clientAddress?: unknown;
  clientProfile?: unknown;
};

async function findMatchingClient(payload: ClientPayload) {
  const clientName = normalizeText(payload.clientName);
  const clientEmail = normalizeNullable(payload.clientEmail);
  const clientPhone = normalizeNullable(payload.clientPhone);
  const clientNif = normalizeNullable(payload.clientNif);

  if (clientNif) {
    const [clientePorNif] = await db.select().from(clientes).where(eq(clientes.nif, clientNif)).limit(1);
    if (clientePorNif) return { client: clientePorNif, reason: 'nif' as const };
  }

  if (clientEmail) {
    const [clientePorEmail] = await db.select().from(clientes).where(eq(clientes.email, clientEmail)).limit(1);
    if (clientePorEmail) return { client: clientePorEmail, reason: 'email' as const };
  }

  if (clientPhone && clientName) {
    const [clientePorNomeTelefone] = await db.select().from(clientes)
      .where(and(eq(clientes.nome, clientName), eq(clientes.telefone, clientPhone)))
      .limit(1);
    if (clientePorNomeTelefone) return { client: clientePorNomeTelefone, reason: 'name_phone' as const };
  }

  if (clientName) {
    const clientesPorNome = await db.select().from(clientes).where(eq(clientes.nome, clientName)).limit(2);
    if (clientesPorNome.length === 1) {
      return { client: clientesPorNome[0], reason: 'name' as const };
    }

    if (clientesPorNome.length > 1) {
      return { client: null, reason: 'ambiguous_name' as const };
    }
  }

  return { client: null, reason: null };
}

/**
 * Formata veículo para retorno na API
 */
const formatVeiculoResponse = (veiculo: any, cliente: any = null) => ({
  id: veiculo.id,
  clientId: veiculo.clienteId || '',
  clientName: cliente?.nome || 'Cliente não encontrado',
  clientProfile: formatPerfilCliente(cliente?.perfil),
  make: veiculo.marca,
  model: veiculo.modelo,
  licensePlate: veiculo.matricula,
  year: veiculo.ano || new Date().getFullYear(),
  status: veiculo.estado === 'na_oficina' ? 'na_oficina' : 'disponivel',
  lastIntervention: veiculo.ultimaIntervencao
    ? new Date(veiculo.ultimaIntervencao).toLocaleDateString('pt-PT')
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
    const veiculosArr = await db.select().from(veiculos).orderBy(desc(veiculos.criadoEm));
    // Get all client IDs
    const clientIds = veiculosArr.map(v => v.clienteId).filter((id): id is number => id != null);
    const clientesArr = clientIds.length ? await db.select().from(clientes).where(inArray(clientes.id, clientIds)) : [];
    const clienteMap = new Map(clientesArr.map(c => [c.id, c]));
    const transformados = veiculosArr.map(v => formatVeiculoResponse(v, v.clienteId != null ? clienteMap.get(v.clienteId) : undefined));
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
      const existingClientMatch = await findMatchingClient({
        clientName,
        clientEmail,
        clientPhone,
        clientNif,
        clientAddress,
        clientProfile,
      });

      if (existingClientMatch.reason === 'ambiguous_name') {
        return successResponse(
          { error: 'Já existem vários clientes com este nome. Selecione o cliente existente na pesquisa ou preencha NIF, email ou telefone para identificar corretamente.' },
          409
        );
      }

      if (existingClientMatch.client) {
        vehicleClientId = existingClientMatch.client.id;
      }
    }

    if (!vehicleClientId) {
      // Corrigir campos opcionais para evitar NaN
      let perfilIdNum = clientProfile ? parseInt(clientProfile) : null;
      if (perfilIdNum !== null && Number.isNaN(perfilIdNum)) perfilIdNum = null;
      const values = {
        nome: normalizeText(clientName),
        email: normalizeNullable(clientEmail),
        telefone: normalizeText(clientPhone),
        nif: normalizeNullable(clientNif),
        endereco: normalizeNullable(clientAddress),
        perfilId: perfilIdNum,
        ativo: 1,
        dataRegisto: new Date().toISOString().slice(0, 10),
        totalGasto: '0.00',
        visitas: 0
      };
      const [result]: any = await db.insert(clientes).values(values);
      if (!result?.insertId) {
        return handleDatabaseError(new Error('Falha ao inserir cliente. insertId indefinido.'));
      }
      vehicleClientId = result.insertId;
    }

    // Corrigir formato de data para MySQL (YYYY-MM-DD HH:mm:ss)
    function toMySQLDateTime(date: Date): string {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    const now = new Date();
    const [resultVeiculo]: any = await db.insert(veiculos).values({
      clienteId: vehicleClientId,
      marca: make,
      modelo: model,
      matricula: licensePlate,
      ano: year ? parseInt(year) : null,
      estado: 'disponivel',
      criadoEm: toMySQLDateTime(now),
      atualizadoEm: toMySQLDateTime(now)
    });
    let veiculo;
    if (resultVeiculo?.insertId) {
      // Caminho normal: insertId disponível
      [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, resultVeiculo.insertId));
    } else {
      // Fallback: buscar pelo maior id para cliente, marca, modelo e matrícula
      const veiculosPossiveis = vehicleClientId != null
        ? await db.select().from(veiculos)
          .where(eq(veiculos.clienteId, vehicleClientId))
          .orderBy(desc(veiculos.id))
        : [];
      veiculo = veiculosPossiveis.find(v =>
        v.marca === make &&
        v.modelo === model &&
        v.matricula === licensePlate
      );
    }
    if (!veiculo) {
      return handleDatabaseError(new Error('Veículo não encontrado após inserção.'));
    }
    const [cliente] = vehicleClientId != null
      ? await db.select().from(clientes).where(eq(clientes.id, vehicleClientId))
      : [];
    await registarAuditoria('CREATE', 'veiculos', Number(veiculo.id), null, { marca: make, modelo: model, matricula: licensePlate, cliente_id: vehicleClientId }, request);
    return successResponse(
      formatVeiculoResponse(veiculo, cliente),
      201
    );
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
