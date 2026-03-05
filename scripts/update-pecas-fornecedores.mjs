import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 A atualizar peças com fornecedores...\n');

  // Mapeamento de categorias para fornecedores
  const fornecedorMappings = {
    'Fluidos': 6,                           // Filtros e Fluidos Industriais
    'Filtros': 6,                           // Filtros e Fluidos Industriais
    'Pneus': 7,                             // Pneus Auto Express
    'Bateria': 4,                           // Elétrica Auto Lisboa
    'Motor': 3,                             // Componentes Automóveis Lusitanos
    'Correias': 3,                          // Componentes Automóveis Lusitanos
    'Limpadores': 1,                        // Auto Parts Lisboa
    'Travões': 5,                           // Travões e Suspensões PT
    'Arrefecimento': 3,                     // Componentes Automóveis Lusitanos
    'Elétrica': 4,                          // Elétrica Auto Lisboa
  };

  try {
    // Atualizar peças com fornecedores baseado na categoria
    for (const [categoria, fornecedor_id] of Object.entries(fornecedorMappings)) {
      const pecasAtualizadas = await prisma.pecas.updateMany({
        where: { categoria },
        data: { fornecedor_id }
      });
      console.log(`✅ ${pecasAtualizadas.count} peça(s) de ${categoria} atribuídas ao fornecedor ID: ${fornecedor_id}`);
    }

    // Mostrar todos os fornecedores atribuídos
    console.log('\n📋 Resumo de peças por fornecedor:\n');
    const fornecedores = await prisma.fornecedores.findMany({
      select: { id: true, nome: true }
    });

    for (const fornecedor of fornecedores) {
      const contagem = await prisma.pecas.count({
        where: { fornecedor_id: fornecedor.id }
      });
      if (contagem > 0) {
        console.log(`   ${fornecedor.nome}: ${contagem} peça(s)`);
      }
    }

    // Verificar peças sem fornecedor
    const semFornecedor = await prisma.pecas.count({
      where: { fornecedor_id: null }
    });

    if (semFornecedor > 0) {
      console.log(`\n⚠️  ${semFornecedor} peça(s) sem fornecedor atribuído\n`);
    } else {
      console.log(`\n✨ Todas as peças têm fornecedor atribuído!\n`);
    }

    const totalPecas = await prisma.pecas.count();
    const comFornecedor = await prisma.pecas.count({
      where: { fornecedor_id: { not: null } }
    });

    console.log('📊 Estatísticas:');
    console.log(`   Total de peças: ${totalPecas}`);
    console.log(`   Com fornecedor: ${comFornecedor}`);
    console.log(`   Sem fornecedor: ${semFornecedor}`);

  } catch (error) {
    console.error('❌ Erro ao atualizar peças:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e);
    process.exit(1);
  });
