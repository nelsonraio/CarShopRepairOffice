import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
const csvPath = path.resolve(process.cwd(), 'stock.csv');

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').slice(2); // Ignora cabeçalho

const parseLine = (line) => {
  const parts = line.split(';').map(s => s.trim());
  if (parts.length < 4) return null;
  const nome = parts[0];
  const quantidade = parseInt(parts[1], 10) || 0;
  const valorRaw = parts[2].replace(/[^\d.,]/g, '').replace(',', '.');
  const valor = parseFloat(valorRaw) || 0;
  const referencia = parts[3];
  if (!referencia) return null;
  return { nome, quantidade, valor, referencia };
};

// Lista de categorias válidas (deve ser igual à tabela categorias_peca)
const CATEGORIAS_VALIDAS = [
  'Suspensão',
  'Direção',
  'Transmissão',
  'Motor',
  'Travagem',
  'Eléctrica',
  'Arrefecimento',
  'Embraiagem',
  'Escape',
  'Filtros',
  'Correias',
  'Rolamentos',
  'Bomba',
  'Ignição',
  'Lubrificantes/Fluidos',
  'Pneus/Rodas',
  'Iluminação',
  'Carroçaria/Acabamento'
];

function mapCategoria(nome) {
  const n = nome.toUpperCase();
  if (n.match(/(AMORTECEDOR|MOLA|BRAÇO|BUCHA|PIV[ÔO]|SUSPENSÃO|SUSPENSAO)/)) return 'Suspensão';
  if (n.match(/(CAIXA DE DIREÇÃO|TERMINAL|BRAÇO|DIREÇÃO|DIRECAO)/)) return 'Direção';
  if (n.match(/(VEIO DE TRANSMISSÃO|SEMI-EIXO|HOMOCINÉTICA|HOMOCINETICA|TRANSMISSÃO|TRANSMISSAO|DISCO|PRATO DE PRESSÃO|ATUADOR|EMBRAIAGEM)/)) return 'Transmissão';
  if (n.match(/(MOTOR|SENSOR|VELA|PISTÃO|PISTAO|BIELA|JUNTA|CABEÇOTE|CABECOTE)/)) return 'Motor';
  if (n.match(/(TRAVÃO|TRAVAO|TRAVAGEM|PASTILHA|DISCO DE TRAVÃO|CILINDRO|LONA|TAMBOR|ÓLEO DE TRAVÕES|OLEO DE TRAVOES)/)) return 'Travagem';
  if (n.match(/(ALTERNADOR|BATERIA|FUSÍVEL|FUSIVEL|RELE|ELÉCTRICA|ELECTRICA|BOBINA|CABO|CHICOTE)/)) return 'Eléctrica';
  if (n.match(/(RADIADOR|TERMOSTATO|BOMBA DE ÁGUA|BOMBA DAGUA|ARREFECIMENTO|VENTOINHA)/)) return 'Arrefecimento';
  if (n.match(/(EMBRAIAGEM|DISCO DE EMBRAIAGEM|PRATO DE PRESSÃO|ATUADOR DE EMBRAIAGEM)/)) return 'Embraiagem';
  if (n.match(/(ESCAPE|CATALISADOR|SILENCIADOR)/)) return 'Escape';
  if (n.match(/(FILTRO)/)) return 'Filtros';
  if (n.match(/(CORREIA|POLIA)/)) return 'Correias';
  if (n.match(/(ROLAMENTO|POLIA)/)) return 'Rolamentos';
  if (n.match(/(BOMBA DE ÁGUA|BOMBA DAGUA|BOMBA DE ÓLEO|BOMBA DE OLEO|BOMBA DE COMBUSTÍVEL|BOMBA DE COMBUSTIVEL|BOMBA)/)) return 'Bomba';
  if (n.match(/(VELA|BOBINA|IGINIÇÃO|IGNICAO)/)) return 'Ignição';
  if (n.match(/(ÓLEO|OLEO|LUBRIFICANTE|FLUIDO)/)) return 'Lubrificantes/Fluidos';
  if (n.match(/(PNEU|JANTE|TAMPÃO|PARAFUSO DE RODA)/)) return 'Pneus/Rodas';
  if (n.match(/(LÂMPADA|LAMPADA|FAROL|LANTERNA|PISCA|ILUMINAÇÃO|ILUMINACAO)/)) return 'Iluminação';
  if (n.match(/(RETROVISOR|PUXADOR|FRISO|PÁRA-CHOQUES|PARACHOQUES|CARROÇARIA|ACABAMENTO)/)) return 'Carroçaria/Acabamento';
  return CATEGORIAS_VALIDAS[0]; // Default para a primeira categoria se não encontrar
}

function detectarCategoria(nome) {
  const n = nome.toUpperCase();
  if (n.includes('FILTRO')) return 'Filtro';
  if (n.includes('CORREIA')) return 'Correia';
  if (n.includes('VELA')) return 'Ignição';
  if (n.includes('ÓLEO')) return 'Óleo';
  if (n.includes('PASTILHA')) return 'Pastilha';
  if (n.includes('ROLAMENTO')) return 'Rolamento';
  if (n.includes('RETENTOR')) return 'Retentor';
  if (n.includes('BOMBA')) return 'Bomba';
  if (n.includes('LÂMPADA') || n.includes('LAMPADA')) return 'Lâmpada';
  if (n.includes('BOTÃO') || n.includes('BOTÕES') || n.includes('BOTAO')) return 'Botão';
  if (n.includes('ANTIC.')) return 'Anticongelante';
  if (n.includes('FORNE')) return 'Terminal';
  if (n.includes('UNIVERSAL')) return 'Universal';
  return 'Outros';
}

async function main() {
  const pecas = lines
    .map(parseLine)
    .filter(p => p && p.referencia);

  for (const peca of pecas) {
    let categoriaNome = mapCategoria(peca.nome);
    if (!CATEGORIAS_VALIDAS.includes(categoriaNome)) categoriaNome = CATEGORIAS_VALIDAS[0];
    // Buscar o id da categoria
    const categoria = await prisma.categorias_peca.findFirst({ where: { nome: categoriaNome } });
    if (!categoria) {
      throw new Error(`Categoria não encontrada para a peça: ${peca.nome} (${categoriaNome})`);
    }
    const existing = await prisma.pecas.findUnique({
      where: { referencia: peca.referencia }
    });
    const pecaData = {
      referencia: peca.referencia,
      nome: peca.nome,
      quantidade_stock: peca.quantidade,
      preco_venda: peca.valor,
      categoria_id: categoria.id,
      custo_unitario: peca.valor
    };
    if (existing) {
      await prisma.pecas.update({
        where: { referencia: peca.referencia },
        data: pecaData
      });
    } else {
      await prisma.pecas.create({
        data: pecaData
      });
    }
    console.log(`Peça ${peca.referencia} importada/atualizada.`);
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
