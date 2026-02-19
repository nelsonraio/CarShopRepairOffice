import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();
const cutoff = new Date(now);
cutoff.setDate(cutoff.getDate() - 7);

const uniqueNumbers = (values) => Array.from(new Set(values.map((v) => Number(v))));

async function main() {
  const orcamentos = await prisma.orcamentos.findMany({
    where: { notas: 'Fluxo geral teste' },
    include: { itens_orcamento: true }
  });

  const orcamentoIds = orcamentos.map((o) => o.id);
  const veiculoIdsFromOrc = orcamentos.map((o) => o.veiculo_id);
  const clienteIdsFromOrc = orcamentos.map((o) => o.cliente_id);
  const partIdsFromOrc = uniqueNumbers(
    orcamentos
      .flatMap((o) => o.itens_orcamento)
      .filter((item) => item.tipo_item === 'peca' && item.peca_id != null)
      .map((item) => item.peca_id)
  );

  const ordens = orcamentoIds.length
    ? await prisma.ordens_trabalho.findMany({
        where: { orcamento_id: { in: orcamentoIds } },
        select: { id: true }
      })
    : [];

  const ordemIds = ordens.map((o) => o.id);

  const faturas = await prisma.faturas.findMany({
    where: { notas: 'Fatura teste fluxo geral' },
    select: { id: true }
  });
  const faturaIds = faturas.map((f) => f.id);

  const agendamentos = await prisma.agendamentos.findMany({
    where: { descricao: 'Teste fluxo geral' },
    select: { id: true }
  });
  const agendamentoIds = agendamentos.map((a) => a.id);

  const veiculos = await prisma.veiculos.findMany({
    where: { marca: 'MarcaTest' },
    select: { id: true, cliente_id: true }
  });
  const veiculoIds = veiculos.map((v) => v.id);
  const clienteIdsFromVeiculos = veiculos
    .map((v) => v.cliente_id)
    .filter((id) => id != null);

  const clientes = await prisma.clientes.findMany({
    where: {
      OR: [
        { nome: { startsWith: 'Cliente Teste' } },
        { email: { contains: 'cliente.teste.' } },
        { email: { endsWith: '@example.com' } }
      ]
    },
    select: { id: true }
  });
  const clienteIdsFromClientes = clientes.map((c) => c.id);

  const clienteIds = Array.from(
    new Set([...clienteIdsFromOrc, ...clienteIdsFromVeiculos, ...clienteIdsFromClientes])
  );

  // Reverter stock das pecas usadas (subtrair 2 unidades)
  if (partIdsFromOrc.length > 0) {
    const pecas = await prisma.pecas.findMany({
      where: { id: { in: partIdsFromOrc } },
      select: { id: true, quantidade_stock: true }
    });

    for (const peca of pecas) {
      const atual = peca.quantidade_stock ?? 0;
      const novo = Math.max(atual - 2, 0);
      await prisma.pecas.update({
        where: { id: peca.id },
        data: { quantidade_stock: novo }
      });
    }
  }

  // Encomendas criadas pelo fluxo (baseadas nas pecas dos orcamentos)
  let encomendaIds = [];
  if (partIdsFromOrc.length > 0) {
    const encomendas = await prisma.encomendas_pecas.findMany({
      where: {
        data_encomenda: { gte: cutoff },
        estado: 'pendente'
      },
      include: { itens: true }
    });

    encomendaIds = encomendas
      .filter((enc) =>
        enc.itens.length > 0 &&
        enc.itens.every((item) => partIdsFromOrc.includes(Number(item.peca_id)))
      )
      .map((enc) => enc.id);
  }

  if (encomendaIds.length > 0) {
    await prisma.itens_encomenda_peca.deleteMany({
      where: { encomenda_id: { in: encomendaIds } }
    });
    await prisma.encomendas_pecas.deleteMany({
      where: { id: { in: encomendaIds } }
    });
  }

  if (faturaIds.length > 0) {
    await prisma.faturas.deleteMany({ where: { id: { in: faturaIds } } });
  }

  if (ordemIds.length > 0) {
    await prisma.itens_ordem_trabalho.deleteMany({
      where: { ordem_trabalho_id: { in: ordemIds.map((id) => Number(id)) } }
    });
    await prisma.ordens_trabalho.deleteMany({ where: { id: { in: ordemIds } } });
  }

  if (orcamentoIds.length > 0) {
    await prisma.itens_orcamento.deleteMany({
      where: { orcamento_id: { in: orcamentoIds } }
    });
    await prisma.orcamentos.deleteMany({ where: { id: { in: orcamentoIds } } });
  }

  if (agendamentoIds.length > 0) {
    await prisma.agendamentos.deleteMany({ where: { id: { in: agendamentoIds } } });
  }

  if (veiculoIds.length > 0) {
    await prisma.veiculos.deleteMany({ where: { id: { in: veiculoIds } } });
  }

  if (clienteIds.length > 0) {
    await prisma.clientes.deleteMany({ where: { id: { in: clienteIds } } });
  }

  console.log('Limpeza concluida.');
  console.log(
    [
      `Orcamentos: ${orcamentoIds.length}`,
      `Ordens: ${ordemIds.length}`,
      `Faturas: ${faturaIds.length}`,
      `Agendamentos: ${agendamentoIds.length}`,
      `Veiculos: ${veiculoIds.length}`,
      `Clientes: ${clienteIds.length}`,
      `Encomendas: ${encomendaIds.length}`,
      `Pecas atualizadas: ${partIdsFromOrc.length}`
    ].join(' | ')
  );
}

main()
  .catch((err) => {
    console.error('Erro na limpeza:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
