import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateConstraint() {
  try {
    // Execute raw SQL to drop and recreate constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE ordens_trabalho DROP CONSTRAINT ordens_trabalho_chk_1
    `);
    console.log('Old constraint dropped');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE ordens_trabalho ADD CONSTRAINT ordens_trabalho_chk_1 
      CHECK (estado IN ('em_andamento', 'aguarda_peca', 'concluido', 'entregue', 'cancelado'))
    `);
    console.log('New constraint created');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateConstraint();
