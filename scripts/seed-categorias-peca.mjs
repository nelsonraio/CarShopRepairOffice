import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categorias = [
  { nome: 'Suspensão', descricao: 'Amortecedores, molas, braços, buchas, pivôs, etc.' },
  { nome: 'Direção', descricao: 'Caixa de direção, terminais, braços, etc.' },
  { nome: 'Transmissão', descricao: 'Veio de transmissão, juntas homocinéticas, embraiagens, etc.' },
  { nome: 'Motor', descricao: 'Peças do motor, velas, sensores, etc.' },
  { nome: 'Travagem', descricao: 'Pastilhas, discos, cilindros, óleo de travões.' },
  { nome: 'Eléctrica', descricao: 'Alternadores, baterias, componentes eléctricos.' },
  { nome: 'Arrefecimento', descricao: 'Termóstatos, radiadores, bombas de água, etc.' },
  { nome: 'Embraiagem', descricao: 'Disco, prato de pressão, atuador, rolamento de embraiagem.' },
  { nome: 'Escape', descricao: 'Escapes, catalisadores, silenciadores.' },
  { nome: 'Filtros', descricao: 'Filtros de óleo, ar, combustível, habitáculo, etc.' },
  { nome: 'Correias', descricao: 'Correias de distribuição, acessórios, polias.' },
  { nome: 'Rolamentos', descricao: 'Rolamentos de roda, polias, etc.' },
  { nome: 'Bomba', descricao: 'Bombas de combustível, água, óleo, etc.' },
  { nome: 'Ignição', descricao: 'Velas, cabos, bobinas e componentes de ignição.' },
  { nome: 'Lubrificantes/Fluidos', descricao: 'Óleos, fluidos de travões, direção, transmissão.' },
  { nome: 'Pneus/Rodas', descricao: 'Pneus, jantes, tampões, parafusos.' },
  { nome: 'Iluminação', descricao: 'Lâmpadas, faróis, lanternas, piscas.' },
  { nome: 'Carroçaria/Acabamento', descricao: 'Retrovisores, puxadores, frisos, pára-choques.' }
];

async function main() {
  for (const cat of categorias) {
    await prisma.categorias_peca.upsert({
      where: { nome: cat.nome },
      update: { descricao: cat.descricao, ativo: true },
      create: { nome: cat.nome, descricao: cat.descricao, ativo: true }
    });
    console.log(`Categoria '${cat.nome}' criada/atualizada.`);
  }
  await prisma.$disconnect();
  console.log('Seed de categorias de peça concluído!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
