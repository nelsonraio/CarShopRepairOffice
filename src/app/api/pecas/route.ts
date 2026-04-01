// PUT: Atualiza uma peça existente
export async function PUT(request: Request) {
  try {
    const { id, nome, referencia, categoriaId, stock, minStock, price, fornecedor_id, descricao, margem_lucro, notas } = await request.json();
    if (!id) return successResponse({ error: 'ID da peça é obrigatório' }, 400);
    const updateData: any = {
      nome,
      referencia,
      categoria_id: categoriaId || null,
      quantidade_stock: stock,
      nivel_stock_minimo: minStock,
      preco_venda: price,
      descricao: descricao || null,
      fornecedor_id: fornecedor_id || null,
      margem_lucro: typeof margem_lucro === 'number' ? String(margem_lucro) : (margem_lucro || null),
      notas: notas || null
    };
    // Remover campos undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    await db.update(pecas).set(updateData).where(eq(pecas.id, Number(id)));
    await registarAuditoria('UPDATE', 'pecas', Number(id), null, updateData, request);
    // Buscar peça atualizada
    const [peca] = await db.select().from(pecas).where(eq(pecas.id, Number(id)));
    let fornecedorNome = null;
    if (peca && peca.fornecedor_id) {
      const [fornecedor] = await db.select().from(fornecedores).where(eq(fornecedores.id, peca.fornecedor_id));
      fornecedorNome = fornecedor?.nome || null;
    }
    return successResponse(await formatPecaResponse(peca, fornecedorNome));
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';
import { db } from '@/db/connection';
import { pecas, fornecedores, itensOrdemTrabalho, pecasOrdemTrabalho, itensEncomendaPeca } from '@/db/schema';
import { eq, inArray, asc, sql } from 'drizzle-orm';

import { categoriasPeca } from '@/db/schema';

async function getCategoriaObj(categoriaId: number | null) {
  if (!categoriaId) return { id: 0, nome: '' };
  const cat = await db.select().from(categoriasPeca).where(eq(categoriasPeca.id, categoriaId));
  const categoria = cat[0];
  if (categoria) return { id: categoria.id, nome: categoria.nome };
  return { id: 0, nome: '' };
}

async function formatPecaResponse(peca: any, fornecedorNome: string | null = null) {
  const categoria = await getCategoriaObj(peca.categoria_id || null);
  return {
    id: peca.id,
    referencia: peca.referencia,
    nome: peca.nome,
    descricao: peca.descricao,
    quantidade_stock: peca.quantidade_stock,
    nivel_stock_minimo: peca.nivel_stock_minimo,
    preco_venda: Number(peca.preco_venda),
    custo_unitario: Number(peca.custo_unitario),
    ativo: peca.ativo,
    fornecedor_id: peca.fornecedor_id,
    fornecedor_nome: fornecedorNome,
    margem_lucro: peca.margem_lucro ? Number(peca.margem_lucro) : null,
    veiculos_compativeis: peca.veiculos_compativeis,
    notas: peca.notas,
    category: categoria
  };
}

async function carregarFornecedores(fornecedorIds: number[]) {
  if (!fornecedorIds.length) return new Map();
  const fornecedoresList = await db.select().from(fornecedores).where(inArray(fornecedores.id, fornecedorIds));
  const map = new Map();
  fornecedoresList.forEach(f => map.set(f.id, f.nome));
  return map;
}

// DELETE: Apaga peça se não houver dependências
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return successResponse({ error: 'ID da peça é obrigatório' }, 400);
    const pecaId = parseInt(id);

    // Verificar dependências em encomendas, ordens de trabalho e itens_encomenda_peca
    const encomendasCount = Number((await db.select({ count: sql`COUNT(*)` }).from(pecasOrdemTrabalho).where(eq(pecasOrdemTrabalho.pecaId, pecaId)))[0]?.count ?? 0);
    const ordensCount = Number((await db.select({ count: sql`COUNT(*)` }).from(itensOrdemTrabalho).where(eq(itensOrdemTrabalho.pecaId, pecaId)))[0]?.count ?? 0);
    const itensEncomendaCount = Number((await db.select({ count: sql`COUNT(*)` }).from(itensEncomendaPeca).where(eq(itensEncomendaPeca.pecaId, pecaId)))[0]?.count ?? 0);

    if (encomendasCount > 0 || ordensCount > 0 || itensEncomendaCount > 0) {
      let motivos = [];
      if (encomendasCount > 0) motivos.push(`usada em ${encomendasCount} ordem(ns) de trabalho (pecasOrdemTrabalho)`);
      if (ordensCount > 0) motivos.push(`usada em ${ordensCount} item(ns) de ordem de trabalho`);
      if (itensEncomendaCount > 0) motivos.push(`usada em ${itensEncomendaCount} encomenda(s)`);
      return successResponse({ error: `Não é possível apagar a peça: ${motivos.join(', ')}.` }, 400);
    }

    await db.delete(pecas).where(eq(pecas.id, pecaId));
    await registarAuditoria('DELETE', 'pecas', pecaId, null, null, request);
    return successResponse({ success: true });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
// ...existing code...
// GET: Lista todas as peças ativas
export async function GET() {
  try {
    const pecasList = await db.select().from(pecas).where(eq(pecas.ativo, 1)).orderBy(asc(pecas.nome));
    const fornecedorIds = [...new Set(pecasList.map(p => p.fornecedor_id).filter((id): id is number => id !== null))];
    const fornecedoresMap = await carregarFornecedores(fornecedorIds);
    // Buscar categorias em paralelo
    const resultado = await Promise.all(
      pecasList.map(peca => formatPecaResponse(peca, fornecedoresMap.get(peca.fornecedor_id)))
    );
    return successResponse(resultado);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
// POST: Cria nova peça
export async function POST(request: Request) {
  try {
    const { nome, referencia, categoriaId, stock, minStock, price, fornecedor_id, descricao, margem_lucro, notas } = await request.json();
    // Se faltar nome ou referência, retornar erro para o frontend exibir de forma amigável (inline ou global)
    // O frontend deve mostrar esta mensagem junto aos campos obrigatórios, não em alert().
    // Exemplo de tratamento no frontend:
    // if (res.error) setErrorMsg(res.error); // mostrar mensagem junto ao campo ou no topo do formulário
    if (!nome || !referencia) return successResponse({ error: 'Nome e referência são obrigatórios' }, 400);
    // Se stock ou minStock for negativo, retornar erro para o frontend exibir de forma amigável
    // O frontend deve mostrar esta mensagem junto ao campo stock/minStock.
    if ((stock ?? 0) < 0 || (minStock ?? 0) < 0) return successResponse({ error: 'Stock não pode ser negativo' }, 400);
    const existente = await db.select().from(pecas).where(eq(pecas.referencia, referencia));
    // Se já existir referência, retornar erro para o frontend exibir de forma amigável
    // O frontend deve mostrar esta mensagem junto ao campo referência.
    if (existente.length > 0) return successResponse({ error: 'Já existe referência com este valor' }, 400);
    await db.insert(pecas).values({
      nome,
      referencia,
      categoria_id: categoriaId || null,
      quantidade_stock: stock,
      nivel_stock_minimo: minStock,
      preco_venda: price,
      custo_unitario: "0.00",
      descricao: descricao || null,
      ativo: 1,
      fornecedor_id: fornecedor_id || null,
      margem_lucro: margem_lucro ? String(margem_lucro) : null,
      notas: notas || null
    });
    // Buscar a última peça inserida (MySQL: maior id)
    const [peca] = await db.select().from(pecas).orderBy(sql`${pecas.id} DESC`).limit(1);
    if (!peca) {
      return successResponse({ error: 'Erro ao inserir peça.' }, 500);
    }
    let fornecedorNome = null;
    if (fornecedor_id) {
      const [fornecedor] = await db.select().from(fornecedores).where(eq(fornecedores.id, fornecedor_id));
      fornecedorNome = fornecedor?.nome || null;
    }
    await registarAuditoria('CREATE', 'pecas', Number(peca.id), null, { nome: peca.nome, referencia: peca.referencia, quantidade_stock: peca.quantidade_stock }, request);
    return successResponse(formatPecaResponse(peca, fornecedorNome), 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

