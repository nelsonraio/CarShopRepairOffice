/**
 * DELETE: Apaga peça se não houver dependências
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return successResponse({ error: 'ID da peça é obrigatório' }, 400);
    }
    // Verifica dependências: encomendas, orçamentos, ordens de trabalho
    const pecaId = parseInt(id);
    // Encomendas (itens_encomenda_peca)
    const encomendasCount = await prisma.itens_encomenda_peca.count({ where: { peca_id: pecaId } });
    // Orçamentos
    const orcamentosCount = await prisma.itens_orcamento.count({ where: { peca_id: pecaId } });
    // Ordens de trabalho
    const ordensCount = await prisma.itens_ordem_trabalho.count({ where: { peca_id: pecaId } });
    if (encomendasCount > 0 || orcamentosCount > 0 || ordensCount > 0) {
      let motivos = [];
      if (encomendasCount > 0) motivos.push(`usada em ${encomendasCount} encomenda(s)`);
      if (orcamentosCount > 0) motivos.push(`usada em ${orcamentosCount} orçamento(s)`);
      if (ordensCount > 0) motivos.push(`usada em ${ordensCount} ordem(ns) de trabalho`);
      return successResponse({ error: `Não é possível apagar a peça: ${motivos.join(', ')}.` }, 400);
    }
    // Apaga peça
    await prisma.pecas.delete({ where: { id: pecaId } });
    await registarAuditoria('DELETE', 'pecas', pecaId, null, null, request);
    return successResponse({ success: true });
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
import { PrismaClient } from '@prisma/client';
import { successResponse, handleDatabaseError } from '@/lib/api-utils';
import { registarAuditoria } from '@/lib/auditoria';

const prisma = new PrismaClient({ log: ['error'] });

/**
 * Formata peça com dados de fornecedor para retorno na API
 */
const formatPecaResponse = (peca: any, fornecedorNome: string | null = null) => ({
  id: peca.id,
  referencia: peca.referencia,
  nome: peca.nome,
  descricao: peca.descricao,
  category: peca.categoria?.nome || 'N/A',
  quantidade_stock: peca.quantidade_stock,
  nivel_stock_minimo: peca.nivel_stock_minimo,
  preco_venda: Number(peca.preco_venda),
  custo_unitario: Number(peca.custo_unitario),
  ativo: peca.ativo,
  fornecedor_id: peca.fornecedor_id,
  fornecedor_nome: fornecedorNome,
  margem_lucro: peca.margem_lucro ? Number(peca.margem_lucro) : null,
  veiculos_compativeis: peca.veiculos_compativeis,
  notas: peca.notas
});

/**
 * Busca nomes de fornecedores por ID
 */
const carregarFornecedores = async (fornecedorIds: number[]) => {
  if (fornecedorIds.length === 0) return new Map();
  
  const fornecedores = await prisma.fornecedores.findMany({
    where: { id: { in: fornecedorIds } },
    select: { id: true, nome: true }
  });
  
  const map = new Map();
  fornecedores.forEach(f => map.set(f.id, f.nome));
  return map;
};

/**
 * GET: Lista todas as peças ativas
 */
export async function GET() {
  try {
    const pecas = await prisma.pecas.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      include: { categoria: true }
    });

    // Extrair IDs únicos de fornecedores
    const fornecedorIds = [...new Set(pecas.map(p => p.fornecedor_id).filter((id): id is number => id !== null))];
    const fornecedoresMap = await carregarFornecedores(fornecedorIds);

    // Formatar resposta
    const resultado = pecas.map(peca => 
      formatPecaResponse(peca, fornecedoresMap.get(peca.fornecedor_id))
    );

    return successResponse(resultado);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * POST: Cria nova peça
 */
export async function POST(request: Request) {
  try {
    const { nome, referencia, categoria, stock, minStock, price, fornecedor_id, descricao, margem_lucro, notas } = await request.json();

    // Validações
    if (!nome || !referencia) {
      return successResponse({ error: 'Nome e referência são obrigatórios' }, 400);
    }
    if ((stock ?? 0) < 0 || (minStock ?? 0) < 0) {
      return successResponse({ error: 'Stock não pode ser negativo' }, 400);
    }

    // Verificar duplicata
    const existente = await prisma.pecas.findUnique({ where: { referencia } });
    if (existente) {
      return successResponse({ error: 'Já existe referência com este valor' }, 400);
    }

    // Criar peça
    const peca = await prisma.pecas.create({
      data: {
        nome,
        referencia,
        categoria,
        quantidade_stock: stock,
        nivel_stock_minimo: minStock,
        preco_venda: price,
        custo_unitario: 0,
        descricao: descricao || null,
        ativo: true,
        fornecedor_id: fornecedor_id || null,
        margem_lucro: margem_lucro ? Number(margem_lucro) : null,
        notas: notas || null
      }
    });

    // Buscar nome do fornecedor se atribuído
    let fornecedorNome = null;
    if (fornecedor_id) {
      const fornecedor = await prisma.fornecedores.findUnique({
        where: { id: fornecedor_id },
        select: { nome: true }
      });
      fornecedorNome = fornecedor?.nome || null;
    }

    await registarAuditoria('CREATE', 'pecas', Number(peca.id), null, { nome: peca.nome, referencia: peca.referencia, quantidade_stock: peca.quantidade_stock }, request);

    return successResponse(formatPecaResponse(peca, fornecedorNome), 201);
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}

/**
 * PUT: Atualiza peça existente
 */
export async function PUT(request: Request) {
  try {
    const { id, nome, referencia, categoriaId, stock, minStock, price, fornecedor_id, margem_lucro, notas } = await request.json();

    if (!id) {
      return successResponse({ error: 'ID de peça é obrigatório' }, 400);
    }
    if ((stock ?? 0) < 0 || (minStock ?? 0) < 0) {
      return successResponse({ error: 'Stock não pode ser negativo' }, 400);
    }

    // Verificar se peça existe
    const existente = await prisma.pecas.findUnique({ where: { id: parseInt(id) } });
    if (!existente) {
      return successResponse({ error: 'Peça não encontrada' }, 404);
    }

    // Verificar duplicata de referência
    if (referencia !== existente.referencia) {
      const duplicada = await prisma.pecas.findUnique({ where: { referencia } });
      if (duplicada) {
        return successResponse({ error: 'Referência já existe' }, 400);
      }
    }

    // Atualizar peça
    const peca = await prisma.pecas.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        referencia,
        categoria: { connect: { id: Number(categoriaId) } },
        quantidade_stock: stock,
        nivel_stock_minimo: minStock,
        preco_venda: price,
        fornecedor_id: fornecedor_id || null,
        margem_lucro: margem_lucro !== undefined ? Number(margem_lucro) : null,
        notas: notas !== undefined ? notas : undefined
      }
    });

    // Buscar fornecedor se atribuído
    let fornecedorNome = null;
    if (fornecedor_id) {
      const fornecedor = await prisma.fornecedores.findUnique({
        where: { id: fornecedor_id },
        select: { nome: true }
      });
      fornecedorNome = fornecedor?.nome || null;
    }

    await registarAuditoria('UPDATE', 'pecas', Number(peca.id), null, { nome: peca.nome, referencia: peca.referencia, quantidade_stock: peca.quantidade_stock }, request);

    return successResponse(formatPecaResponse(peca, fornecedorNome));
  } catch (error) {
    return handleDatabaseError(error as Error);
  }
}
