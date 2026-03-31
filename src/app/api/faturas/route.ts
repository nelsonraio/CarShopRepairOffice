import { db } from '@/db/connection';
import { faturas, clientes, ordensTrabalho, veiculos } from '@/db/schema';
import { and, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  parsePaginationParams,
  parseNum,
  extractUniqueIds
} from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';


type InvoiceRecord = {
  id: number;
  numeroFatura: string;
  clienteId: number;
  ordemTrabalhoId: number | null;
  dataEmissao: Date | string | null;
  dataVencimento: Date | string | null;
  estado: string | null;
  subtotal: unknown;
  valorImposto: unknown;
  valorDesconto: unknown;
  valorTotal: unknown;
  valorPago: unknown;
  notas: string | null;
  toconlineId?: string | null;
  reciboToconlineId?: string | null;
  criadoEm: Date | string | null;
};

type ClientInfo = { id?: number; nome?: string | null; nif?: string | null };
type OrderInfo = {
  id?: number;
  refOrdemTrabalho?: string;
  veiculo?: {
    marca: string | undefined;
    modelo: string | undefined;
    matricula: string | undefined;
  } | null;
};

/**
 * Format invoice data for API response
 */
const formatInvoice = (
  invoice: InvoiceRecord,
  clientMap: Map<number, ClientInfo>,
  orderMap: Map<number, OrderInfo>
) => ({
  id: Number(invoice.id),
  numero_fatura: invoice.numeroFatura,
  cliente_id: invoice.clienteId,
  cliente_nome: clientMap.get(invoice.clienteId)?.nome,
  cliente_nif: clientMap.get(invoice.clienteId)?.nif,
  ordem_trabalho_ref: invoice.ordemTrabalhoId
    ? orderMap.get(invoice.ordemTrabalhoId)?.refOrdemTrabalho
    : undefined,
  veiculo_marca: invoice.ordemTrabalhoId
    ? orderMap.get(invoice.ordemTrabalhoId)?.veiculo?.marca
    : undefined,
  veiculo_modelo: invoice.ordemTrabalhoId
    ? orderMap.get(invoice.ordemTrabalhoId)?.veiculo?.modelo
    : undefined,
  veiculo_matricula: invoice.ordemTrabalhoId
    ? orderMap.get(invoice.ordemTrabalhoId)?.veiculo?.matricula
    : undefined,
  data_emissao: invoice.dataEmissao instanceof Date ? invoice.dataEmissao.toISOString() : invoice.dataEmissao,
  data_vencimento: invoice.dataVencimento instanceof Date ? invoice.dataVencimento.toISOString() : invoice.dataVencimento,
  estado: invoice.estado,
  subtotal: parseNum(invoice.subtotal),
  valor_imposto: parseNum(invoice.valorImposto || 0),
  valor_desconto: parseNum(invoice.valorDesconto || 0),
  valor_total: parseNum(invoice.valorTotal),
  valor_pago: parseNum(invoice.valorPago || 0),
  notas: invoice.notas,
  toconline_id: invoice.toconlineId,
  recibo_toconline_id: invoice.reciboToconlineId,
  criado_em: invoice.criadoEm instanceof Date ? invoice.criadoEm.toISOString() : invoice.criadoEm
});

/**
 * GET /api/faturas - List invoices with pagination
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { skip, take } = parsePaginationParams(new URL(req.url));
    const status = searchParams.get('status');

    // Build where clause
    let whereClause = undefined;
    if (status) {
      whereClause = eq(faturas.estado, status);
    }

    // Fetch invoices with pagination
    const [faturasList, total] = await Promise.all([
      db.select().from(faturas)
        .where(whereClause)
        .orderBy(desc(faturas.dataEmissao))
        .offset(skip)
        .limit(take),
      db.select({ count: sql<number>`count(*)` }).from(faturas)
        .where(whereClause)
        .then(rows => rows[0]?.count || 0)
    ]);

    // Batch load related data
    const clienteIds = extractUniqueIds(faturasList, 'clienteId').filter((id): id is number => typeof id === 'number');
    const orderIds = extractUniqueIds(
      faturasList.filter(f => f.ordemTrabalhoId),
      'ordemTrabalhoId'
    ).filter((id): id is number => typeof id === 'number');

    const [clientesList, ordensTrabalhoList] = await Promise.all([
      clienteIds.length
        ? db.select({ id: clientes.id, nome: clientes.nome, nif: clientes.nif }).from(clientes).where(inArray(clientes.id, clienteIds))
        : [],
      orderIds.length
        ? db.select({
            id: ordensTrabalho.id,
            refOrdemTrabalho: ordensTrabalho.refOrdemTrabalho,
            veiculoId: ordensTrabalho.veiculoId,
          }).from(ordensTrabalho).where(inArray(ordensTrabalho.id, orderIds))
        : []
    ]);

    const veiculoIds = ordensTrabalhoList
      .map(ordem => Number(ordem.veiculoId))
      .filter((id): id is number => Number.isFinite(id) && id > 0);

    const veiculosList = veiculoIds.length
      ? await db
          .select({ id: veiculos.id, marca: veiculos.marca, modelo: veiculos.modelo, matricula: veiculos.matricula })
          .from(veiculos)
          .where(inArray(veiculos.id, veiculoIds))
      : [];

    const clientMap = new Map<number, ClientInfo>(clientesList.map(cliente => [cliente.id, cliente]));
    const vehicleMap = new Map<number, { marca: string | undefined; modelo: string | undefined; matricula: string | undefined }>(
      veiculosList.map(veiculo => [
        Number(veiculo.id),
        {
          marca: veiculo.marca ?? undefined,
          modelo: veiculo.modelo ?? undefined,
          matricula: veiculo.matricula ?? undefined,
        },
      ])
    );

    const orderMap = new Map<number, OrderInfo>(
      ordensTrabalhoList.map(ordem => [
        Number(ordem.id),
        {
          id: Number(ordem.id),
          refOrdemTrabalho: ordem.refOrdemTrabalho,
          veiculo: vehicleMap.get(Number(ordem.veiculoId)) || null,
        },
      ])
    );

    // Format and return response
    const faturasFormatadas = faturasList.map(f => formatInvoice(f, clientMap, orderMap));
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    return successResponse({
      success: true,
      data: faturasFormatadas,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to fetch invoices', 500);
  }
}

/**
 * POST /api/faturas - Create new invoice
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cliente_id,
      cliente_nif,
      numero_fatura,
      toconline_id,
      toconline_customer_id,
      ordem_trabalho_id,
      data_emissao,
      data_vencimento,
      subtotal,
      valor_imposto,
      valor_desconto,
      valor_total,
      notas
    } = body;

    // Validate required fields
    if (!numero_fatura) {
      return errorResponse('numero_fatura is required', 400);
    }

    const ordemTrabalhoIdParsed = ordem_trabalho_id ? parseInt(ordem_trabalho_id) : null;

    // Check for existing invoice on work order
    if (ordemTrabalhoIdParsed) {
      const faturaExistente = await db.select().from(faturas)
        .where(eq(faturas.ordemTrabalhoId, ordemTrabalhoIdParsed)).limit(1);
      const existingInvoice = faturaExistente[0];
      if (existingInvoice) {
        return errorResponse(
          `The work order is already invoiced (invoice ${existingInvoice.numeroFatura})`,
          409
        );
      }

      // Verify work order exists
      const ordemTrabalho = await db.select().from(ordensTrabalho)
        .where(eq(ordensTrabalho.id, ordemTrabalhoIdParsed)).limit(1);
      const ordemTrabalhoAtual = ordemTrabalho[0];
      if (!ordemTrabalhoAtual) {
        return errorResponse('Work order not found', 404);
      }

      // Clean up orphaned invoice links
      if (ordemTrabalhoAtual.faturaId) {
        const faturaPorVinculo = await db.select().from(faturas)
          .where(eq(faturas.id, ordemTrabalhoAtual.faturaId)).limit(1);
        const linkedInvoice = faturaPorVinculo[0];
        if (linkedInvoice) {
          return errorResponse(
            `Work order ${ordemTrabalhoAtual.refOrdemTrabalho} is already linked to invoice ${linkedInvoice.numeroFatura}`,
            409
          );
        }
        await db.update(ordensTrabalho)
          .set({ faturaId: null })
          .where(eq(ordensTrabalho.id, ordemTrabalhoIdParsed));
        console.warn('⚠️ Cleaned orphaned invoice link for work order:', ordemTrabalhoIdParsed);
      }
    }

    // Update client NIF if provided
    if (cliente_nif && cliente_id) {
      const nifExistente = await db.select().from(clientes)
        .where(and(eq(clientes.nif, cliente_nif), ne(clientes.id, cliente_id))).limit(1);
      if (nifExistente && nifExistente.length > 0) {
        return errorResponse('NIF is already associated with another client', 409);
      }
      await db.update(clientes)
        .set({ nif: cliente_nif })
        .where(eq(clientes.id, cliente_id));
    }

    // Create invoice
    await db.insert(faturas).values({
      numeroFatura: numero_fatura,
      clienteId: cliente_id,
      ordemTrabalhoId: ordemTrabalhoIdParsed,
      dataEmissao: data_emissao || null,
      dataVencimento: data_vencimento || null,
      subtotal: String(parseNum(subtotal)),
      valorImposto: String(parseNum(valor_imposto || 0)),
      valorDesconto: String(parseNum(valor_desconto || 0)),
      valorTotal: String(parseNum(valor_total)),
      estado: 'pendente',
      notas,
      valorPago: '0.00',
      toconlineId: toconline_id ? String(toconline_id) : null,
      toconlineCustomerId: toconline_customer_id ? String(toconline_customer_id) : null
    });

    const [fatura] = await db.select().from(faturas)
      .where(eq(faturas.numeroFatura, numero_fatura))
      .orderBy(desc(faturas.id))
      .limit(1);
    if (!fatura) {
      return errorResponse('Failed to create invoice', 500);
    }

    // Link invoice to work order if provided
    if (ordemTrabalhoIdParsed) {
      await db.update(ordensTrabalho)
        .set({ faturaId: fatura.id })
        .where(eq(ordensTrabalho.id, ordemTrabalhoIdParsed));
    }

    await registarAuditoria('CREATE', 'faturas', Number(fatura.id), null, { numero_fatura, cliente_id, ordem_trabalho_id: ordemTrabalhoIdParsed, valor_total: parseNum(valor_total) }, req);

    return successResponse(
      {
        success: true,
        data: {
          id: Number(fatura.id),
          numero_fatura: fatura.numeroFatura,
          cliente_id: fatura.clienteId,
          data_emissao: fatura.dataEmissao,
          data_vencimento: fatura.dataVencimento,
          estado: fatura.estado,
          subtotal: parseNum(fatura.subtotal),
          valor_imposto: parseNum(fatura.valorImposto || 0),
          valor_desconto: parseNum(fatura.valorDesconto || 0),
          valor_total: parseNum(fatura.valorTotal),
          valor_pago: parseNum(fatura.valorPago || 0),
          notas: fatura.notas,
          criado_em: fatura.criadoEm
        }
      },
      201
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to create invoice', 500);
  }
}


