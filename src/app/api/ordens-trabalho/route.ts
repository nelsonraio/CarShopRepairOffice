import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});
const prismaAny = prisma as any;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ref_ordem_trabalho,
      cliente_id,
      veiculo_id,
      mecanico_id,
      orcamento_id,
      data_inicio,
      data_conclusao,
      estado,
      kms,
      descricao_problema,
      trabalho_realizado,
      recomendacoes,
      contacto_nome,
      contacto_telefone,
      contacto_email,
      total_pecas,
      total_mao_obra,
      total_desconto,
      total_imposto,
      total_geral,
      items
    } = body;

    // Create the work order - use any type to handle BigInt issue
    const ordemTrabalhoData: any = {
      ref_ordem_trabalho,
      cliente_id: parseInt(cliente_id),
      mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
      orcamento_id: orcamento_id ? BigInt(orcamento_id) : null,
      data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
      data_conclusao: data_conclusao ? new Date(data_conclusao) : null,
      estado: estado || 'em_andamento',
      kms: kms ? parseInt(kms) : null,
      descricao_problema,
      trabalho_realizado,
      recomendacoes,
      contacto_nome: contacto_nome || null,
      contacto_telefone: contacto_telefone || null,
      contacto_email: contacto_email || null,
      total_pecas: parseFloat(total_pecas) || 0,
      total_mao_obra: parseFloat(total_mao_obra) || 0,
      total_desconto: parseFloat(total_desconto) || 0,
      total_imposto: parseFloat(total_imposto) || 0,
      total_geral: parseFloat(total_geral) || 0
    };
    
    // Only add veiculo_id if provided (required in schema)
    if (veiculo_id) {
      ordemTrabalhoData.veiculo_id = BigInt(veiculo_id);
    }

    const ordemTrabalho = await prismaAny.ordens_trabalho.create({
      data: ordemTrabalhoData
    });

    // Create work order items if provided
    if (items && items.length > 0) {
      const workOrderItems = items.map((item: any) => ({
        ordem_trabalho_id: ordemTrabalho.id,
        tipo_item: item.tipo_item || (item.type === 'service' ? 'servico' : 'peca'),
        servico_id: item.servico_id || (item.servico_id ? parseInt(item.servico_id) : null),
        peca_id: item.peca_id || (item.peca_id ? parseInt(item.peca_id) : null),
        descricao: item.descricao || item.name,
        quantidade: parseFloat(item.quantidade || item.quantity) || 1,
        preco_unitario: parseFloat(item.preco_unitario || item.unitPrice) || 0,
        valor_desconto: parseFloat(item.valor_desconto || item.desconto) || 0,
        valor_imposto: parseFloat(item.valor_imposto) || 0,
        valor_total: parseFloat(item.valor_total || item.total) || 0,
        notas: item.notas || item.notes || null
      }));

      await prisma.itens_ordem_trabalho.createMany({
        data: workOrderItems
      });
    }

    return NextResponse.json({
      success: true,
      ordem_trabalho: {
        id: Number(ordemTrabalho.id),
        ref_ordem_trabalho: ordemTrabalho.ref_ordem_trabalho
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
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If ID is provided, fetch single work order with items
    if (id) {
      const ordemTrabalho = await prismaAny.ordens_trabalho.findUnique({
        where: { ref_ordem_trabalho: id },
        include: {
          mecanico: true,
          itens_ordem_trabalho: {
            select: {
              id: true,
              tipo_item: true,
              descricao: true,
              quantidade: true,
              preco_unitario: true,
              valor_total: true,
              aguarda_peca: true
            }
          },
          orcamento: {
            include: { itens_orcamento: true }
          }
        },
      });

      if (!ordemTrabalho) {
        return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
      }

      const cliente = await prisma.clientes.findUnique({
        where: { id: ordemTrabalho.cliente_id },
      });

      const veiculo = ordemTrabalho.veiculo_id
        ? await prisma.veiculos.findUnique({
            where: { id: ordemTrabalho.veiculo_id },
          })
        : null;

      // Convert BigInt fields to strings for JSON serialization
      // Get waiting parts from items marked as awaiting
      const waitingPartsData = ordemTrabalho.itens_ordem_trabalho
        ?.filter((item: any) => item.tipo_item === 'peca' && item.aguarda_peca)
        .map((item: any) => ({
          id: Number(item.id),
          descricao: item.descricao ?? '',
          quantidade: Number(item.quantidade) || 0,
          valor_total: Number(item.valor_total) || 0
        })) ?? [];

      // construct object shape similar to front-end WorkOrder
      const responseData: any = {
        id: String(ordemTrabalho.id),
        client: cliente?.nome ?? '',
        vehicle: veiculo ? `${veiculo.marca} ${veiculo.modelo} | ${veiculo.matricula}` : '',
        mechanic: ordemTrabalho.mecanico?.nome ?? '',
        openDate: ordemTrabalho.data_inicio ? ordemTrabalho.data_inicio.toLocaleDateString('pt-PT') : '',
        closeDate: ordemTrabalho.data_conclusao ? ordemTrabalho.data_conclusao.toLocaleDateString('pt-PT') : '',
        status: mapStatus(ordemTrabalho.estado),
        priority: mapPriority(ordemTrabalho.prioridade ?? null),
        problem: ordemTrabalho.descricao_problema ?? '',
        waitingParts: waitingPartsData,
        itens_ordem_trabalho: ordemTrabalho.itens_ordem_trabalho?.map((item: any) => ({
          id: Number(item.id),
          tipo_item: item.tipo_item,
          descricao: item.descricao ?? '',
          quantidade: Number(item.quantidade) || 0,
          preco_unitario: Number(item.preco_unitario) || 0,
          valor_total: Number(item.valor_total) || 0
        })) ?? [],
        orcamento: ordemTrabalho.orcamento ? {
          id: String(ordemTrabalho.orcamento.id),
          ref_orcamento: ordemTrabalho.orcamento.ref_orcamento,
          itens_orcamento: ordemTrabalho.orcamento.itens_orcamento?.map((item: any) => ({
            id: String(item.id),
            descricao: item.descricao ?? '',
            quantidade: Number(item.quantidade) || 0,
            valor_total: Number(item.valor_total) || 0,
          }))
        } : undefined,
      };

      // include orcamento details if present
      if (ordemTrabalho.orcamento) {
        responseData.orcamento = {
          id: String(ordemTrabalho.orcamento.id),
          ref_orcamento: ordemTrabalho.orcamento.ref_orcamento,
          itens_orcamento: ordemTrabalho.orcamento.itens_orcamento?.map((item: any) => ({
            ...item,
            id: String(item.id),
            orcamento_id: String(item.orcamento_id),
            servico_id: item.servico_id ? String(item.servico_id) : null,
            peca_id: item.peca_id ? String(item.peca_id) : null,
          }))
        };
      }

      // Use JSON.parse/stringify to handle any remaining BigInt values
      const jsonString = JSON.stringify(responseData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );

      return new Response(jsonString, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Otherwise, fetch all work orders
    const ordensTrabalho = await prismaAny.ordens_trabalho.findMany({
      orderBy: { criado_em: 'desc' },
      include: {
        mecanico: true, // Include the related mechanic's data
        itens_ordem_trabalho: {
          select: {
            id: true,
            tipo_item: true,
            descricao: true,
            quantidade: true,
            preco_unitario: true,
            valor_total: true,
            aguarda_peca: true
          }
        }
      },
    });

    const clienteIds = Array.from(new Set((ordensTrabalho as any[])
      .map((o: any) => o.cliente_id)
      .filter((v: any): v is number => v != null))) as number[];
    const veiculoIds = Array.from(new Set((ordensTrabalho as any[])
      .map((o: any) => o.veiculo_id)
      .filter((v: any): v is bigint => v != null))) as bigint[];

    const [clientes, veiculos] = await Promise.all([
      clienteIds.length ? prisma.clientes.findMany({ where: { id: { in: clienteIds } } }) : Promise.resolve([]),
      veiculoIds.length ? prisma.veiculos.findMany({ where: { id: { in: veiculoIds } } }) : Promise.resolve([]),
    ]);

    const clienteMap = new Map<number, typeof clientes[number]>(clientes.map((c: typeof clientes[number]) => [c.id, c]));
    const veiculoMap = new Map<number, typeof veiculos[number]>(veiculos.map((v: typeof veiculos[number]) => [Number(v.id), v]));

    // Buscar todos os mecânicos se necessário
    const mecanicoIds = Array.from(new Set((ordensTrabalho as any[])
      .map((o: any) => o.mecanico_id)
      .filter((v: any): v is number => v != null))) as number[];
    const mecanicos = mecanicoIds.length ? await prisma.mecanicos.findMany({ where: { id: { in: mecanicoIds } } }) : [];
    const mecanicoMap = new Map<number, typeof mecanicos[number]>(mecanicos.map((m: typeof mecanicos[number]) => [m.id, m]));

    const transformedOrdens = (ordensTrabalho as any[]).map((ordem: any) => ({
      id: ordem.ref_ordem_trabalho,
      client: clienteMap.get(ordem.cliente_id)?.nome ?? '',
      contacto_nome: ordem.contacto_nome ?? null,
      contacto_telefone: ordem.contacto_telefone ?? clienteMap.get(ordem.cliente_id)?.telefone ?? null,
      contacto_email: ordem.contacto_email ?? clienteMap.get(ordem.cliente_id)?.email ?? null,
      vehicle: `${veiculoMap.get(Number(ordem.veiculo_id))?.marca ?? ''} ${veiculoMap.get(Number(ordem.veiculo_id))?.modelo ?? ''} | ${veiculoMap.get(Number(ordem.veiculo_id))?.matricula ?? ''}`,
      mechanic: ordem.mecanico?.nome ?? mecanicoMap.get(ordem.mecanico_id)?.nome ?? '',
      mecanico_nome: ordem.mecanico?.nome ?? mecanicoMap.get(ordem.mecanico_id)?.nome ?? '',
      openDate: ordem.data_inicio ? ordem.data_inicio.toLocaleDateString('pt-PT') : '',
      closeDate: ordem.data_conclusao ? ordem.data_conclusao.toLocaleDateString('pt-PT') : '',
      total: Number(ordem.total_geral) || 0,
      status: mapStatus(ordem.estado),
      priority: mapPriority(ordem.prioridade ?? null),
      problem: ordem.descricao_problema ?? '',
      waitingParts: ordem.itens_ordem_trabalho
        ?.filter((item: any) => item.tipo_item === 'peca' && item.aguarda_peca)
        .map((item: any) => ({
          id: Number(item.id),
          descricao: item.descricao ?? '',
          quantidade: Number(item.quantidade) || 0,
          valor_total: Number(item.valor_total) || 0
        })) ?? [],
      items: ordem.itens_ordem_trabalho?.map((item: any) => ({
        id: Number(item.id),
        tipo_item: item.tipo_item,
        descricao: item.descricao ?? '',
        quantidade: Number(item.quantidade) || 0,
        preco_unitario: Number(item.preco_unitario) || 0,
        valor_total: Number(item.valor_total) || 0
      })) ?? [],
    }));

    return NextResponse.json(transformedOrdens);
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
    console.error('Error fetching ordens_trabalho:', error);
    return NextResponse.json({ error: 'Failed to fetch ordens_trabalho' }, { status: 500 });
  }
}

function mapStatus(status: string | null): 'Em Andamento' | 'Aguarda Peças' | 'Concluído' | 'Entregue' | 'Cancelado' | 'Em Aprovação' | 'Aprovado' {
  switch (status) {
    case 'em_aprovacao': return 'Em Aprovação';
    case 'aprovado': return 'Aprovado';
    case 'aguarda_peca': return 'Aguarda Peças';
    case 'em_andamento': return 'Em Andamento';
    case 'concluido': return 'Concluído';
    case 'entregue': return 'Entregue';
    case 'cancelado': return 'Cancelado';
    default: return 'Em Andamento';
  }
}

function mapPriority(priority: string | null): 'Baixa' | 'Normal' | 'Alta' | 'Urgente' {
  switch (priority) {
    case 'baixa': return 'Baixa';
    case 'alta': return 'Alta';
    case 'urgente': return 'Urgente';
    default: return 'Normal';
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Work order ID is required' }, { status: 400 });
    }

    // First, get the work order to find its internal ID
    const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
      where: { ref_ordem_trabalho: id }
    });

    if (!ordemTrabalho) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Delete work order items first due to foreign key constraint
    await prisma.itens_ordem_trabalho.deleteMany({
      where: { ordem_trabalho_id: Number(ordemTrabalho.id) }
    });

    // Delete the work order
    await prisma.ordens_trabalho.delete({
      where: { ref_ordem_trabalho: id }
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
    console.error('Error deleting work order:', error);
    return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado, data_conclusao, waitingParts, selectedPartIds } = body;

    if (!id) {
      return NextResponse.json({ error: 'Work order ID is required' }, { status: 400 });
    }

    // Map frontend status to database status
    // Database valid values: 'pendente', 'em_andamento', 'concluido', 'cancelado', 'faturado'
    const statusMap: Record<string, string> = {
      'Em Aprovação': 'em_aprovacao',
      'Aprovado': 'aprovado',
      'Aguarda Peças': 'aguarda_peca',
      'Em Andamento': 'em_andamento',
      'Concluído': 'concluido',
      'Entregue': 'entregue',
      'Cancelado': 'cancelado'
    };

    const dbEstado = estado ? statusMap[estado] || estado : undefined;

    // Build update data
    const updateData: any = {};
    
    if (dbEstado) {
      updateData.estado = dbEstado;
      
      // Auto-stamp conclusion date when status changes to 'concluido'
      if (dbEstado === 'concluido' && !data_conclusao) {
        updateData.data_conclusao = new Date();
      }
      // Clear conclusion date when reverting to states before 'concluido'
      else if ((dbEstado === 'em_andamento' || dbEstado === 'aguarda_peca') && !data_conclusao) {
        updateData.data_conclusao = null;
      }
    }
    
    if (data_conclusao && data_conclusao.trim()) {
      updateData.data_conclusao = new Date(data_conclusao);
    }

    // Get the work order to find its internal ID
    const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
      where: { ref_ordem_trabalho: id }
    });

    if (!ordemTrabalho) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Update the work order
    const updatedOrder = await prisma.ordens_trabalho.update({
      where: { ref_ordem_trabalho: id },
      data: updateData
    });

    if (dbEstado === 'concluido' || dbEstado === 'em_andamento') {
      await prisma.itens_ordem_trabalho.updateMany({
        where: {
          ordem_trabalho_id: Number(ordemTrabalho.id),
          tipo_item: 'peca'
        },
        data: { aguarda_peca: false }
      });
    }

    // If changing to "concluido" (and wasn't already concluido), deduct parts from stock
    if (dbEstado === 'concluido' && ordemTrabalho.estado !== 'concluido') {
      const itensOrdem = await prisma.itens_ordem_trabalho.findMany({
        where: {
          ordem_trabalho_id: Number(ordemTrabalho.id),
          tipo_item: 'peca',
          peca_id: { not: null }
        },
        select: {
          peca_id: true,
          quantidade: true
        }
      });

      // Update stock for each part used
      for (const item of itensOrdem) {
        if (item.peca_id && item.quantidade) {
          try {
            // clamp stock so it never goes negative
            const current = await prisma.pecas.findUnique({
              where: { id: BigInt(item.peca_id) },
              select: { quantidade_stock: true }
            });
            const decrement = Math.floor(Number(item.quantidade));
            let newStock = (current?.quantidade_stock ?? 0) - decrement;
            if (newStock < 0) newStock = 0;

            await prisma.pecas.update({
              where: { id: BigInt(item.peca_id) },
              data: {
                quantidade_stock: newStock
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
            console.error(`Failed to update stock for part ${item.peca_id}:`, error);
            // Continue processing other parts even if one fails
          }
        }
      }
    }

    // If changing to "Aguarda Peças"
    if (estado === 'Aguarda Peças') {
      // First, reset all parts to not waiting
      await prisma.itens_ordem_trabalho.updateMany({
        where: { 
          ordem_trabalho_id: Number(ordemTrabalho.id),
          tipo_item: 'peca'
        },
        data: { aguarda_peca: false }
      });

      // Check if selectedPartIds are provided
      if (selectedPartIds && Array.isArray(selectedPartIds) && selectedPartIds.length > 0) {
        try {
          // Convert IDs to number for the database query
          const numericIds = selectedPartIds.map((id: any) => {
            const numId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
            return isNaN(numId) ? null : numId;
          }).filter((id: any): id is number => id !== null);

          if (numericIds.length > 0) {
            await prisma.itens_ordem_trabalho.updateMany({
              where: {
                id: { in: numericIds },
                ordem_trabalho_id: Number(ordemTrabalho.id),
                tipo_item: 'peca'
              },
              data: { aguarda_peca: true }
            });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          const isDbOffline =
            errorMessage.includes("reach database server") ||
            errorMessage.includes("ECONNREFUSED");

          if (isDbOffline) {
            return NextResponse.json(
              { error: "Database unavailable. Please start the database server and try again." },
              { status: 503 }
            );
          }
          console.error('Error updating parts:', err);
        }
      } else {
        // If no specific parts selected, mark ALL parts as waiting
        await prisma.itens_ordem_trabalho.updateMany({
          where: { 
            ordem_trabalho_id: Number(ordemTrabalho.id),
            tipo_item: 'peca'
          },
          data: { aguarda_peca: true }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      ordem_trabalho: {
        id: updatedOrder.ref_ordem_trabalho,
        estado: updatedOrder.estado
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
    console.error('Error updating work order:', error);
    return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 });
  }
}


