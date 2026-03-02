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
        itens: {
          include: {
            peca: true
          }
        }
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
        peca_id: item.peca_id !== null ? String(item.peca_id) : null,
        quantidade_encomendada: item.quantidade_encomendada,
        quantidade_recebida: item.quantidade_recebida,
        preco_unitario: Number(item.preco_unitario),
        estado: item.estado,
        nome: item.peca?.nome || item.peca_descricao || '',
        referencia: item.peca?.referencia || item.referencia || ''
      }))
    }));

    return NextResponse.json(serialized);
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
    console.error('Error fetching encomendas:', error);
    return NextResponse.json({ error: 'Failed to fetch encomendas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📨 Pedido POST encomendas:', body);
    
    let { fornecedor_id, data_entrega_estimada, itens } = body;

    // if no supplier provided, try to infer from first real part
    if (!fornecedor_id && Array.isArray(itens) && itens.length > 0) {
      const firstPecaId = itens[0].peca_id;
      if (firstPecaId && !String(firstPecaId).startsWith('custom')) {
        const p = await prisma.pecas.findUnique({
          where: { id: BigInt(firstPecaId) },
          select: { fornecedor_id: true }
        });
        if (p && p.fornecedor_id) {
          fornecedor_id = String(p.fornecedor_id);
        }
      }
    }

    // fornecedor_id may still be undefined; that's acceptable now

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
            fornecedor_id: fornecedor_id ? parseInt(fornecedor_id) : null,
            data_encomenda: new Date(),
            data_entrega_estimada: data_entrega_estimada ? new Date(data_entrega_estimada) : null,
            estado: 'pendente',
            custo_total: parseFloat(custo_total.toFixed(2))
          }
        });
        
        console.log(`✅ Encomenda criada com ID: ${encomenda.id}`);

        // build itensData, creating placeholder parts for any custom entries
        const itensData: any[] = [];
        for (const item of itens) {
          const qtd = Number(item.quantidade_encomendada) || 1;
          const preco = Number(item.preco_unitario) || 0;
          const total = qtd * preco;

          let pecaId: bigint | null = null;
          if (item.peca_id && !String(item.peca_id).startsWith('custom')) {
            pecaId = BigInt(item.peca_id);
            itensData.push({
              encomenda_id: encomenda.id,
              peca_id: pecaId,
              quantidade_encomendada: qtd,
              quantidade_recebida: 0,
              preco_unitario: parseFloat(preco.toFixed(2)),
              preco_total: parseFloat(total.toFixed(2)),
              estado: 'pendente'
            });
          } else {
            // custom part: require name and reference from payload
            if (!item.part || !item.part.name || !item.part.reference) {
              throw new Error('Custom part must include name and reference');
            }
            const ref = item.part.reference.trim();
            const nome = item.part.name.trim();
            const categoria = item.part.category || 'custom';
            let fornecedorId: number | null = null;
            if (item.part.supplier) {
              const fornecedor = await tx.fornecedores.findFirst({ where: { nome: item.part.supplier } });
              if (fornecedor) fornecedorId = fornecedor.id;
            }
            console.log(`🆕 Creating custom part: nome=${nome}, referencia=${ref}, categoria=${categoria}, fornecedor_id=${fornecedorId}`);
            const createdPart = await tx.pecas.create({
              data: {
                nome,
                referencia: ref,
                categoria,
                quantidade_stock: 0,
                nivel_stock_minimo: 0,
                preco_venda: 0,
                custo_unitario: 0,
                ativo: true,
                fornecedor_id: fornecedorId
              }
            });
            console.log(`🆕 Custom part created: id=${createdPart.id}, nome=${createdPart.nome}, referencia=${createdPart.referencia}`);
            pecaId = BigInt(createdPart.id);
            console.log(`🔗 Linking item to custom part: encomenda_id=${encomenda.id}, peca_id=${pecaId}`);
            itensData.push({
              encomenda_id: encomenda.id,
              peca_id: pecaId,
              quantidade_encomendada: qtd,
              quantidade_recebida: 0,
              preco_unitario: parseFloat(preco.toFixed(2)),
              preco_total: parseFloat(total.toFixed(2)),
              estado: 'pendente'
            });
          }
        }

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
    const errorMessage = txError instanceof Error ? txError.message : String(txError);
    const isDbOffline =
      errorMessage.includes("reach database server") ||
      errorMessage.includes("ECONNREFUSED");

    if (isDbOffline) {
      return NextResponse.json(
        { error: "Database unavailable. Please start the database server and try again." },
        { status: 503 }
      );
    }
      console.error('❌ Erro na transação:', txError);
      throw txError;
    }
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
    console.error('🚨 Erro ao criar encomenda:', error);
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}


