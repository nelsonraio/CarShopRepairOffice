import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const filePath = './Tabela de Veículos Atualizada com Ano.xlsx';

function parseVeiculos(sheet) {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  return rows.map(row => ({
    marca: row['Marca'] || '',
    modelo: String(row['Modelo'] || ''),
    matricula: row['Matrícula'] || '',
    ano: row['Ano'] ? parseInt(row['Ano']) : null,
    numero_chassis: row['Chassis'] || '',
    tipo_motor: row['Motor'] || '',
    tipo_combustivel: row['Combustível'] || '',
    estado: 'disponivel',
    notas: row['Notas'] || '',
  }));
}

async function main() {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const veiculos = parseVeiculos(sheet);

  let count = 0;
  for (const v of veiculos) {
    if (!v.matricula) continue;
    try {
      await prisma.veiculos.upsert({
        where: { matricula: v.matricula },
        update: v,
        create: v,
      });
      count++;
    } catch (err) {
      console.error('Erro ao importar:', v.matricula, err);
    }
  }
  console.log(`Importados ${count} veículos.`);
  await prisma.$disconnect();
}

main();
