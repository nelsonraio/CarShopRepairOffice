import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { 
  successResponse, 
  errorResponse, 
  handleDatabaseError,
  parsePaginationParams,
  parseNum,
  buildDataMap,
  extractUniqueIds
} from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';

const prisma = new PrismaClient();

type InvoiceRecord = {
  id: bigint | number;
  numero_fatura: string;
  cliente_id: number;
  ordem_trabalho_id: number | null;
  data_emissao: Date | string | null;
  data_vencimento: Date | string | null;
  estado: string | null;
  subtotal: unknown;
  valor_imposto: unknown;
  valor_desconto: unknown;
  valor_total: unknown;
  valor_pago: unknown;
  notas: string | null;
  toconline_id?: string | null;
  recibo_toconline_id?: string | null;
  criado_em: Date | string | null;
};

type ClientInfo = { id?: number; nome?: string | null; nif?: string | null };
type OrderInfo = {
  id?: number;
  ref_ordem_trabalho?: string;
  veiculo?: {
    marca?: string;
    modelo?: string;
    matricula?: string;
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
  numero_fatura: invoice.numero_fatura,
  cliente_id: invoice.cliente_id,
  cliente_nome: clientMap.get(invoice.cliente_id)?.nome,
  cliente_nif: clientMap.get(invoice.cliente_id)?.nif,
  ordem_trabalho_ref: invoice.ordem_trabalho_id
    ? orderMap.get(invoice.ordem_trabalho_id)?.ref_ordem_trabalho
    : undefined,
  veiculo_marca: invoice.ordem_trabalho_id
    ? orderMap.get(invoice.ordem_trabalho_id)?.veiculo?.marca
    : undefined,
  veiculo_modelo: invoice.ordem_trabalho_id
    ? orderMap.get(invoice.ordem_trabalho_id)?.veiculo?.modelo
    : undefined,
  veiculo_matricula: invoice.ordem_trabalho_id
    ? orderMap.get(invoice.ordem_trabalho_id)?.veiculo?.matricula
    : undefined,
  data_emissao: invoice.data_emissao instanceof Date ? invoice.data_emissao.toISOString() : invoice.data_emissao,
  data_vencimento: invoice.data_vencimento instanceof Date ? invoice.data_vencimento.toISOString() : invoice.data_vencimento,
  estado: invoice.estado,
  subtotal: parseNum(invoice.subtotal),
  valor_imposto: parseNum(invoice.valor_imposto || 0),
  valor_desconto: parseNum(invoice.valor_desconto || 0),
  valor_total: parseNum(invoice.valor_total),
  valor_pago: parseNum(invoice.valor_pago || 0),
  notas: invoice.notas,
  toconline_id: invoice.toconline_id,
  recibo_toconline_id: invoice.recibo_toconline_id,
  criado_em: invoice.criado_em instanceof Date ? invoice.criado_em.toISOString() : invoice.criado_em
});

/**
 * GET /api/faturas - List invoices with pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { skip, take } = parsePaginationParams(new URL(req.url));
    const status = searchParams.get('status');

    const where: { estado?: string } = {};
    if (status) where.estado = status;

    // Fetch invoices with pagination
    const [faturas, total] = await Promise.all([
      prisma.faturas.findMany({
        where,
        skip,
        take,
        orderBy: { data_emissao: 'desc' }
      }),
      prisma.faturas.count({ where })
    ]);

    // Batch load related data
    const clienteIds = extractUniqueIds(faturas, 'cliente_id');
    const orderIds = extractUniqueIds(
      faturas.filter(f => f.ordem_trabalho_id),
      'ordem_trabalho_id'
    );

    const [clientes, ordensTrabalho] = await Promise.all([
      clienteIds.length
        ? prisma.clientes.findMany({
            where: { id: { in: clienteIds as number[] } },
            select: { id: true, nome: true, nif: true }
          })
        : Promise.resolve([]),
      orderIds.length
        ? prisma.ordens_trabalho.findMany({
            where: { id: { in: (orderIds as (number | bigint)[]).map(id => BigInt(id)) } },
            select: {
              id: true,
              ref_ordem_trabalho: true,
              veiculo: {
                select: { marca: true, modelo: true, matricula: true }
              }
            }
          })
        : Promise.resolve([])
    ]);

    const clientMap = buildDataMap<number, ClientInfo>(clientes, 'id');
    const orderMap = buildDataMap<number, OrderInfo>(
      ordensTrabalho.map(o => ({ ...o, id: Number(o.id) })),
      'id'
    );

    // Format and return response
    const faturasFormatadas = faturas.map(f => formatInvoice(f, clientMap, orderMap));
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
      const faturaExistente = await prisma.faturas.findFirst({
        where: { ordem_trabalho_id: ordemTrabalhoIdParsed },
        select: { id: true, numero_fatura: true }
      });

      if (faturaExistente) {
        return errorResponse(
          `The work order is already invoiced (invoice ${faturaExistente.numero_fatura})`,
          409
        );
      }

      // Verify work order exists
      const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
        where: { id: BigInt(ordemTrabalhoIdParsed) },
        select: { id: true, ref_ordem_trabalho: true, fatura_id: true }
      });

      if (!ordemTrabalho) {
        return errorResponse('Work order not found', 404);
      }

      // Clean up orphaned invoice links
      if (ordemTrabalho.fatura_id) {
        const faturaPorVinculo = await prisma.faturas.findUnique({
          where: { id: ordemTrabalho.fatura_id },
          select: { id: true, numero_fatura: true }
        });

        if (faturaPorVinculo) {
          return errorResponse(
            `Work order ${ordemTrabalho.ref_ordem_trabalho} is already linked to invoice ${faturaPorVinculo.numero_fatura}`,
            409
          );
        }

        await prisma.ordens_trabalho.update({
          where: { id: BigInt(ordemTrabalhoIdParsed) },
          data: { fatura_id: null }
        });
        console.warn('⚠️ Cleaned orphaned invoice link for work order:', ordemTrabalhoIdParsed);
      }
    }

    // Update client NIF if provided
    if (cliente_nif && cliente_id) {
      const nifExistente = await prisma.clientes.findFirst({
        where: { nif: cliente_nif, id: { not: cliente_id } },
        select: { id: true }
      });

      if (nifExistente) {
        return errorResponse('NIF is already associated with another client', 409);
      }

      await prisma.clientes.update({
        where: { id: cliente_id },
        data: { nif: cliente_nif }
      });
    }

    // Create invoice
    const fatura = await prisma.faturas.create({
      data: {
        numero_fatura,
        cliente_id,
        ordem_trabalho_id: ordemTrabalhoIdParsed,
        data_emissao: new Date(data_emissao),
        data_vencimento: new Date(data_vencimento),
        subtotal: parseNum(subtotal),
        valor_imposto: parseNum(valor_imposto || 0),
        valor_desconto: parseNum(valor_desconto || 0),
        valor_total: parseNum(valor_total),
        estado: 'pendente',
        notas,
        valor_pago: 0,
        toconline_id: toconline_id ? String(toconline_id) : null,
        toconline_customer_id: toconline_customer_id ? String(toconline_customer_id) : null
      }
    });

    // Link invoice to work order if provided
    if (ordemTrabalhoIdParsed) {
      await prisma.ordens_trabalho.update({
        where: { id: BigInt(ordemTrabalhoIdParsed) },
        data: { fatura_id: fatura.id }
      });
    }

    await registarAuditoria('CREATE', 'faturas', Number(fatura.id), null, { numero_fatura, cliente_id, ordem_trabalho_id: ordemTrabalhoIdParsed, valor_total: parseNum(valor_total) }, req);

    return successResponse(
      {
        success: true,
        data: {
          id: Number(fatura.id),
          numero_fatura: fatura.numero_fatura,
          cliente_id: fatura.cliente_id,
          data_emissao: fatura.data_emissao,
          data_vencimento: fatura.data_vencimento,
          estado: fatura.estado,
          subtotal: parseNum(fatura.subtotal),
          valor_imposto: parseNum(fatura.valor_imposto || 0),
          valor_desconto: parseNum(fatura.valor_desconto || 0),
          valor_total: parseNum(fatura.valor_total),
          valor_pago: parseNum(fatura.valor_pago || 0),
          notas: fatura.notas,
          criado_em: fatura.criado_em
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


