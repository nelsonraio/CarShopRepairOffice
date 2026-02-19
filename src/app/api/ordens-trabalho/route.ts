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
          itens_ordem_trabalho: true,
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
      const responseData = {
        ...ordemTrabalho,
        id: String(ordemTrabalho.id),
        veiculo_id: ordemTrabalho.veiculo_id ? String(ordemTrabalho.veiculo_id) : null,
        itens_ordem_trabalho: ordemTrabalho.itens_ordem_trabalho?.map((item: any) => ({
          ...item,
          id: String(item.id),
          ordem_trabalho_id: String(item.ordem_trabalho_id),
          servico_id: item.servico_id ? String(item.servico_id) : null,
          peca_id: item.peca_id ? String(item.peca_id) : null,
        })),
        cliente_nome: cliente?.nome ?? '',
        contacto_nome: ordemTrabalho.contacto_nome ?? null,
        contacto_telefone: ordemTrabalho.contacto_telefone ?? cliente?.telefone ?? null,
        contacto_email: ordemTrabalho.contacto_email ?? cliente?.email ?? null,
        veiculo_info: veiculo ? `${veiculo.marca} ${veiculo.modelo} | ${veiculo.matricula}` : '',
        mecanico: ordemTrabalho.mecanico ? {
          ...ordemTrabalho.mecanico,
          id: String(ordemTrabalho.mecanico.id),
        } : null,
      };

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

    const clienteMap = new Map(clientes.map(c => [c.id, c]));
    const veiculoMap = new Map(veiculos.map(v => [v.id, v]));

    const transformedOrdens = (ordensTrabalho as any[]).map((ordem: any) => ({
      id: ordem.ref_ordem_trabalho,
      client: clienteMap.get(ordem.cliente_id)?.nome ?? '',
      contacto_nome: ordem.contacto_nome ?? null,
      contacto_telefone: ordem.contacto_telefone ?? clienteMap.get(ordem.cliente_id)?.telefone ?? null,
      contacto_email: ordem.contacto_email ?? clienteMap.get(ordem.cliente_id)?.email ?? null,
      vehicle: `${veiculoMap.get(ordem.veiculo_id)?.marca ?? ''} ${veiculoMap.get(ordem.veiculo_id)?.modelo ?? ''} | ${veiculoMap.get(ordem.veiculo_id)?.matricula ?? ''}`,
      mechanic: ordem.mecanico?.nome ?? '', // Directly access the included mechanic's name
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
    console.error('Error fetching ordens_trabalho:', error);
    return NextResponse.json({ error: 'Failed to fetch ordens_trabalho' }, { status: 500 });
  }
}

function mapStatus(status: string | null): 'Em Andamento' | 'Aguarda Peças' | 'Concluído' | 'Entregue' | 'Cancelado' | 'Em Aprovação' {
  switch (status) {
    case 'em_aprovacao': return 'Em Aprovação';
    case 'em_andamento': return 'Em Andamento';
    case 'aguarda_peca': return 'Aguarda Peças';
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
      'Em Andamento': 'em_andamento',
      'Aguarda Peças': 'aguarda_peca',
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

    // If changing to "Aguarda Peças" and selectedPartIds are provided
    if (estado === 'Aguarda Peças' && selectedPartIds && Array.isArray(selectedPartIds)) {
      // First, reset all parts to not waiting
      await prisma.itens_ordem_trabalho.updateMany({
        where: { 
          ordem_trabalho_id: Number(ordemTrabalho.id),
          tipo_item: 'peca'
        },
        data: { aguarda_peca: false }
      });

      // Then mark selected parts as waiting
      if (selectedPartIds.length > 0) {
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
          console.error('Error updating parts:', err);
        }
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
    console.error('Error updating work order:', error);
    return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 });
  }
}
