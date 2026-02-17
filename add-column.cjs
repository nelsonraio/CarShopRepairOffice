const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addColumn() {
  try {
    await prisma.$executeRaw`ALTER TABLE itens_ordem_trabalho ADD COLUMN aguarda_peca BOOLEAN DEFAULT FALSE;`;
    console.log('Column added successfully');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

addColumn();
