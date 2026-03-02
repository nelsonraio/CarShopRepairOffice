import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const pecas = await prisma.pecas.findMany({
      where: {
        ativo: true
      },
      orderBy: { nome: 'asc' }
    });

    // Get all supplier IDs that are used in the parts
    const fornecedorIds = [...new Set(pecas.map((p: typeof pecas[number]) => p.fornecedor_id).filter(Boolean))];
    
    // Fetch suppliers if there are any
    const fornecedoresMap = new Map();
    if (fornecedorIds.length > 0) {
      const fornecedores = await prisma.fornecedores.findMany({
        where: {
          id: { in: fornecedorIds as number[] }
        },
        select: {
          id: true,
          nome: true
        }
      });
      fornecedores.forEach((f: typeof fornecedores[number]) => fornecedoresMap.set(f.id, f.nome));
    }

    // Convert BigInt id to string for JSON serialization
    const serializedPecas = pecas.map((peca: typeof pecas[number]) => ({
      id: String(peca.id),
      referencia: peca.referencia,
      nome: peca.nome,
      categoria: peca.categoria,
      quantidade_stock: peca.quantidade_stock,
      nivel_stock_minimo: peca.nivel_stock_minimo,
      preco_venda: peca.preco_venda,
      ativo: peca.ativo,
      fornecedor_id: peca.fornecedor_id,
      fornecedor_nome: peca.fornecedor_id ? fornecedoresMap.get(peca.fornecedor_id) || null : null,
      margem_lucro: peca.margem_lucro ? Number(peca.margem_lucro) : null
    }));

    return NextResponse.json(serializedPecas);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Error fetching pecas:', error);
    return NextResponse.json({ error: 'Failed to fetch pecas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      nome,
      referencia,
      categoria,
      stock,
      minStock,
      price,
      fornecedor_id,
      supplierName,
      descricao,
      margem_lucro
    } = body;

    // Ensure stock values are not negative
    if (stock !== undefined && stock < 0) {
      return NextResponse.json({ error: 'O stock não pode ser negativo' }, { status: 400 });
    }
    if (minStock !== undefined && minStock < 0) {
      return NextResponse.json({ error: 'O stock mínimo não pode ser negativo' }, { status: 400 });
    }

    // Check if reference already exists
    const existingPeca = await prisma.pecas.findUnique({
      where: { referencia }
    });

    if (existingPeca) {
      return NextResponse.json(
        { error: 'Já existe uma peça com esta referência' },
        { status: 400 }
      );
    }

    const newPeca = await prisma.pecas.create({
      data: {
        nome,
        referencia,
        categoria,
        quantidade_stock: stock,
        nivel_stock_minimo: minStock,
        preco_venda: price,
        custo_unitario: 0, // Default to 0, can be updated later
        descricao: descricao || null,
        ativo: true,
        fornecedor_id: fornecedor_id || null,
        margem_lucro: margem_lucro ? Number(margem_lucro) : null
      }
    });

    // Get the supplier name if fornecedor_id was provided
    let fornecedorNome = null;
    if (fornecedor_id) {
      const fornecedor = await prisma.fornecedores.findUnique({
        where: { id: fornecedor_id },
        select: { nome: true }
      });
      fornecedorNome = fornecedor?.nome || null;
    }

    return NextResponse.json({
      id: String(newPeca.id),
      nome: newPeca.nome,
      referencia: newPeca.referencia,
      categoria: newPeca.categoria,
      stock: newPeca.quantidade_stock,
      minStock: newPeca.nivel_stock_minimo,
      price: newPeca.preco_venda,
      fornecedor_id: newPeca.fornecedor_id,
      fornecedor_nome: fornecedorNome,
      supplierName: fornecedorNome,
      stockStatus: (newPeca.quantidade_stock ?? 0) === 0 ? 'esgotado' : 
                   (newPeca.quantidade_stock ?? 0) <= (newPeca.nivel_stock_minimo ?? 0) ? 'baixo_stock' : 'em_stock',
      margem_lucro: newPeca.margem_lucro ? Number(newPeca.margem_lucro) : null
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Error creating peca:', error);
    return NextResponse.json(
      { error: 'Falha ao criar peça' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const {
      id,
      nome,
      referencia,
      categoria,
      stock,
      minStock,
      price,
      fornecedor_id,
      supplierName,
      margem_lucro
    } = body;

    // Prevent negative stock adjustments
    if (stock !== undefined && stock < 0) {
      return NextResponse.json({ error: 'O stock não pode ser negativo' }, { status: 400 });
    }
    if (minStock !== undefined && minStock < 0) {
      return NextResponse.json({ error: 'O stock mínimo não pode ser negativo' }, { status: 400 });
    }

    // Check if the part exists
    const existingPeca = await prisma.pecas.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPeca) {
      return NextResponse.json(
        { error: 'Peça não encontrada' },
        { status: 404 }
      );
    }

    // Check if reference already exists for another part
    if (referencia !== existingPeca.referencia) {
      const duplicatePeca = await prisma.pecas.findUnique({
        where: { referencia }
      });

      if (duplicatePeca) {
        return NextResponse.json(
          { error: 'Já existe uma peça com esta referência' },
          { status: 400 }
        );
      }
    }

    const updatedPeca = await prisma.pecas.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        referencia,
        categoria,
        quantidade_stock: stock,
        nivel_stock_minimo: minStock,
        preco_venda: price,
        fornecedor_id: fornecedor_id || null,
        margem_lucro: margem_lucro !== undefined ? Number(margem_lucro) : null
      }
    });

    // Get the supplier name if fornecedor_id was provided
    let fornecedorNome = null;
    if (fornecedor_id) {
      const fornecedor = await prisma.fornecedores.findUnique({
        where: { id: fornecedor_id },
        select: { nome: true }
      });
      fornecedorNome = fornecedor?.nome || supplierName || null;
    }

    return NextResponse.json({
      id: String(updatedPeca.id),
      nome: updatedPeca.nome,
      referencia: updatedPeca.referencia,
      categoria: updatedPeca.categoria,
      quantidade_stock: updatedPeca.quantidade_stock,
      nivel_stock_minimo: updatedPeca.nivel_stock_minimo,
      preco_venda: updatedPeca.preco_venda,
      fornecedor_id: updatedPeca.fornecedor_id,
      fornecedor_nome: fornecedorNome,
      supplierName: fornecedorNome,
      stockStatus: (updatedPeca.quantidade_stock ?? 0) === 0 ? 'esgotado' : 
                   (updatedPeca.quantidade_stock ?? 0) <= (updatedPeca.nivel_stock_minimo ?? 0) ? 'baixo_stock' : 'em_stock',
      margem_lucro: updatedPeca.margem_lucro ? Number(updatedPeca.margem_lucro) : null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
    console.error('Error updating peca:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar peça' },
      { status: 500 }
    );
  }
}
