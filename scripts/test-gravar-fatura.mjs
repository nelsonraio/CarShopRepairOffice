import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarGravarFatura() {
  try {
    console.log('🔄 Testando gravação de fatura local...\n');
    
    // Buscar ou criar cliente de teste
    let cliente = await prisma.clientes.findFirst({
      where: { nif: '123456789-TEST' }
    });
    
    if (!cliente) {
      console.log('👤 Criando cliente de teste...');
      cliente = await prisma.clientes.create({
        data: {
          nome: 'Cliente Teste Gravação',
          nif: '123456789-TEST',
          endereco: 'Rua de Teste, 123',
          telefone: '912345678',
          email: 'teste@test.com',
          perfil: 'Normal'
        }
      });
      console.log('✅ Cliente criado:', cliente);
    } else {
      console.log('✅ Cliente existe:', cliente);
    }
    
    // Criar fatura de teste
    console.log('\n💾 Criando fatura de teste...');
    const numeroFatura = `FT${Date.now().toString().slice(-10)}`;
    const fatura = await prisma.faturas.create({
      data: {
        numero_fatura: numeroFatura,
        cliente_id: cliente.id,
        ordem_trabalho_id: null,
        data_emissao: new Date(),
        data_vencimento: new Date(),
        subtotal: 100.00,
        valor_imposto: 23.00,
        valor_desconto: 0,
        valor_total: 123.00,
        estado: 'pendente',
        notas: 'Fatura de teste',
        valor_pago: 0
      }
    });
    
    console.log('✅ Fatura criada com sucesso!');
    console.log('   ID:', Number(fatura.id));
    console.log('   Número:', fatura.numero_fatura);
    console.log('   Total:', fatura.valor_total);
    
    // Verificar se foi gravada
    console.log('\n🔍 Verificando se foi gravada na base de dados...');
    const faturaVerify = await prisma.faturas.findFirst({
      where: { numero_fatura: fatura.numero_fatura }
    });
    
    if (faturaVerify) {
      console.log('✅ Fatura encontrada na BD!');
      console.log('   ID:', Number(faturaVerify.id));
      console.log('   Número:', faturaVerify.numero_fatura);
      console.log('   Cliente ID:', faturaVerify.cliente_id);
      console.log('   Total:', faturaVerify.valor_total);
    } else {
      console.log('❌ Fatura NÃO encontrada na BD!');
    }
    
    // Listar últimas 5 faturas
    console.log('\n📋 Últimas 5 faturas na base de dados:');
    const faturas = await prisma.faturas.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: {
        id: true,
        numero_fatura: true,
        valor_total: true,
        estado: true,
        data_emissao: true
      }
    });
    
    faturas.forEach(f => {
      console.log(`   - ${f.numero_fatura}: €${f.valor_total} (${f.estado})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testarGravarFatura();
