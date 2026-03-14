// Script para categorizar peças pela lógica do nome/referência
// Uso: node scripts/logic-categorize-parts.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de categorias válidas (igual à tabela categorias_peca)
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

function mapCategoria(nome, referencia) {
  const n = (nome + ' ' + (referencia || '')).toUpperCase();
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
  return null;
}

async function main() {
  const pecas = await prisma.peca.findMany();
  let atualizadas = 0;
  for (const peca of pecas) {
    const categoria = mapCategoria(peca.nome, peca.referencia);
    if (categoria && peca.categoria !== categoria) {
      await prisma.peca.update({
        where: { id: peca.id },
        data: { categoria }
      });
      console.log(`Peça ${peca.nome} (${peca.referencia}) categorizada como: ${categoria}`);
      atualizadas++;
    }
  }
  console.log(`Total de peças atualizadas: ${atualizadas}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
