import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  await prisma.keystart.create({ data: { chave: process.env.CHAVE_UTILIZACAO || 'ADMIN2026$', ativo: true } });
  await prisma.$disconnect();
}
main();