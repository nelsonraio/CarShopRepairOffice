import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const servicos = [
  {
    nome: 'Revisão Geral',
    descricao: 'Revisão completa do veículo incluindo verificação de fluidos, filtros, freios e sistema elétrico',
    preco_base: 150.00,
    requer_pecas: true
  },
  {
    nome: 'Mudança de Óleo',
    descricao: 'Substituição do óleo do motor e filtros de óleo',
    preco_base: 45.00,
    requer_pecas: true
  },
  {
    nome: 'Substituição de Travões',
    descricao: 'Substituição de pastilhas, discos ou tambores de travão',
    preco_base: 120.00,
    requer_pecas: true
  },
  {
    nome: 'Diagnóstico Eletrónico',
    descricao: 'Diagnóstico completo do sistema elétrico e computador de bordo',
    preco_base: 85.00,
    requer_pecas: false
  },
  {
    nome: 'Substituição de Bateria',
    descricao: 'Substituição da bateria do veículo',
    preco_base: 65.00,
    requer_pecas: true
  },
  {
    nome: 'Alinhamento e Balanceamento',
    descricao: 'Alinhamento das rodas e balanceamento de pneus',
    preco_base: 55.00,
    requer_pecas: false
  },
  {
    nome: 'Substituição de Filtros',
    descricao: 'Substituição de filtros de ar, combustível e habitáculo',
    preco_base: 35.00,
    requer_pecas: true
  },
  {
    nome: 'Reparação de Motor',
    descricao: 'Diagnóstico e reparação de problemas no motor',
    preco_base: 0.00, // Preço a definir
    requer_pecas: true
  },
  {
    nome: 'Inspeção Pré-Compra',
    descricao: 'Inspeção completa para compra de veículo usado',
    preco_base: 85.00,
    requer_pecas: false
  },
  {
    nome: 'Substituição de Amortecedores',
    descricao: 'Substituição dos amortecedores dianteiros e traseiros',
    preco_base: 180.00,
    requer_pecas: true
  }
];

async function main() {
  console.log('🌱 Inserindo serviços na base de dados...');

  for (const servico of servicos) {
    try {
      const created = await prisma.servicos.create({
        data: {
          nome: servico.nome,
          descricao: servico.descricao,
          preco_base: servico.preco_base,
          duracao_estimada: servico.duracao_estimada,
          requer_pecas: servico.requer_pecas,
          ativo: true
        }
      });
      console.log(`✅ Inserido: ${created.nome}`);
    } catch (error) {
      console.log(`❌ Erro ao inserir ${servico.nome}:`, error.message);
    }
  }

  console.log('🎉 Seed de serviços concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
