// Script para importar peças do stock.csv e categorizar com base na tabela categorias_peca
// Uso: node scripts/import-stock-categorized.mjs

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const csvPath = path.resolve(process.cwd(), 'stock.csv');

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').slice(2); // Ignora cabeçalho

// Obter categorias válidas do banco de dados
async function getCategoriasMap() {
  const categorias = await prisma.categorias_peca.findMany({ where: { ativo: true } });
  // Mapa: nome maiúsculo -> id
  const map = {};
  for (const cat of categorias) {
    map[cat.nome.toUpperCase()] = cat.id;
  }
  return map;
}

function mapCategoria(nome, categoriasMap) {
  const n = nome.toUpperCase();
  if (n.includes('PASTILHA')) return 'Travagem';
  if (n.includes('MAXILA')) return 'Travagem';
  if (n.includes('ROLAMENTO')) return 'Rolamentos';
  if (n.includes('RETENTOR')) return 'Motor';
  if (n.includes('BOMBA')) return 'Bomba';
  if (n.includes('ÓLEO') || n.includes('OLEO')) return 'Lubrificantes/Fluidos';
  if (n.includes('FILTRO')) return 'Filtros';
  if (n.includes('AR')) return 'Filtros';
  // Adicione mais regras conforme necessário
  return 'Motor'; // Default
}

async function main() {
  const categoriasMap = await getCategoriasMap();
  let count = 0;
  for (const line of lines) {
    const parts = line.split(';').map(s => s.trim());
    if (parts.length < 4) continue;
    const nome = parts[0];
    const quantidade = parseInt(parts[1], 10) || 0;
    const valorRaw = parts[2].replace(/[^\d.,]/g, '').replace(',', '.');
    const valor = parseFloat(valorRaw) || 0;
    const referencia = parts[3];
    if (!referencia) continue;
    const categoriaNome = mapCategoria(nome, categoriasMap);
    const categoriaId = categoriasMap[categoriaNome.toUpperCase()];
    if (!categoriaId) {
      console.warn(`Categoria não encontrada para: ${categoriaNome}`);
      continue;
    }
    // Upsert peça
    await prisma.pecas.upsert({
      where: { referencia },
      update: { nome, quantidade_stock: quantidade, custo_unitario: valor, categoria_id: categoriaId },
      create: { nome, referencia, quantidade_stock: quantidade, custo_unitario: valor, categoria_id: categoriaId, preco_venda: valor },
    });
    count++;
    console.log(`Peça ${nome} (${referencia}) categorizada como ${categoriaNome}`);
  }
  console.log(`Total de peças importadas/atualizadas: ${count}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
