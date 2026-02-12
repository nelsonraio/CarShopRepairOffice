import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const perfisPadrao = [
  { nome: 'Normal', descricao: 'Cliente normal sem desconto', desconto: 0.00 },
  { nome: 'TVDE Interno', descricao: 'Motorista TVDE interno com desconto de 10%', desconto: 10.00 },
  { nome: 'TVDE Externo', descricao: 'Motorista TVDE externo com desconto de 5%', desconto: 5.00 },
  { nome: 'Empresa', descricao: 'Cliente empresa com desconto de 15%', desconto: 15.00 }
];

async function seedPerfisClientes() {
  console.log('🌱 Seeding perfis de clientes...');

  for (const perfil of perfisPadrao) {
    try {
      await prisma.perfis_clientes.upsert({
        where: { nome: perfil.nome },
        update: {
          descricao: perfil.descricao,
          desconto: perfil.desconto,
          ativo: true
        },
        create: {
          nome: perfil.nome,
          descricao: perfil.descricao,
          desconto: perfil.desconto,
          ativo: true
        }
      });
      console.log(`✅ Perfil "${perfil.nome}" criado/atualizado com desconto de ${perfil.desconto}%`);
    } catch (error) {
      console.error(`❌ Erro ao criar perfil "${perfil.nome}":`, error);
    }
  }

  console.log('✨ Seeding de perfis de clientes concluído!');
}

seedPerfisClientes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
