import readline from 'readline';
import {
  getOAuthUrl,
  getOAuthToken,
  criarFaturaSimplificada,
  getPdfLink
} from '../src/lib/toconlineApi.js';

async function main() {
  try {
    // Passo 1: Obter URL de autenticação
    const authUrl = getOAuthUrl();
    console.log('Abra este URL no navegador para autorizar a aplicação:');
    console.log(authUrl);

    // Passo 2: Pedir código de autorização ao utilizador
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const code = await new Promise(resolve => {
      rl.question('Insira o código de autorização: ', answer => {
        resolve(answer.trim());
      });
    });

    // Pedir JSON completo ao utilizador
    console.log('Cole o JSON completo para a fatura simplificada (data/attributes):');
    const jsonInput = await new Promise(resolve => {
      let input = '';
      rl.on('line', line => {
        input += line + '\n';
      });
      rl.on('close', () => {
        resolve(input);
      });
    });
    let payload;
    try {
      payload = JSON.parse(jsonInput);
    } catch (e) {
      console.error('JSON inválido:', e.message);
      return;
    }

    // Passo 3: Trocar código por access_token
    const token = await getOAuthToken(code);
    console.log('Token obtido com sucesso!');

    // Passo 4: Enviar para a API
    console.log('JSON enviado para TOConline:', JSON.stringify(payload, null, 2));
    const faturaId = await criarFaturaSimplificada(token, payload);
    console.log(`Fatura simplificada criada! ID: ${faturaId}`);

    // Passo 5: Obter link do PDF
    const pdfLink = await getPdfLink(token, faturaId);
    console.log('Link para o PDF da fatura:', pdfLink);
  } catch (err) {
    console.error('Erro no processo:', err.message);
    if (err.debugInfo) {
      console.error('DEBUG:', err.debugInfo);
    }
    if (err.response && typeof err.response.json === 'function') {
      try {
        const errorBody = await err.response.json();
        console.error('Corpo da resposta de erro:', JSON.stringify(errorBody, null, 2));
      } catch (e) {
        console.error('Erro ao obter corpo da resposta:', e);
      }
    }
  }
}

main();
