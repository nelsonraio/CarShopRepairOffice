import { db } from '@/db/connection';
import { fornecedores, pecas } from '@/db/schema';
import { categoriasPeca, encomendasPecas, itensEncomendaPeca } from '../../../../drizzle/migrations/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { parseNum } from '@/lib/api-utils';

/**
 * Format order item for API response
 */
const formatOrderItem = (item: any) => ({
  id: String(item.id),
  peca_id: item.pecaId !== null ? String(item.pecaId) : null,
  quantidade_encomendada: item.quantidadeEncomendada,
  quantidade_recebida: item.quantidadeRecebida,
  preco_unitario: Number(item.precoUnitario),
  preco_total: Number(item.precoTotal),
  estado: item.estado,
  notas: item.notas || '',
  descricao: item.descricao || '',
  referencia: item.referencia || ''
});

/**
 * Format encomienda for API response
 */
const formatEncomienda = (enc: any, fornecedorNome: string, itens: any[]) => ({
  id: String(enc.id),
  numero_encomenda: enc.numeroEncomenda || enc.numero_encomenda,
  fornecedor_id: String(enc.fornecedorId || enc.fornecedor_id),
  fornecedor_nome: fornecedorNome,
  data_encomenda: enc.dataEncomenda || enc.data_encomenda,
  data_entrega_estimada: enc.dataEntregaEstimada || enc.data_entrega_estimada,
  data_entrega_real: enc.dataEntregaReal || enc.data_entrega_real,
  estado: enc.estado,
  custo_total: Number(enc.custoTotal ?? enc.custo_total),
  notas: enc.notas || '',
  itens: itens.map(formatOrderItem)
});

/**
 * Infer supplier from part if not provided
 */
const inferSupplierFromPart = async (pecaId: string): Promise<number | null> => {
  if (!pecaId || String(pecaId).startsWith('custom')) return null;
  const part = await db.query.pecas.findFirst({
    where: eq(pecas.id, Number(pecaId)),
    columns: { fornecedor_id: true }
  });
  return part?.fornecedor_id || null;
};

/**
 * Generate next order number for current year
 */
const generateOrderNumber = async (tx: any): Promise<string> => {
  const year = new Date().getFullYear();
  // Buscar o maior número sequencial do ano
  const prefix = `ENC-${year}-`;
  const lastOrder = await tx
    .select()
    .from(encomendasPecas)
    .where(sql`LEFT(${encomendasPecas.numeroEncomenda}, ${prefix.length}) = ${prefix}`)
    .orderBy(desc(encomendasPecas.id))
    .limit(1);
  const lastSeq = lastOrder[0]?.numeroEncomenda
    ? Number(lastOrder[0].numeroEncomenda.split('-').pop())
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
      encomendaId: encomendaId,
      pecaId: Number(item.peca_id),
      quantidadeEncomendada: quantity,
      quantidadeRecebida: 0,
      precoUnitario: parseNum(price),
      precoTotal: parseNum(total),
      estado: 'pendente'
    };
  }

  // Create custom part
  if (!item.part || !item.part.name || !item.part.reference) {
    throw new Error('Custom part must include name and reference');
  }

  const reference = item.part.reference.trim();
  const name = item.part.name.trim();
  let categoryId = item.part.category_id ? Number(item.part.category_id) : null;
  // Se não houver category_id, buscar categoria 'Custom' ou 'Genérica'
  if (!categoryId) {
    const categoria = await tx.select().from(categoriasPeca)
      .where(sql`LOWER(${categoriasPeca.nome}) IN ('custom', 'genérica', 'generica')`)
      .limit(1);
    if (!categoria[0]) {
      throw new Error("Não existe categoria 'Custom' ou 'Genérica' na base de dados. Crie uma categoria padrão para peças customizadas.");
    }
    categoryId = categoria[0].id;
  }
  const descricao = item.part.description ? String(item.part.description) : '';
  let supplierId: number | null = null;
  if (item.part.supplier) {
    const supplier = await tx.select().from(fornecedores).where(eq(fornecedores.nome, item.part.supplier)).limit(1);
    supplierId = supplier[0]?.id || null;
  }
  // Criar peça customizada
  const insertResult = await tx.insert(pecas).values({
    nome: name,
    referencia: reference,
    categoria_id: categoryId,
    quantidade_stock: 0,
    nivel_stock_minimo: 0,
    preco_venda: 0,
    custo_unitario: 0,
    descricao: descricao,
    ativo: 1,
    fornecedor_id: supplierId,
    margem_lucro: null,
    veiculos_compativeis: null,
    notas: null
  });
  const createdPartId = insertResult.insertId || insertResult[0]?.insertId || insertResult[0]?.id;
  if (!createdPartId || typeof createdPartId !== 'number') {
    throw new Error('Failed to create custom part: no ID returned');
  }
  return {
    encomendaId: encomendaId,
    pecaId: createdPartId,
    quantidadeEncomendada: quantity,
    quantidadeRecebida: 0,
    precoUnitario: parseNum(price),
    precoTotal: parseNum(total),
    estado: 'pendente'
  };
};

/**
 * GET /api/encomendas - List all purchase orders
 */
export async function GET() {
  try {
    const encomendas = await db.select().from(encomendasPecas).orderBy(desc(encomendasPecas.criadoEm));
    const fornecedoresList = await db.select().from(fornecedores);
    const fornecedoresMap = new Map(fornecedoresList.map(f => [f.id, f.nome]));
    // Buscar itens + info da peça (descricao, referencia)
    const allItens = await db
      .select({
        id: itensEncomendaPeca.id,
        encomendaId: itensEncomendaPeca.encomendaId,
        pecaId: itensEncomendaPeca.pecaId,
        quantidadeEncomendada: itensEncomendaPeca.quantidadeEncomendada,
        quantidadeRecebida: itensEncomendaPeca.quantidadeRecebida,
        precoUnitario: itensEncomendaPeca.precoUnitario,
        precoTotal: itensEncomendaPeca.precoTotal,
        estado: itensEncomendaPeca.estado,
        notas: itensEncomendaPeca.notas,
        descricao: pecas.descricao,
        referencia: pecas.referencia
      })
      .from(itensEncomendaPeca)
      .leftJoin(pecas, eq(itensEncomendaPeca.pecaId, pecas.id));
    const groupedItens = new Map();
    allItens.forEach(item => {
      if (!groupedItens.has(item.encomendaId)) groupedItens.set(item.encomendaId, []);
      groupedItens.get(item.encomendaId).push(item);
    });
    const serialized = encomendas.map(enc =>
      formatEncomienda(
        enc,
        fornecedoresMap.get(enc.fornecedorId) || '',
        groupedItens.get(enc.id) || []
      )
    );
    return successResponse(serialized);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST /api/encomendas - Create new purchase order with items
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fornecedor, fornecedor_id, data_entrega_estimada, itens } = body;

    // Validate items array
    if (!Array.isArray(itens) || itens.length === 0) {
      return errorResponse('Items are required', 400);
    }

    // Extract supplierId from fornecedor.connect.id if present, else fallback
    let supplierId = fornecedor?.connect?.id || fornecedor_id;
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

    // Criar encomenda e itens em transação
    let createdId: number | null = null;
    let createdNumero: string | null = null;
    await db.transaction(async (tx) => {
      // Gerar número da encomenda
      const numeroEncomenda = await generateOrderNumber(tx);
      // Criar encomenda
      // Try both camelCase and snake_case keys for Drizzle compatibility
      let insertObj: any = {
        numeroEncomenda: numeroEncomenda,
        fornecedorId: supplierId ? Number(supplierId) : null,
        dataEncomenda: new Date(),
        dataEntregaEstimada: data_entrega_estimada ? new Date(data_entrega_estimada) : null,
        estado: 'pendente',
        custoTotal: parseNum(totalCost)
      };
      let insertResult;
      try {
        insertResult = await tx.insert(encomendasPecas).values(insertObj);
      } catch (e) {
        insertObj = {
          numero_encomenda: numeroEncomenda,
          fornecedor_id: supplierId ? Number(supplierId) : null,
          data_encomenda: new Date(),
          data_entrega_estimada: data_entrega_estimada ? new Date(data_entrega_estimada) : null,
          estado: 'pendente',
          custo_total: parseNum(totalCost)
        };
        insertResult = await tx.insert(encomendasPecas).values(insertObj);
      }
      // Drizzle MySqlRawQueryResult não retorna insertId. Buscar pelo campo único (numeroEncomenda)
      // Certifique-se de que numeroEncomenda está definido no escopo
      const [lastEncomenda] = await db.select().from(encomendasPecas).where(eq(encomendasPecas.numeroEncomenda, numeroEncomenda));
      const insertedId = lastEncomenda?.id;
      if (!insertedId || typeof insertedId !== 'number') {
        throw new Error('Failed to create order: no ID returned');
      }
      createdId = insertedId;
      createdNumero = numeroEncomenda;
      // Criar itens
      const itensData = [];
      for (const item of itens) {
        const itemData = await createOrderItem(tx, createdId, item);
        itensData.push(itemData);
      }
      if (itensData.length > 0) {
        await tx.insert(itensEncomendaPeca).values(itensData);
      }
    });
    if (!createdId) {
      return errorResponse('Order created but missing ID', 500);
    }
    await registarAuditoria('CREATE', 'encomendas_pecas', Number(createdId), null, { numero_encomenda: createdNumero, fornecedor_id: supplierId }, request);
    return successResponse(
      {
        id: String(createdId),
        numero_encomenda: createdNumero
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


