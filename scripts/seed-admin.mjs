/**
 * Script para criar o utilizador admin inicial
 * Executar: node scripts/seed-admin.mjs
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mqauto.pt';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.utilizadores.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('Utilizador admin já existe:', existing.email);
    return;
  }

  const admin = await prisma.utilizadores.create({
    data: {
      nome_utilizador: 'admin',
      email,
      hash_palavra_passe: hashedPassword,
      nome_completo: 'Administrador',
      papel: 'admin',
      ativo: true,
    },
  });

  console.log('Utilizador admin criado com sucesso!');
  console.log('Email:', admin.email);
  console.log('Password:', password);
  console.log('Papel:', admin.papel);
}

main()
  .catch((e) => {
    console.error('Erro ao criar admin:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
