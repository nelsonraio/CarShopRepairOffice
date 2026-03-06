import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
  parseNum,
  toDateString,
  calculateDaysDelay
} from '@/lib/api-utils';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info']
});
const prismaAny = prisma as any;

/**
 * Format order item for API response
 */
const formatOrderItem = (item: any) => ({
  id: String(item.id),
  peca_id: item.peca_id !== null ? String(item.peca_id) : null,
  quantidade_encomendada: item.quantidade_encomendada,
  quantidade_recebida: item.quantidade_recebida,
  preco_unitario: Number(item.preco_unitario),
  estado: item.estado,
  nome: item.peca?.nome || item.peca_descricao || '',
  referencia: item.peca?.referencia || item.referencia || ''
});

/**
 * Format encomienda for API response
 */
const formatEncomienda = (enc: any) => ({
  id: String(enc.id),
  numero_encomenda: enc.numero_encomenda,
  fornecedor_id: String(enc.fornecedor_id),
  fornecedor_nome: enc.fornecedor?.nome || '',
  data_encomenda: toDateString(enc.data_encomenda),
  data_entrega_estimada: toDateString(enc.data_entrega_estimada),
  data_entrega_real: toDateString(enc.data_entrega_real),
  estado: enc.estado,
  custo_total: Number(enc.custo_total),
  dias_atraso: calculateDaysDelay(enc.data_entrega_estimada, enc.data_entrega_real, enc.estado),
  itens: (enc.itens || []).map(formatOrderItem)
});

/**
 * Infer supplier from part if not provided
 */
const inferSupplierFromPart = async (pecaId: string): Promise<number | null> => {
  if (!pecaId || String(pecaId).startsWith('custom')) return null;
  
  const part = await prisma.pecas.findUnique({
    where: { id: BigInt(pecaId) },
    select: { fornecedor_id: true }
  });
  return part?.fornecedor_id || null;
};

/**
 * Generate next order number for current year
 */
const generateOrderNumber = async (tx: any): Promise<string> => {
  const year = new Date().getFullYear();
  const lastOrder = await tx.encomendas_pecas.findFirst({
    where: { numero_encomenda: { startsWith: `ENC-${year}-` } },
    orderBy: { id: 'desc' },
    select: { numero_encomenda: true }
  });
  
  const lastSeq = lastOrder?.numero_encomenda
    ? Number(lastOrder.numero_encomenda.split('-').pop())
    : 0;
  
  return `ENC-${year}-${String(lastSeq + 1).padStart(6, '0')}`;
};

/**
 * Create order item, handling both existing and custom parts
 */
const createOrderItem = async (tx: any, encomendaId: number, item: any): Promise<any> => {
  const quantity = Number(item.quantidade_encomendada) || 1;
  const price = Number(item.preco_unitario) || 0;
  const total = quantity * price;

  if (item.peca_id && !String(item.peca_id).startsWith('custom')) {
    // Link to existing part
    return {
      encomenda_id: encomendaId,
      peca_id: BigInt(item.peca_id),
      quantidade_encomendada: quantity,
      quantidade_recebida: 0,
      preco_unitario: parseNum(price),
      preco_total: parseNum(total),
      estado: 'pendente'
    };
  }

  // Create custom part
  if (!item.part || !item.part.name || !item.part.reference) {
    throw new Error('Custom part must include name and reference');
  }

  const reference = item.part.reference.trim();
  const name = item.part.name.trim();
  const category = item.part.category || 'custom';
  
  let supplierId: number | null = null;
  if (item.part.supplier) {
    const supplier = await tx.fornecedores.findFirst({
      where: { nome: item.part.supplier }
    });
    supplierId = supplier?.id || null;
  }

  console.log(`📦 Creating custom part: nome=${name}, referencia=${reference}`);
  
  const createdPart = await tx.pecas.create({
    data: {
      nome: name,
      referencia: reference,
      categoria: category,
      quantidade_stock: 0,
      nivel_stock_minimo: 0,
      preco_venda: 0,
      custo_unitario: 0,
      ativo: true,
      fornecedor_id: supplierId
    }
  });

  console.log(`✅ Custom part created: id=${createdPart.id}`);

  return {
    encomenda_id: encomendaId,
    peca_id: BigInt(createdPart.id),
    quantidade_encomendada: quantity,
    quantidade_recebida: 0,
    preco_unitario: parseNum(price),
    preco_total: parseNum(total),
    estado: 'pendente'
  };
};

/**
 * GET /api/encomendas - List all purchase orders
 */
export async function GET() {
  try {
    const encomendas = await prismaAny.encomendas_pecas.findMany({
      include: {
        fornecedor: true,
        itens: { include: { peca: true } }
      },
      orderBy: { criado_em: 'desc' }
    });

    const serialized = encomendas.map(formatEncomienda);
    return successResponse(serialized);
  } catch (error) {
    console.error('Error fetching order list:', error);
    if (error instanceof Error) {
      return handleDatabaseError(error);
    }
    return errorResponse('Failed to fetch orders', 500);
  }
}

/**
 * POST /api/encomendas - Create new purchase order with items
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fornecedor_id, data_entrega_estimada, itens } = body;

    // Validate items array
    if (!Array.isArray(itens) || itens.length === 0) {
      return errorResponse('Items are required', 400);
    }

    // Infer supplier from first part if not provided
    let supplierId = fornecedor_id;
    if (!supplierId && itens.length > 0) {
      supplierId = await inferSupplierFromPart(itens[0].peca_id);
    }

    // Calculate total cost
    const totalCost = itens.reduce((sum: number, item: any) => {
      const quantity = Number(item.quantidade_encomendada) || 0;
      const price = Number(item.preco_unitario) || 0;
      return sum + quantity * price;
    }, 0);

    console.log(`📊 Order total cost: ${totalCost}`);

    // Create order with transaction
    const created = await prismaAny.$transaction(async (tx: any) => {
      console.log('🔄 Starting transaction...');

      // Generate order number
      const numero_encomenda = await generateOrderNumber(tx);
      console.log(`📝 Order number generated: ${numero_encomenda}`);

      // Create order header
      const encomenda = await tx.encomendas_pecas.create({
        data: {
          numero_encomenda,
          fornecedor_id: supplierId ? parseInt(supplierId) : null,
          data_encomenda: new Date(),
          data_entrega_estimada: data_entrega_estimada
            ? new Date(data_entrega_estimada)
            : null,
          estado: 'pendente',
          custo_total: parseNum(totalCost)
        }
      });

      console.log(`✅ Order created with ID: ${encomenda.id}`);

      // Create order items
      const itensData = [];
      for (const item of itens) {
        const itemData = await createOrderItem(tx, encomenda.id, item);
        itensData.push(itemData);
      }

      console.log(`📦 Creating ${itensData.length} items...`);

      if (itensData.length > 0) {
        await tx.itens_encomenda_peca.createMany({ data: itensData });
        console.log(`✅ ${itensData.length} items created`);
      }

      return encomenda;
    });

    console.log(`🎉 Transaction completed successfully. ID: ${created?.id}`);

    if (!created?.id) {
      return errorResponse('Order created but missing ID', 500);
    }

    return successResponse(
      {
        id: String(created.id),
        numero_encomenda: created.numero_encomenda
      },
      201
    );
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof Error) {
      // Check for database errors first
      if (error.message.includes('reach database server') || error.message.includes('ECONNREFUSED')) {
        return handleDatabaseError(error);
      }
      // Return custom error message
      return errorResponse(error.message, 500);
    }
    
    return errorResponse('Failed to create order', 500);
  }
}


