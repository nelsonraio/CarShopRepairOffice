import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Criando dados de teste para ordens de trabalho...\n');

  try {
    // Primeiro, obter um cliente e um veículo
    const clientes = await prisma.clientes.findMany({ take: 1 });
    const veiculos = await prisma.veiculos.findMany({ take: 1 });

    if (!clientes.length) {
      console.log('❌ Nenhum cliente encontrado na base de dados');
      return;
    }

    if (!veiculos.length) {
      console.log('❌ Nenhum veículo encontrado na base de dados');
      return;
    }

    const cliente = clientes[0];
    const veiculo = veiculos[0];

    // Criar algumas ordens de trabalho concluídas
    const ordensTrabalho = [
      {
        ref_ordem_trabalho: 'OT-2026-001',
        cliente_id: cliente.id,
        veiculo_id: veiculo.id,
        mecanico_id: null,
        data_inicio: new Date('2026-02-10'),
        data_conclusao: new Date('2026-02-15'),
        estado: 'concluido',
        quilometragem_servico: 45000,
        descricao_problema: 'Manutenção e reparação geral',
        trabalho_realizado: 'Troca de óleo, filtros e pastilhas de travão',
        total_pecas: 250.00,
        total_mao_obra: 400.00,
        total_desconto: 0,
        total_imposto: 130.00,
        total_geral: 780.00 // 250 + 400 + 130 - 0
      },
      {
        ref_ordem_trabalho: 'OT-2026-002',
        cliente_id: cliente.id,
        veiculo_id: veiculo.id,
        mecanico_id: null,
        data_inicio: new Date('2026-02-12'),
        data_conclusao: new Date('2026-02-16'),
        estado: 'concluido',
        quilometragem_servico: 45100,
        descricao_problema: 'Reparação de transmissão',
        trabalho_realizado: 'Revisão e aperto de componentes de transmissão',
        total_pecas: 150.00,
        total_mao_obra: 300.00,
        total_desconto: 0,
        total_imposto: 90.00,
        total_geral: 540.00 // 150 + 300 + 90 - 0
      },
      {
        ref_ordem_trabalho: 'OT-2026-003',
        cliente_id: cliente.id,
        veiculo_id: veiculo.id,
        mecanico_id: null,
        data_inicio: new Date('2026-02-14'),
        data_conclusao: new Date('2026-02-17'),
        estado: 'concluido',
        quilometragem_servico: 45200,
        descricao_problema: 'Problemas no sistema de ar condicionado',
        trabalho_realizado: 'Recarga de refrigerante e limpeza do sistema',
        total_pecas: 100.00,
        total_mao_obra: 200.00,
        total_desconto: 0,
        total_imposto: 60.00,
        total_geral: 360.00 // 100 + 200 + 60 - 0
      }
    ];

    for (const ordem of ordensTrabalho) {
      const created = await prisma.ordens_trabalho.create({
        data: ordem
      });
      console.log(`✅ Ordem ${created.ref_ordem_trabalho} criada - ID: ${created.id}`);
    }

    console.log(`\n🎉 Total de ${ordensTrabalho.length} ordens de trabalho criadas com sucesso!`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
