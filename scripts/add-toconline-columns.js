import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Adicionando colunas toconline_* à tabela faturas...');
    
    // Adicionar colunas uma a uma
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE faturas ADD COLUMN toconline_id VARCHAR(50)`
      );
      console.log('✅ Coluna toconline_id criada');
    } catch (e) {
      if (e.message.includes('1060')) {
        console.log('⚠️ Coluna toconline_id já existe');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE faturas ADD COLUMN toconline_customer_id VARCHAR(50)`
      );
      console.log('✅ Coluna toconline_customer_id criada');
    } catch (e) {
      if (e.message.includes('1060')) {
        console.log('⚠️ Coluna toconline_customer_id já existe');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE faturas ADD COLUMN recibo_toconline_id VARCHAR(50)`
      );
      console.log('✅ Coluna recibo_toconline_id criada');
    } catch (e) {
      if (e.message.includes('1060')) {
        console.log('⚠️ Coluna recibo_toconline_id já existe');
      } else {
        throw e;
      }
    }
    
    console.log('✅ Todas as colunas verificadas/criadas com sucesso');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
