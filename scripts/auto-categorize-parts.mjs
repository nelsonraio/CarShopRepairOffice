// Script para categorizar peças automaticamente consultando a internet
// Uso: node scripts/auto-categorize-parts.mjs

import prisma from '../prisma/client';
import fetch from 'node-fetch';

async function searchCategoryOnline(reference) {
  // Exemplo: pesquisa simples no Google (pode ser trocado por API específica)
  const query = encodeURIComponent(reference + ' peça automóvel categoria');
  const url = `https://www.google.com/search?q=${query}`;
  // Aqui, apenas retorna a URL de pesquisa (não faz scraping real por limitações de acesso)
  // Em produção, usar API de terceiros ou scraping controlado
  return url;
}

async function main() {
  const pecas = await prisma.peca.findMany();
  for (const peca of pecas) {
    if (!peca.referencia) continue;
    const searchUrl = await searchCategoryOnline(peca.referencia);
    console.log(`Peça: ${peca.nome} | Referência: ${peca.referencia}`);
    console.log(`Pesquisar: ${searchUrl}`);
    // TODO: Implementar scraping/API para obter categoria real
    // TODO: Atualizar categoria na base de dados
  }
  console.log('Processo concluído.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
