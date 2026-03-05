  import readline from 'readline';
  import {
    getOAuthUrl,
    getOAuthToken,
    criarFatura,
    listarFaturas,
    getPdfLink
  } from '../src/lib/toconlineApi.js';
  import { debugPdfUrl } from '../src/lib/debugPdfUrl.js';

async function main() {
  try {
    // Passo 1: Autenticação
    const oauthUrl = getOAuthUrl();
    console.log('Abra este URL no browser e autorize a aplicação:');
    console.log(oauthUrl);
    // Tenta abrir automaticamente o link no navegador padrão
    try {
      const open = (await import('open')).default;
      await open(oauthUrl);
      console.log('(O link de autorização foi aberto automaticamente no navegador padrão)');
    } catch (err) {
      console.log('(Não foi possível abrir automaticamente o navegador. Abra manualmente se necessário.)');
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const authorizationCode = await new Promise(resolve => {
      rl.question('Cole aqui o authorization_code: ', code => {
        rl.close();
        resolve(code.trim());
      });
    });
    let token;
    try {
      token = await getOAuthToken(authorizationCode);
    } catch (err) {
      console.error('Erro na autenticação OAuth2:', err.message);
      if (err.response) {
        console.error('Detalhes:', await err.response.text());
      }
      return;
    }

    // Passo 2: Listar faturas
    let faturas;
    try {
      faturas = await listarFaturas(token);
      if (!faturas.length) {
        console.log('Nenhuma fatura encontrada.');
      } else {
        console.log('\nFaturas existentes:');
        faturas.forEach(f => {
          console.log(`ID: ${f.id} | Tipo: ${f.tipo} | Cliente: ${f.cliente} | Data: ${f.data}`);
        });
      }
    } catch (err) {
      console.error('Erro ao listar faturas:', err.message);
      return;
    }

    // Passo 3: Criar fatura (exemplo)
    // try {
    //   const novaFaturaId = await criarFatura(token, 'ID_DO_CLIENTE');
    //   console.log('Fatura criada com ID:', novaFaturaId);
    // } catch (err) {
    //   console.error('Erro ao criar fatura:', err.message);
    // }

    // Passo 4: Obter link PDF de uma fatura
    const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl2.question('Insira o ID da fatura para obter o PDF: ', async (faturaId) => {
      rl2.close();
      try {
        const pdfUrl = await getPdfLink(token, faturaId.trim());
        console.log('Link completo para download do PDF:', pdfUrl);
      } catch (err) {
        console.error('Erro ao obter PDF:', err.message);
        // Debug extra: mostrar valor real do campo url devolvido pela API
        try {
          const rawUrl = await debugPdfUrl(token, faturaId.trim());
          console.error('Valor devolvido pelo campo url:', rawUrl);
        } catch (debugErr) {
          console.error('Erro ao obter valor bruto do campo url:', debugErr.message);
        }
        if (err.response) {
          console.error('Detalhes:', await err.response.text());
        }
      }
    });
  } catch (err) {
    console.error('Erro inesperado:', err.message);
  }
}

main();
