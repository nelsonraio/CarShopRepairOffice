import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
  try {
    console.log('🚀 Conectando ao MySQL...')


    // Verifique se o modelo no seu schema.prisma é 'clientes'
    const contagemClientes = await prisma.clientes.count()
    const contagemMecanicos = await prisma.mecanicos.count()
    const mecanicosAtivos = await prisma.mecanicos.findMany({
      where: { ativo: true },
      select: { id: true, nome: true }
    })

    console.log(`✅ Conexão estabelecida com sucesso!`)
    console.log(`📊 Total de clientes no banco: ${contagemClientes}`)
    console.log(`📊 Total de mecanicos no banco: ${contagemMecanicos}`)
    console.log(`📊 Mecanicos ativos:`, mecanicosAtivos)

  } catch (error) {
    console.error('❌ Erro detalhado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
