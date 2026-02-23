import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient();
const prismaAny = prisma as any;


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
      kms,
      contacto_nome,
      contacto_telefone,
      contacto_email,
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      notas,
      items
    } = body;

    // Create the budget
    const orcamento = await prismaAny.orcamentos.create({
      data: {
        ref_orcamento,
        cliente_id: parseInt(cliente_id),
        veiculo_id: veiculo_id ? BigInt(veiculo_id) : BigInt(0),
        preparado_por: preparado_por ? parseInt(preparado_por) : null,
        data_emissao: data_emissao ? new Date(data_emissao) : new Date(),
        data_expiracao: data_expiracao ? new Date(data_expiracao) : null,
        estado: estado || 'pendente',
        kms: kms ? parseInt(kms) : null,
        contacto_nome: contacto_nome || null,
        contacto_telefone: contacto_telefone || null,
        contacto_email: contacto_email || null,
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
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const orcamento = await prismaAny.orcamentos.findUnique({
        where: { id: BigInt(id) },
        include: {
          cliente: true,
          itens_orcamento: true
        }
      });

      if (!orcamento) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }

      // Fetch vehicle separately if needed
      let veiculo = null;
      if (orcamento.veiculo_id) {
        veiculo = await prisma.veiculos.findUnique({
          where: { id: orcamento.veiculo_id }
        });
      }

      const serialized = {
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
          id: Number(orcamento.cliente.id)
        } : null,
        veiculo: veiculo ? {
          ...veiculo,
          id: Number(veiculo.id)
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
      };

      return NextResponse.json({ orcamento: serialized });
    }
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
        id: Number(orcamento.cliente.id)
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
    const workOrders = await prismaAny.ordens_trabalho.findMany({
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
    const { estado, mecanico_id, items } = body;

    // First, get the current budget to check its current state
    const currentOrcamento = await prismaAny.orcamentos.findUnique({
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

    // Edit mode (full update)
    if (Array.isArray(items)) {
      const updateData: any = {
        ref_orcamento: body.ref_orcamento ?? currentOrcamento.ref_orcamento,
        cliente_id: body.cliente_id ? parseInt(body.cliente_id) : currentOrcamento.cliente_id,
        veiculo_id: body.veiculo_id ? BigInt(body.veiculo_id) : currentOrcamento.veiculo_id,
        data_emissao: body.data_emissao ? new Date(body.data_emissao) : currentOrcamento.data_emissao,
        data_expiracao: body.data_expiracao ? new Date(body.data_expiracao) : currentOrcamento.data_expiracao,
        estado: body.estado ?? currentOrcamento.estado,
        kms: body.kms ? parseInt(body.kms) : currentOrcamento.kms,
        contacto_nome: body.contacto_nome ?? currentOrcamento.contacto_nome,
        contacto_telefone: body.contacto_telefone ?? currentOrcamento.contacto_telefone,
        contacto_email: body.contacto_email ?? currentOrcamento.contacto_email,
        total_pecas: Number(body.total_pecas ?? currentOrcamento.total_pecas),
        total_mao_obra: Number(body.total_mao_obra ?? currentOrcamento.total_mao_obra),
        total_desconto: Number(body.total_desconto ?? currentOrcamento.total_desconto),
        total_imposto: Number(body.total_imposto ?? currentOrcamento.total_imposto),
        total_geral: Number(body.total_geral ?? currentOrcamento.total_geral),
        notas: body.notas ?? currentOrcamento.notas
      };

      await prismaAny.orcamentos.update({
        where: { id: BigInt(id) },
        data: updateData
      });

      await prisma.itens_orcamento.deleteMany({
        where: { orcamento_id: BigInt(id) }
      });

      const budgetItems = items.map((item: any) => {
        const parsedId = parseInt(item.id, 10);
        const hasNumericId = Number.isFinite(parsedId);

        return {
          orcamento_id: BigInt(id),
          tipo_item: item.type === 'service' ? 'servico' : 'peca',
          servico_id: item.type === 'service' && hasNumericId ? parsedId : null,
          peca_id: item.type === 'part' && hasNumericId ? parsedId : null,
          descricao: item.name,
          quantidade: parseFloat(item.quantity),
          preco_unitario: parseFloat(item.unitPrice),
          valor_total: parseFloat(item.total)
        };
      });

      if (budgetItems.length > 0) {
        await prisma.itens_orcamento.createMany({
          data: budgetItems
        });
      }

      return NextResponse.json({ success: true });
    }

    if (!estado) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update the budget status
    const updateData: any = { estado };
    
    // If approving the budget, set the approval date
    if (estado === 'Aprovado') {
      updateData.data_aprovacao = new Date();
    }

    const updatedOrcamento = await prismaAny.orcamentos.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    // If the budget is being approved, create or update a work order
    if (estado === 'Aprovado') {
      // Generate work order reference from budget reference (OT- + resto igual ao orçamento)
      const workOrderRef = currentOrcamento.ref_orcamento
        .replace(/^ORC-?/i, 'OT-')
        .replace(/^OR-?/i, 'OT-');

      // Update related appointment to "em_aprovacao" status
      if (currentOrcamento.cliente_id || currentOrcamento.veiculo_id) {
        let matricula: string | null = null;
        if (currentOrcamento.veiculo_id) {
          const veiculo = await prisma.veiculos.findUnique({
            where: { id: currentOrcamento.veiculo_id },
            select: { matricula: true }
          });
          matricula = veiculo?.matricula ?? null;
        }

        const where: any = {
          estado: 'agendado'
        };

        if (currentOrcamento.cliente_id) {
          where.cliente_id = currentOrcamento.cliente_id;
        }

        if (matricula) {
          where.matricula = matricula;
        }

        await prisma.agendamentos.updateMany({
          where,
          data: {
            estado: 'em_aprovacao'
          }
        });
      }

      // Check if a work order already exists for this budget
      const existingWorkOrder = await prisma.ordens_trabalho.findFirst({
        where: { orcamento_id: BigInt(id) }
      });

      if (existingWorkOrder) {
        // Update existing work order with the new mechanic (if provided)
        const workOrderUpdateData: any = {
          contacto_nome: currentOrcamento.contacto_nome ?? null,
          contacto_telefone: currentOrcamento.contacto_telefone ?? null,
          contacto_email: currentOrcamento.contacto_email ?? null
        };

        if (mecanico_id) {
          workOrderUpdateData.mecanico_id = parseInt(mecanico_id);
        }

        await prismaAny.ordens_trabalho.update({
          where: { id: existingWorkOrder.id },
          data: workOrderUpdateData
        });
        console.log(`Work order ${workOrderRef} updated`);
      } else {
        // Create a new work order
        const ordemTrabalho = await prismaAny.ordens_trabalho.create({
          data: {
            ref_ordem_trabalho: workOrderRef,
            cliente_id: currentOrcamento.cliente_id || 0,
            veiculo_id: currentOrcamento.veiculo_id ? BigInt(currentOrcamento.veiculo_id) : BigInt(0),
            orcamento_id: BigInt(id),
            mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
            data_inicio: new Date(),
            estado: 'em_andamento',
            kms: currentOrcamento.kms || null,
            contacto_nome: currentOrcamento.contacto_nome ?? null,
            contacto_telefone: currentOrcamento.contacto_telefone ?? null,
            contacto_email: currentOrcamento.contacto_email ?? null,
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
            quantidade: Number(item.quantidade) || 1,
            preco_unitario: Number(item.preco_unitario) || 0,
            valor_desconto: Number(item.valor_desconto) || 0,
            valor_imposto: Number(item.valor_imposto) || 0,
            valor_total: Number(item.valor_total) || 0,
            notas: item.notas || null
          }));

          await prisma.itens_ordem_trabalho.createMany({
            data: workOrderItems
          });
          
          console.log(`Created ${workOrderItems.length} work order items for ${workOrderRef}`);
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
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

// PATCH method - same functionality as PUT
export async function PATCH(request: Request) {
  return PUT(request);
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
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}


