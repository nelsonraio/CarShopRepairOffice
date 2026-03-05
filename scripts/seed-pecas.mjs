import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 A iniciar seed de peças...');

  const pecas = [
    // Fluidos e Filtros
    {
      referencia: 'OLE-001',
      nome: 'Óleo Motor 5W-30 (5L)',
      descricao: 'Óleo de motor sintético 5W-30, 5 litros',
      categoria: 'Fluidos',
      custo_unitario: 12.50,
      preco_venda: 19.99,
      quantidade_stock: 15,
      nivel_stock_minimo: 5,
      nivel_stock_maximo: 30,
      localizacao: 'Prateleira A1',
      veiculos_compativeis: 'Todos',
      margem_lucro: 60.00,
      notas: 'Stock regular'
    },
    {
      referencia: 'FLT-OLE-001',
      nome: 'Filtro de Óleo',
      descricao: 'Filtro de óleo universal',
      categoria: 'Filtros',
      custo_unitario: 5.50,
      preco_venda: 12.99,
      quantidade_stock: 25,
      nivel_stock_minimo: 10,
      nivel_stock_maximo: 50,
      localizacao: 'Prateleira B2',
      veiculos_compativeis: 'Todos',
      margem_lucro: 136.00,
      notas: 'Compatível com maioria de modelos'
    },
    {
      referencia: 'FLT-AR-001',
      nome: 'Filtro de Ar',
      descricao: 'Filtro de ar para caixa',
      categoria: 'Filtros',
      custo_unitario: 8.00,
      preco_venda: 15.50,
      quantidade_stock: 20,
      nivel_stock_minimo: 8,
      nivel_stock_maximo: 40,
      localizacao: 'Prateleira C1',
      veiculos_compativeis: 'Todos',
      margem_lucro: 93.75,
      notas: 'Filtro padrão'
    },
    {
      referencia: 'FLT-CABIN-001',
      nome: 'Filtro de Cabina',
      descricao: 'Filtro de ar da cabina',
      categoria: 'Filtros',
      custo_unitario: 12.00,
      preco_venda: 24.99,
      quantidade_stock: 18,
      nivel_stock_minimo: 5,
      nivel_stock_maximo: 30,
      localizacao: 'Prateleira C2',
      veiculos_compativeis: 'Todos',
      margem_lucro: 108.25,
      notas: 'Com carvão ativado'
    },

    // Pneus e Rodas
    {
      referencia: 'PNEU-185-65-15',
      nome: 'Pneu 185/65R15',
      descricao: 'Pneu de passeio 185/65R15',
      categoria: 'Pneus',
      custo_unitario: 45.00,
      preco_venda: 89.99,
      quantidade_stock: 10,
      nivel_stock_minimo: 4,
      nivel_stock_maximo: 20,
      localizacao: 'Armazém',
      veiculos_compativeis: 'Compactos, Sedans',
      margem_lucro: 100.00,
      notas: 'Aderência seco/molhado'
    },
    {
      referencia: 'PNEU-195-65-15',
      nome: 'Pneu 195/65R15',
      descricao: 'Pneu de passeio 195/65R15',
      categoria: 'Pneus',
      custo_unitario: 52.00,
      preco_venda: 99.99,
      quantidade_stock: 12,
      nivel_stock_minimo: 4,
      nivel_stock_maximo: 20,
      localizacao: 'Armazém',
      veiculos_compativeis: 'Sedans, SUV',
      margem_lucro: 92.30,
      notas: 'Longa durabilidade'
    },

    // Bateria
    {
      referencia: 'BAT-60AH',
      nome: 'Bateria 60Ah 12V',
      descricao: 'Bateria de carro 60Ah 12V com terminal positivo à direita',
      categoria: 'Bateria',
      custo_unitario: 60.00,
      preco_venda: 119.99,
      quantidade_stock: 8,
      nivel_stock_minimo: 2,
      nivel_stock_maximo: 15,
      localizacao: 'Armazém',
      veiculos_compativeis: 'Maioria sedans',
      margem_lucro: 100.00,
      notas: '3 anos de garantia'
    },
    {
      referencia: 'BAT-80AH',
      nome: 'Bateria 80Ah 12V',
      descricao: 'Bateria de carro 80Ah 12V',
      categoria: 'Bateria',
      custo_unitario: 85.00,
      preco_venda: 159.99,
      quantidade_stock: 5,
      nivel_stock_minimo: 2,
      nivel_stock_maximo: 12,
      localizacao: 'Armazém',
      veiculos_compativeis: 'SUV, Vans',
      margem_lucro: 88.23,
      notas: '3 anos de garantia'
    },

    // Peças de Motor
    {
      referencia: 'VEL-MOTOR',
      nome: 'Velocímetro',
      descricao: 'Sensor de velocidade para motor',
      categoria: 'Motor',
      custo_unitario: 25.00,
      preco_venda: 59.99,
      quantidade_stock: 6,
      nivel_stock_minimo: 2,
      nivel_stock_maximo: 10,
      localizacao: 'Prateleira D1',
      veiculos_compativeis: 'Vários',
      margem_lucro: 140.00,
      notas: 'Sensor OEM quality'
    },
    {
      referencia: 'VELA-IGN-001',
      nome: 'Velas de Ignição (Set 4)',
      descricao: 'Conjunto de 4 velas de ignição',
      categoria: 'Motor',
      custo_unitario: 15.00,
      preco_venda: 34.99,
      quantidade_stock: 12,
      nivel_stock_minimo: 5,
      nivel_stock_maximo: 25,
      localizacao: 'Prateleira D2',
      veiculos_compativeis: 'Maioria veículos',
      margem_lucro: 133.27,
      notas: 'Compatível com ignição normal'
    },

    // Correias e Correntes
    {
      referencia: 'COR-DIST-001',
      nome: 'Correia de Distribuição',
      descricao: 'Correia de distribuição universal',
      categoria: 'Correias',
      custo_unitario: 35.00,
      preco_venda: 89.99,
      quantidade_stock: 4,
      nivel_stock_minimo: 1,
      nivel_stock_maximo: 8,
      localizacao: 'Prateleira E1',
      veiculos_compativeis: 'Vários',
      margem_lucro: 157.14,
      notas: 'Substituição recomendada'
    },
    {
      referencia: 'COR-SERPENT-001',
      nome: 'Correia Serpentina',
      descricao: 'Correia serpentina para acessórios',
      categoria: 'Correias',
      custo_unitario: 12.00,
      preco_venda: 29.99,
      quantidade_stock: 8,
      nivel_stock_minimo: 3,
      nivel_stock_maximo: 15,
      localizacao: 'Prateleira E2',
      veiculos_compativeis: 'Todos',
      margem_lucro: 149.92,
      notas: 'Fácil instalação'
    },

    // Palhetas de Limpador
    {
      referencia: 'PALH-430',
      nome: 'Palheta 430mm',
      descricao: 'Palheta de limpador 430mm',
      categoria: 'Limpadores',
      custo_unitario: 6.00,
      preco_venda: 14.99,
      quantidade_stock: 25,
      nivel_stock_minimo: 10,
      nivel_stock_maximo: 40,
      localizacao: 'Prateleira F1',
      veiculos_compativeis: 'Maioria',
      margem_lucro: 149.83,
      notas: 'Visibilidade em qualquer clima'
    },
    {
      referencia: 'PALH-500',
      nome: 'Palheta 500mm',
      descricao: 'Palheta de limpador 500mm',
      categoria: 'Limpadores',
      custo_unitario: 7.00,
      preco_venda: 16.99,
      quantidade_stock: 20,
      nivel_stock_minimo: 8,
      nivel_stock_maximo: 35,
      localizacao: 'Prateleira F1',
      veiculos_compativeis: 'SUV, Vans',
      margem_lucro: 142.71,
      notas: 'Tecnologia sem ruído'
    },

    // Pastilhas de Travão
    {
      referencia: 'TRAVA-DIANT-001',
      nome: 'Pastilhas Travão Dianteiras',
      descricao: 'Conjunto de pastilhas de travão dianteiras',
      categoria: 'Travões',
      custo_unitario: 25.00,
      preco_venda: 64.99,
      quantidade_stock: 10,
      nivel_stock_minimo: 3,
      nivel_stock_maximo: 20,
      localizacao: 'Prateleira G1',
      veiculos_compativeis: 'Maioria veículos',
      margem_lucro: 159.96,
      notas: 'Travagem suave e silenciosa'
    },
    {
      referencia: 'TRAVA-TRAS-001',
      nome: 'Pastilhas Travão Traseiras',
      descricao: 'Conjunto de pastilhas de travão traseiras',
      categoria: 'Travões',
      custo_unitario: 20.00,
      preco_venda: 49.99,
      quantidade_stock: 8,
      nivel_stock_minimo: 3,
      nivel_stock_maximo: 15,
      localizacao: 'Prateleira G2',
      veiculos_compativeis: 'Maioria veículos',
      margem_lucro: 149.95,
      notas: 'Fácil instalação'
    },

    // Óleo de Travões
    {
      referencia: 'OLHID-DOT4',
      nome: 'Óleo de Travões DOT 4',
      descricao: 'Óleo de travões DOT 4, 500ml',
      categoria: 'Fluidos',
      custo_unitario: 8.50,
      preco_venda: 18.99,
      quantidade_stock: 12,
      nivel_stock_minimo: 5,
      nivel_stock_maximo: 20,
      localizacao: 'Prateleira A2',
      veiculos_compativeis: 'Todos',
      margem_lucro: 123.41,
      notas: 'Ponto de ebulição elevado'
    },

    // Termóstato
    {
      referencia: 'TERMOST-001',
      nome: 'Termóstato',
      descricao: 'Termóstato do sistema de arrefecimento',
      categoria: 'Arrefecimento',
      custo_unitario: 15.00,
      preco_venda: 39.99,
      quantidade_stock: 7,
      nivel_stock_minimo: 2,
      nivel_stock_maximo: 12,
      localizacao: 'Prateleira H1',
      veiculos_compativeis: 'Vários',
      margem_lucro: 166.60,
      notas: 'Substituição fácil'
    },

    // Alternador
    {
      referencia: 'ALTERN-001',
      nome: 'Alternador 80A',
      descricao: 'Alternador 80A para carros',
      categoria: 'Elétrica',
      custo_unitario: 120.00,
      preco_venda: 249.99,
      quantidade_stock: 4,
      nivel_stock_minimo: 1,
      nivel_stock_maximo: 8,
      localizacao: 'Armazém',
      veiculos_compativeis: 'Maioria sedans',
      margem_lucro: 108.33,
      notas: 'Garantia 2 anos'
    },

    // Cilindro Mestre Travões
    {
      referencia: 'CILIND-TRAV-001',
      nome: 'Cilindro Mestre Travões',
      descricao: 'Cilindro mestre do sistema de travões',
      categoria: 'Travões',
      custo_unitario: 45.00,
      preco_venda: 109.99,
      quantidade_stock: 3,
      nivel_stock_minimo: 1,
      nivel_stock_maximo: 6,
      localizacao: 'Armazém',
      veiculos_compativeis: 'Vários',
      margem_lucro: 144.42,
      notas: 'Componente crítico'
    },

    // Cabeça de Cilindros (Genérica)
    {
      referencia: 'CAB-CILIND-001',
      nome: 'Jogo de Vedantes de Cabeça',
      descricao: 'Jogo de vedantes de cabeça de cilindro',
      categoria: 'Motor',
      custo_unitario: 35.00,
      preco_venda: 89.99,
      quantidade_stock: 5,
      nivel_stock_minimo: 2,
      nivel_stock_maximo: 10,
      localizacao: 'Prateleira H2',
      veiculos_compativeis: 'Vários',
      margem_lucro: 157.14,
      notas: 'Vedação confiável'
    }
  ];

  try {
    console.log(`📦 A inserir ${pecas.length} peças...`);

    for (const peca of pecas) {
      const existing = await prisma.pecas.findUnique({
        where: { referencia: peca.referencia }
      });

      if (existing) {
        console.log(`⏭️  Peça ${peca.referencia} já existe, a atualizar...`);
        await prisma.pecas.update({
          where: { referencia: peca.referencia },
          data: peca
        });
      } else {
        console.log(`✅ A criar peça: ${peca.nome}`);
        await prisma.pecas.create({
          data: peca
        });
      }
    }

    const totalPecas = await prisma.pecas.count();
    console.log(`\n✨ Seed completado! Total de peças na BD: ${totalPecas}`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed de peças:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
