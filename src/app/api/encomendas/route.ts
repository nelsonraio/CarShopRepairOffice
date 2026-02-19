import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info']
});
const prismaAny = prisma as any;

const toDateString = (value: Date | null) => (value ? value.toISOString() : null);

const calculateDiasAtraso = (previsto: Date | null, real: Date | null, estado: string) => {
  if (!previsto) return 0;
  if (estado === 'cancelado') return 0;
  const baseDate = real ?? new Date();
  const diffMs = baseDate.setHours(0, 0, 0, 0) - new Date(previsto).setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export async function GET() {
  try {
    const encomendas = await prismaAny.encomendas_pecas.findMany({
      include: {
        fornecedor: true,
        itens: true
      },
      orderBy: { criado_em: 'desc' }
    });

    const serialized = encomendas.map((enc: any) => ({
      id: String(enc.id),
      numero_encomenda: enc.numero_encomenda,
      fornecedor_id: String(enc.fornecedor_id),
      fornecedor_nome: enc.fornecedor?.nome || '',
      data_encomenda: toDateString(enc.data_encomenda),
      data_entrega_estimada: toDateString(enc.data_entrega_estimada),
      data_entrega_real: toDateString(enc.data_entrega_real),
      estado: enc.estado,
      custo_total: Number(enc.custo_total),
      dias_atraso: calculateDiasAtraso(enc.data_entrega_estimada, enc.data_entrega_real, enc.estado),
      itens: (enc.itens || []).map((item: any) => ({
        id: String(item.id),
        peca_id: String(item.peca_id),
        quantidade_encomendada: item.quantidade_encomendada,
        quantidade_recebida: item.quantidade_recebida,
        preco_unitario: Number(item.preco_unitario),
        estado: item.estado
      }))
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching encomendas:', error);
    return NextResponse.json({ error: 'Failed to fetch encomendas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📨 Pedido POST encomendas:', body);
    
    const { fornecedor_id, data_entrega_estimada, itens } = body;

    if (!fornecedor_id) {
      console.error('❌ Erro: Fornecedor obrigatorio');
      return NextResponse.json({ error: 'Fornecedor obrigatorio' }, { status: 400 });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      console.error('❌ Erro: Itens obrigatorios');
      return NextResponse.json({ error: 'Itens obrigatorios' }, { status: 400 });
    }

    const custo_total = itens.reduce((sum: number, item: any) => {
      const quantidade = Number(item.quantidade_encomendada) || 0;
      const preco = Number(item.preco_unitario) || 0;
      return sum + quantidade * preco;
    }, 0);

    console.log(`📊 Custo total calculado: ${custo_total}`);

    let created;
    try {
      created = await prismaAny.$transaction(async (tx: any) => {
        console.log('🔄 Iniciando transação...');
        
        const year = new Date().getFullYear();
        const lastEncomenda = await tx.encomendas_pecas.findFirst({
          where: {
            numero_encomenda: { startsWith: `ENC-${year}-` }
          },
          orderBy: { id: 'desc' },
          select: { numero_encomenda: true }
        });
        
        const lastSeq = lastEncomenda?.numero_encomenda
          ? Number(lastEncomenda.numero_encomenda.split('-').pop())
          : 0;
        const nextNumber = lastSeq + 1;
        const numero_encomenda = `ENC-${year}-${String(nextNumber).padStart(6, '0')}`;
        console.log(`📝 Número de encomenda gerado: ${numero_encomenda}`);

        const encomenda = await tx.encomendas_pecas.create({
          data: {
            numero_encomenda,
            fornecedor_id: parseInt(fornecedor_id),
            data_encomenda: new Date(),
            data_entrega_estimada: data_entrega_estimada ? new Date(data_entrega_estimada) : null,
            estado: 'pendente',
            custo_total: parseFloat(custo_total.toFixed(2))
          }
        });
        
        console.log(`✅ Encomenda criada com ID: ${encomenda.id}`);

        const itensData = itens.map((item: any) => {
          const qtd = Number(item.quantidade_encomendada) || 1;
          const preco = Number(item.preco_unitario) || 0;
          const total = qtd * preco;
          
          return {
            encomenda_id: encomenda.id,
            peca_id: BigInt(item.peca_id),
            quantidade_encomendada: qtd,
            quantidade_recebida: 0,
            preco_unitario: parseFloat(preco.toFixed(2)),
            preco_total: parseFloat(total.toFixed(2)),
            estado: 'pendente'
          };
        });

        console.log(`📦 Itens a criar: ${itensData.length}`);

        if (itensData.length > 0) {
          await tx.itens_encomenda_peca.createMany({ data: itensData });
          console.log(`✅ ${itensData.length} itens criados`);
        }

        return encomenda;
      });

      console.log(`🎉 Transação concluída com sucesso. ID: ${created?.id}`);

      if (!created || !created.id) {
        console.error('❌ Erro: Encomenda criada mas sem ID');
        return NextResponse.json({ error: 'Erro: Encomenda criada mas sem ID' }, { status: 500 });
      }

      const response = {
        id: String(created.id),
        numero_encomenda: created.numero_encomenda
      };
      
      console.log('📤 Resposta enviada:', response);
      return NextResponse.json(response, { status: 201 });
    } catch (txError) {
      console.error('❌ Erro na transação:', txError);
      throw txError;
    }
  } catch (error) {
    console.error('🚨 Erro ao criar encomenda:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create encomenda';
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}
