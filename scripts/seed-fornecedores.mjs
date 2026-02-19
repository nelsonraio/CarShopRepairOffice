import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Iniciando inserção de fornecedores de peças...\n');

  const fornecedores = [
    {
      nome: 'Auto Parts Lisboa',
      pessoa_contato: 'João Santos',
      email: 'joao@autopartslisboa.pt',
      telefone: '213 456 789',
      endereco: 'Av. da República, 150, 1050-191 Lisboa',
      nif: '501234567',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Fornecedor principal de peças de motor e transmissão'
    },
    {
      nome: 'Peças Genuínas Portugal',
      pessoa_contato: 'Maria Oliveira',
      email: 'maria@pecasgenuinas.pt',
      telefone: '212 345 678',
      endereco: 'Rua da Liberdade, 200, 1250-096 Lisboa',
      nif: '502345678',
      termos_pagamento: '45 dias',
      ativo: true,
      notas: 'Especialista em peças de carroçaria'
    },
    {
      nome: 'Componentes Automóveis Lusitanos',
      pessoa_contato: 'Carlos Mendes',
      email: 'carlos@cal.pt',
      telefone: '218 765 432',
      endereco: 'Rua da Cintura do Porto, 50, 1900-405 Lisboa',
      nif: '503456789',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Distribuidor de peças Bosch e Sachs'
    },
    {
      nome: 'Elétrica Auto Lisboa',
      pessoa_contato: 'Ana Costa',
      email: 'ana@eletricaauto.pt',
      telefone: '219 876 543',
      endereco: 'Av. Almirante Reis, 80, 1150-007 Lisboa',
      nif: '504567890',
      termos_pagamento: 'À vista',
      ativo: true,
      notas: 'Especialidade em sistemas elétricos e iluminação'
    },
    {
      nome: 'Travões e Suspensões PT',
      pessoa_contato: 'Pedro Ferreira',
      email: 'pedro@travoes-pt.pt',
      telefone: '213 234 567',
      endereco: 'Rua Prior do Crato, 20, 1070-305 Lisboa',
      nif: '505678901',
      termos_pagamento: '15 dias',
      ativo: true,
      notas: 'Distribuidor oficial de ATE e Brembo'
    },
    {
      nome: 'Filtros e Fluidos Industriais',
      pessoa_contato: 'Miguel Rocha',
      email: 'miguel@filtrosfluidos.pt',
      telefone: '218 902 345',
      endereco: 'Zona Industrial da Maia, 45, 1855-001 Lisboa',
      nif: '506789012',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Fornecedor de óleos, filtros e líquidos'
    },
    {
      nome: 'Pneus Auto Express',
      pessoa_contato: 'Rita Alves',
      email: 'rita@pneusexpress.pt',
      telefone: '217 654 321',
      endereco: 'Av. Sidónio Pais, 120, 1050-215 Lisboa',
      nif: '507890123',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Distribuidor de pneus Michelin, Pirelli e Continental'
    },
    {
      nome: 'Vidros e Espelhos Automóveis',
      pessoa_contato: 'Jorge Silva',
      email: 'jorge@vidrosespelhos.pt',
      telefone: '213 567 890',
      endereco: 'Rua da Rosa, 60, 1100-240 Lisboa',
      nif: '508901234',
      termos_pagamento: '45 dias',
      ativo: true,
      notas: 'Vidros laterais, pára-brisas e espelhos'
    },
    {
      nome: 'Sistemas de Ar Condicionado Auto',
      pessoa_contato: 'Fernanda Teixeira',
      email: 'fernanda@arcondsistemas.pt',
      telefone: '219 234 567',
      endereco: 'Av. Vasco da Gama, 30, 1900-314 Lisboa',
      nif: '509012345',
      termos_pagamento: 'À vista + 2%',
      ativo: true,
      notas: 'Compressores, evaporadores e refrigerante'
    },
    {
      nome: 'Tubagens e Mangueiras PT',
      pessoa_contato: 'Rui Pereira',
      email: 'rui@tubagenspt.pt',
      telefone: '218 345 678',
      endereco: 'Rua da Junqueira, 150, 1300-344 Lisboa',
      nif: '510123456',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Tubagens de combustível, travão e arrefecimento'
    },
    {
      nome: 'Juntas e Vedantes Portugal',
      pessoa_contato: 'Sónia Dias',
      email: 'sonia@juntasvedantes.pt',
      telefone: '213 789 012',
      endereco: 'Rua Conselheiro Bettencourt, 40, 1050-051 Lisboa',
      nif: '511234567',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Juntas de cilindro, vedantes e o-rings'
    },
    {
      nome: 'Motores e Transmissões Premium',
      pessoa_contato: 'Helder Gomes',
      email: 'helder@motorestransmissoes.pt',
      telefone: '219 567 890',
      endereco: 'Quinta da Bouza, Vila do Conde, 4400-505 V.N.Gaia',
      nif: '512345678',
      termos_pagamento: '60 dias',
      ativo: true,
      notas: 'Motores remanufaturados e caixas automáticas'
    },
    {
      nome: 'Acessórios Automóveis Porto',
      pessoa_contato: 'Joana Martins',
      email: 'joana@acessoriosportugal.pt',
      telefone: '226 123 456',
      endereco: 'Rua do Heroísmo, 200, 4000-232 Porto',
      nif: '513456789',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Acessórios internos, maçanetas e painéis'
    },
    {
      nome: 'Paint & Parts Covilhã',
      pessoa_contato: 'Bruno Oliveira',
      email: 'bruno@paintparts.pt',
      telefone: '275 321 098',
      endereco: 'Zona Industrial de Covilhã, 6200-277 Covilhã',
      nif: '514567890',
      termos_pagamento: '30 dias',
      ativo: true,
      notas: 'Tintas automotivas e peças de carroçaria'
    }
  ];

  try {
    for (const fornecedor of fornecedores) {
      const created = await prisma.fornecedores.create({
        data: fornecedor
      });
      console.log(`✅ ${created.nome} - ID: ${created.id}`);
    }

    console.log(`\n🎉 Total de ${fornecedores.length} fornecedores inseridos com sucesso!\n`);

    // Mostrar sumário
    const total = await prisma.fornecedores.count();
    const ativos = await prisma.fornecedores.count({
      where: { ativo: true }
    });

    console.log('📊 Sumário:');
    console.log(`   Total de fornecedores: ${total}`);
    console.log(`   Fornecedores ativos: ${ativos}`);

  } catch (error) {
    console.error('❌ Erro ao inserir fornecedores:', error);
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
