const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const marca = await prisma.marcas.upsert({
    where: { nome: 'Skoda' },
    update: {},
    create: { nome: 'Skoda', pais_origem: 'República Checa', ativo: true }
  });
  console.log('Marca criada/existente: Skoda (id=' + marca.id + ')');

  const modelos = [
    'Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq',
    'Scala', 'Enyaq', 'Enyaq Coupé', 'Citigo', 'Rapid',
    'Roomster', 'Yeti', 'Felicia', 'Elroq', 'Epiq',
    'Kushaq', 'Slavia'
  ];

  let created = 0;
  for (const nome of modelos) {
    const exists = await prisma.modelos.findFirst({
      where: { marca_id: marca.id, nome }
    });
    if (!exists) {
      await prisma.modelos.create({
        data: { marca_id: marca.id, nome, tipo_veiculo: 'Ligeiro', ativo: true }
      });
      created++;
      console.log('  + ' + nome);
    } else {
      console.log('  = ' + nome + ' (já existe)');
    }
  }
  console.log('Total inseridos: ' + created + '/' + modelos.length);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
