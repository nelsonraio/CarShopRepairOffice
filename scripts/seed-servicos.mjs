import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 A iniciar seed de serviços...');

  const servicos = [
    // Manutenção Básica
    {
      nome: 'Mudança de Óleo e Filtro',
      descricao: 'Troca de óleo do motor e filtro de óleo. Inclui verificação de fluidos.',
      preco_base: 45.00,
      duracao_estimada: '00:45',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Palhetas de Limpador',
      descricao: 'Troca das palhetas de limpador do para-brisas e vidro traseiro.',
      preco_base: 25.00,
      duracao_estimada: '00:20',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Verificação de Bateria',
      descricao: 'Teste de carga e condição geral da bateria. Limpeza dos terminais.',
      preco_base: 15.00,
      duracao_estimada: '00:15',
      requer_pecas: false,
      ativo: true
    },
    {
      nome: 'Rotação de Pneus',
      descricao: 'Rotação e balanceamento dos pneus. Verificação de desgaste.',
      preco_base: 40.00,
      duracao_estimada: '01:00',
      requer_pecas: false,
      ativo: true
    },

    // Filtros
    {
      nome: 'Substituição de Filtro de Ar',
      descricao: 'Troca do filtro de ar do motor por um novo.',
      preco_base: 30.00,
      duracao_estimada: '00:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Filtro de Cabina',
      descricao: 'Troca do filtro do ar condicionado/cabina.',
      preco_base: 35.00,
      duracao_estimada: '00:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Filtro de Combustível',
      descricao: 'Troca do filtro de combustível. Limpeza do sistema de combustível.',
      preco_base: 50.00,
      duracao_estimada: '01:00',
      requer_pecas: true,
      ativo: true
    },

    // Travões
    {
      nome: 'Substituição de Pastilhas de Travão',
      descricao: 'Troca das pastilhas de travão dianteiras ou traseiras. Verificação de discos.',
      preco_base: 80.00,
      duracao_estimada: '02:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Purga do Sistema de Travões',
      descricao: 'Remoção de ar e substituição do óleo de travões do sistema completo.',
      preco_base: 60.00,
      duracao_estimada: '01:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Cilindro Mestre Travões',
      descricao: 'Troca do cilindro mestre do sistema de travões.',
      preco_base: 150.00,
      duracao_estimada: '03:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Verificação de Travões',
      descricao: 'Inspeção completa do sistema de travões. Medição de desgaste de pastilhas.',
      preco_base: 25.00,
      duracao_estimada: '00:45',
      requer_pecas: false,
      ativo: true
    },

    // Pneus
    {
      nome: 'Substituição de Pneu',
      descricao: 'Troca de um ou mais pneus. Balanceamento incluído.',
      preco_base: 35.00,
      duracao_estimada: '01:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Reparação de Furo em Pneu',
      descricao: 'Reparação de furo em pneu com aplicação de remendo vulcanizado.',
      preco_base: 15.00,
      duracao_estimada: '00:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Balanceamento e Alinhamento de Pneus',
      descricao: 'Balanceamento dinâmico e alinhamento da geometria do eixo.',
      preco_base: 65.00,
      duracao_estimada: '01:30',
      requer_pecas: false,
      ativo: true
    },

    // Sistema Elétrico
    {
      nome: 'Substituição de Velas de Ignição',
      descricao: 'Troca das velas de ignição do motor.',
      preco_base: 40.00,
      duracao_estimada: '01:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Alternador',
      descricao: 'Troca do alternador. Verificação do sistema de carregamento.',
      preco_base: 180.00,
      duracao_estimada: '02:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Motor de Arranque',
      descricao: 'Troca do motor de arranque do veículo.',
      preco_base: 160.00,
      duracao_estimada: '02:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Bateria',
      descricao: 'Troca da bateria do veículo por uma nova.',
      preco_base: 50.00,
      duracao_estimada: '00:45',
      requer_pecas: true,
      ativo: true
    },

    // Sistema de Arrefecimento
    {
      nome: 'Limpeza de Radiador',
      descricao: 'Limpeza e desobstrução do radiador. Verificação de fugas.',
      preco_base: 55.00,
      duracao_estimada: '02:00',
      requer_pecas: false,
      ativo: true
    },
    {
      nome: 'Substituição de Termóstato',
      descricao: 'Troca do termóstato do sistema de arrefecimento.',
      preco_base: 70.00,
      duracao_estimada: '01:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Troca de Líquido de Arrefecimento',
      descricao: 'Drenagem e substituição do líquido de arrefecimento.',
      preco_base: 45.00,
      duracao_estimada: '01:00',
      requer_pecas: true,
      ativo: true
    },

    // Correias e Correntes
    {
      nome: 'Substituição de Correia de Distribuição',
      descricao: 'Troca da correia de distribuição do motor.',
      preco_base: 220.00,
      duracao_estimada: '04:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Substituição de Correia Serpentina',
      descricao: 'Troca da correia serpentina dos acessórios do motor.',
      preco_base: 60.00,
      duracao_estimada: '01:30',
      requer_pecas: true,
      ativo: true
    },

    // Transmissão
    {
      nome: 'Troca de Óleo da Caixa de Velocidades',
      descricao: 'Drenagem e substituição do óleo da caixa de velocidades.',
      preco_base: 75.00,
      duracao_estimada: '01:30',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Reparação de Embraiagem',
      descricao: 'Reparação ou substituição do sistema de embraiagem.',
      preco_base: 300.00,
      duracao_estimada: '05:00',
      requer_pecas: true,
      ativo: true
    },

    // Sistema de Suspensão
    {
      nome: 'Substituição de Amortecedores',
      descricao: 'Troca dos amortecedores dianteiros ou traseiros.',
      preco_base: 200.00,
      duracao_estimada: '03:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Verificação de Suspensão',
      descricao: 'Inspeção completa da suspensão, molas e amortecedores.',
      preco_base: 40.00,
      duracao_estimada: '01:00',
      requer_pecas: false,
      ativo: true
    },

    // Ar Condicionado
    {
      nome: 'Limpeza e Desinfecção de Ar Condicionado',
      descricao: 'Limpeza do sistema de ar condicionado e eliminação de bactérias.',
      preco_base: 85.00,
      duracao_estimada: '02:00',
      requer_pecas: false,
      ativo: true
    },
    {
      nome: 'Recarga de Ar Condicionado',
      descricao: 'Recarga do gás refrigerante do ar condicionado.',
      preco_base: 95.00,
      duracao_estimada: '01:30',
      requer_pecas: true,
      ativo: true
    },

    // Sistema de Escape
    {
      nome: 'Substituição de Silenciador',
      descricao: 'Troca do silenciador/escapamento.',
      preco_base: 120.00,
      duracao_estimada: '02:00',
      requer_pecas: true,
      ativo: true
    },
    {
      nome: 'Limpeza de Catalisador',
      descricao: 'Limpeza ou substituição do catalisador.',
      preco_base: 150.00,
      duracao_estimada: '02:30',
      requer_pecas: true,
      ativo: true
    },

    // Inspeção e Manutenção
    {
      nome: 'Inspeção Técnica Completa',
      descricao: 'Revisão geral do veículo com verificação de todos os sistemas.',
      preco_base: 120.00,
      duracao_estimada: '02:00',
      requer_pecas: false,
      ativo: true
    },
    {
      nome: 'Diagnóstico Informático',
      descricao: 'Leitura e diagnóstico de códigos de erro do computador.',
      preco_base: 50.00,
      duracao_estimada: '01:00',
      requer_pecas: false,
      ativo: true
    },
  ];

  try {
    console.log(`📦 A inserir ${servicos.length} serviços...`);

    for (const servico of servicos) {
      const existing = await prisma.servicos.findFirst({
        where: { nome: servico.nome }
      });

      if (existing) {
        console.log(`⏭️  Serviço "${servico.nome}" já existe, a atualizar...`);
        await prisma.servicos.update({
          where: { id: existing.id },
          data: servico
        });
      } else {
        console.log(`✅ A criar serviço: ${servico.nome}`);
        await prisma.servicos.create({
          data: servico
        });
      }
    }

    const totalServicos = await prisma.servicos.count();
    console.log(`\n✨ Seed completado! Total de serviços na BD: ${totalServicos}`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed de serviços:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
