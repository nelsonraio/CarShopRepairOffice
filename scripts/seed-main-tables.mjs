// Seed para tabelas principais: clientes, veiculos, mecanicos, ordens_trabalho, faturas
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Limpar dados existentes para evitar conflitos de unicidade
    await prisma.faturas.deleteMany();
    await prisma.ordens_trabalho.deleteMany();
    await prisma.veiculos.deleteMany();
    await prisma.mecanicos.deleteMany();
    await prisma.clientes.deleteMany();
  // Clientes
  const cliente1 = await prisma.clientes.create({
    data: {
      nome: 'João Silva',
      nif: '123456789',
      endereco: 'Rua das Flores, 10',
      telefone: '912345678',
      email: 'joao.silva@email.com',
      perfil: 'Normal',
      ativo: true
    }
  });
  const cliente2 = await prisma.clientes.create({
    data: {
      nome: 'Empresa XPTO',
      nif: '987654321',
      endereco: 'Av. Central, 100',
      telefone: '219876543',
      email: 'contato@xpto.com',
      perfil: 'Empresa',
      ativo: true
    }
  });

  // Veículos
  const veiculo1 = await prisma.veiculos.create({
    data: {
      cliente_id: cliente1.id,
      marca: 'Renault',
      modelo: 'Clio',
      matricula: 'AA-11-BB',
      ano: 2018,
      estado: 'disponivel'
    }
  });
  const veiculo2 = await prisma.veiculos.create({
    data: {
      cliente_id: cliente2.id,
      marca: 'Peugeot',
      modelo: '208',
      matricula: 'CC-22-DD',
      ano: 2020,
      estado: 'disponivel'
    }
  });

  // Mecanicos
  const mecanico1 = await prisma.mecanicos.create({
    data: {
      nome: 'Carlos Mecânico',
      especialidade: 'Motor',
      ativo: true
    }
  });

  // Ordens de trabalho
  const ordem1 = await prisma.ordens_trabalho.create({
    data: {
      ref_ordem_trabalho: 'OT2026-001',
      cliente_id: cliente1.id,
      veiculo_id: veiculo1.id,
      mecanico_id: mecanico1.id,
      estado: 'em_andamento',
      total_pecas: 120.00,
      total_mao_obra: 80.00,
      total_desconto: 10.00,
      total_imposto: 23.00,
      total_geral: 213.00
    }
  });

  // Faturas
  await prisma.faturas.create({
    data: {
      numero_fatura: 'FT2026-001',
      cliente_id: cliente1.id,
      ordem_trabalho_id: Number(ordem1.id),
      data_emissao: new Date(),
      data_vencimento: new Date(Date.now() + 15*24*60*60*1000),
      estado: 'pendente',
      subtotal: 200.00,
      valor_imposto: 23.00,
      valor_desconto: 10.00,
      valor_total: 213.00,
      valor_pago: 0,
      notas: 'Reparação geral'
    }
  });

  console.log('Seed concluído!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
