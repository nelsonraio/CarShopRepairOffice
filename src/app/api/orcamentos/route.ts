import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ref_orcamento,
      cliente_id,
      veiculo_id,
      preparado_por,
      data_emissao,
      data_expiracao,
      estado,
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      notas,
      items
    } = body;

    // Create the budget
    const orcamento = await prisma.orcamentos.create({
      data: {
        ref_orcamento,
        cliente_id: parseInt(cliente_id),
        veiculo_id: veiculo_id ? BigInt(veiculo_id) : null,
        preparado_por: preparado_por ? parseInt(preparado_por) : null,
        data_emissao: data_emissao ? new Date(data_emissao) : new Date(),
        data_expiracao: data_expiracao ? new Date(data_expiracao) : null,
        estado: estado || 'pendente',
        total_pecas: parseFloat(total_pecas) || 0,
        total_mao_obra: parseFloat(total_mao_obra) || 0,
        total_desconto: parseFloat(total_desconto) || 0,
        total_imposto: parseFloat(total_imposto) || 0,
        total_geral: parseFloat(total_geral),
        notas
      }
    });

    // Create budget items
    if (items && items.length > 0) {
      const budgetItems = items.map((item: any) => ({
        orcamento_id: orcamento.id,
        tipo_item: item.type === 'service' ? 'servico' : 'peca',
        servico_id: item.type === 'service' ? parseInt(item.id) : null,
        peca_id: item.type === 'part' ? parseInt(item.id) : null,
        descricao: item.name,
        quantidade: parseFloat(item.quantity),
        preco_unitario: parseFloat(item.unitPrice),
        valor_total: parseFloat(item.total)
      }));

      await prisma.itens_orcamento.createMany({
        data: budgetItems
      });
    }

    return NextResponse.json({
      success: true,
      orcamento: {
        id: Number(orcamento.id),
        ref_orcamento: orcamento.ref_orcamento,
        total_geral: Number(orcamento.total_geral)
      }
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

       const orcamentos = await (prisma.orcamentos as any).findMany({
   include: {
        cliente: true,
        veiculo: true,
        itens_orcamento: true
      },
      orderBy: { criado_em: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.orcamentos.count();

    // Convert BigInt and Decimal fields to numbers for JSON serialization
    const serializedOrcamentos = orcamentos.map((orcamento: any) => ({
      ...orcamento,
      id: Number(orcamento.id),
      veiculo_id: orcamento.veiculo_id ? Number(orcamento.veiculo_id) : null,
      total_pecas: Number(orcamento.total_pecas),
      total_mao_obra: Number(orcamento.total_mao_obra),
      total_desconto: Number(orcamento.total_desconto),
      total_imposto: Number(orcamento.total_imposto),
      total_geral: Number(orcamento.total_geral),
      cliente: orcamento.cliente ? {
        ...orcamento.cliente,
        id: Number(orcamento.cliente.id),
        desconto: Number(orcamento.cliente.desconto)
      } : null,
      veiculo: orcamento.veiculo ? {
        ...orcamento.veiculo,
        id: Number(orcamento.veiculo.id)
      } : null,
      itens_orcamento: orcamento.itens_orcamento.map((item: any) => ({
        ...item,
        id: Number(item.id),
        orcamento_id: Number(item.orcamento_id),
        servico_id: item.servico_id ? Number(item.servico_id) : null,
        peca_id: item.peca_id ? Number(item.peca_id) : null,
        quantidade: Number(item.quantidade),
        preco_unitario: Number(item.preco_unitario),
        valor_total: Number(item.valor_total)
      }))
    }));

    // Fetch work orders and their mechanics for approved budgets
    const orcamentoIds = orcamentos.map((o: any) => o.id);
    const workOrders = await prisma.ordens_trabalho.findMany({
      where: {
        orcamento_id: {
          in: orcamentoIds
        }
      },
      include: {
        mecanico: true
      }
    });

    // Create a map of orcamento_id -> mecanico_nome
    const mechanicMap = new Map();
    workOrders.forEach((wo: any) => {
      if (wo.orcamento_id && wo.mecanico?.nome) {
        mechanicMap.set(Number(wo.orcamento_id), wo.mecanico.nome);
      }
    });

    // Add mecanico_nome to each orcamento
    const orcamentosWithMechanic = serializedOrcamentos.map((orcamento: any) => ({
      ...orcamento,
      mecanico_nome: mechanicMap.get(orcamento.id) || null
    }));



    return NextResponse.json({
      orcamentos: orcamentosWithMechanic,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });


  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { estado, mecanico_id } = body;

    if (!estado) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }


    // First, get the current budget to check its current state
    const currentOrcamento = await prisma.orcamentos.findUnique({
      where: { id: BigInt(id) },
      include: {
        itens_orcamento: true,
        cliente: true,
        veiculo: true
      }
    });

    if (!currentOrcamento) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Update the budget status
    const updateData: any = { estado };
    
    // If approving the budget, set the approval date
    if (estado === 'Aprovado') {
      updateData.data_aprovacao = new Date();
    }

    const updatedOrcamento = await prisma.orcamentos.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    // If the budget is being approved, create or update a work order
    if (estado === 'Aprovado') {
      // Generate work order reference from budget reference (replace ORC with OT)
      const workOrderRef = currentOrcamento.ref_orcamento.replace(/^ORC/, 'OT');

      // Check if a work order already exists for this budget
      const existingWorkOrder = await prisma.ordens_trabalho.findFirst({
        where: { orcamento_id: BigInt(id) }
      });

      if (existingWorkOrder) {
        // Update existing work order with the new mechanic (if provided)
        if (mecanico_id) {
          await prisma.ordens_trabalho.update({
            where: { id: existingWorkOrder.id },
            data: {
              mecanico_id: parseInt(mecanico_id)
            }
          });
          console.log(`Work order ${workOrderRef} updated with mechanic ID: ${mecanico_id}`);
        }
      } else {
        // Create a new work order
        const ordemTrabalho = await prisma.ordens_trabalho.create({
          data: {
            ref_ordem_trabalho: workOrderRef,
            cliente_id: currentOrcamento.cliente_id || 0,
            veiculo_id: currentOrcamento.veiculo_id ? BigInt(currentOrcamento.veiculo_id) : BigInt(0),
            orcamento_id: BigInt(id),
            mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
            data_inicio: new Date(),
            estado: 'em_andamento',
            total_pecas: currentOrcamento.total_pecas || 0,
            total_mao_obra: currentOrcamento.total_mao_obra || 0,
            total_desconto: currentOrcamento.total_desconto || 0,
            total_imposto: currentOrcamento.total_imposto || 0,
            total_geral: currentOrcamento.total_geral || 0
          }
        });

        // Copy budget items to work order items
        if (currentOrcamento.itens_orcamento && currentOrcamento.itens_orcamento.length > 0) {
          const workOrderItems = currentOrcamento.itens_orcamento.map((item: any) => ({
            ordem_trabalho_id: Number(ordemTrabalho.id),
            tipo_item: item.tipo_item,
            servico_id: item.servico_id ? Number(item.servico_id) : null,
            peca_id: item.peca_id ? Number(item.peca_id) : null,
            descricao: item.descricao,
            quantidade: item.quantidade || 1,
            preco_unitario: item.preco_unitario || 0,
            valor_desconto: item.valor_desconto || 0,
            valor_imposto: item.valor_imposto || 0,
            valor_total: item.valor_total || 0,
            notas: item.notas || null
          }));

          await prisma.itens_ordem_trabalho.createMany({
            data: workOrderItems
          });
        }

        console.log(`Work order created: ${workOrderRef} from budget ${currentOrcamento.ref_orcamento}`);
      }
    }

    return NextResponse.json({
      success: true,
      orcamento: {
        id: Number(updatedOrcamento.id),
        estado: updatedOrcamento.estado
      }
    });

  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }

    // Delete budget items first due to foreign key constraint
    await prisma.itens_orcamento.deleteMany({
      where: { orcamento_id: BigInt(id) }
    });

    // Delete the budget
    await prisma.orcamentos.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
