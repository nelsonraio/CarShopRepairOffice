const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const clientes = await prisma.clientes.findMany({
      take: 5, // Limit to 5 records
    });
    console.log('Dados da tabela clientes:');
    console.log(JSON.stringify(clientes, null, 2));
  } catch (error) {
    console.error('Erro na conexão:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
