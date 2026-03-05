/**
 * Script de Teste OAuth TOConline
 * 
 * Este script:
 * 1. Gera a URL de autorização para você clicar
 * 2. Aguarda você colar o código capturado
 * 3. Troca o code por um access_token
 * 4. Lista as faturas do TOConline
 */

import readline from 'readline';

const CLIENT_ID = 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = '8f753cea78d995b5b6c877933495bf2b';
const REDIRECT_URI = 'http://localhost:3000/oauth-callback';
const SCOPE = 'commercial';

const OAUTH_URL = 'https://api.toconline.pt/oauth';
const API_BASE_URL = 'https://api7.toconline.pt/api/v1';

console.log('🚀 Iniciando teste OAuth TOConline\n');

/**
 * Passo 1: Gerar URL de autorização e aguardar código do usuário
 */
async function getAuthorizationCode() {
  console.log('📍 PASSO 1: Gerando URL de autorização...\n');

  const authUrl = `${OAUTH_URL}/auth?` + new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE
  });

  console.log('🔗 ABRA ESTA URL NO BROWSER:\n');
  console.log('   ' + authUrl + '\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   1. Clique no link acima ou copie e cole no browser');
  console.log('   2. Faça login no TOConline');
  console.log('   3. Autorize a aplicação');
  console.log('   4. Você será redirecionado para:');
  console.log('      http://localhost:3000/oauth-callback?code=XXX...');
  console.log('   5. COPIE o valor do parâmetro "code" da URL');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Criar interface para ler input do usuário
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('✏️  Cole o código de autorização aqui: ', (code) => {
      rl.close();
      const trimmedCode = code.trim();
      if (trimmedCode) {
        console.log('\n✅ Código recebido:', trimmedCode.substring(0, 40) + '...\n');
        resolve(trimmedCode);
      } else {
        console.error('\n❌ Código vazio!');
        process.exit(1);
      }
    });
  });
}

/**
 * Passo 2: Trocar code por access_token
 */
async function getAccessToken(authCode) {
  console.log('\n\n📍 PASSO 2: Trocando code por access_token...\n');

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  console.log('   Authorization: Basic [REDACTED]');
  console.log('   Code:', authCode.substring(0, 40) + '...');

  const tokenUrl = `${OAUTH_URL}/token`;
  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE
  });

  console.log('\n📤 POST:', tokenUrl);
  console.log('   Body:', payload.toString());

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: payload
    });

    const data = await response.json();

    console.log('\n📡 Resposta:', {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      console.error('\n❌ Erro ao obter token:', data);
      throw new Error(`Token error: ${data.error || 'Unknown'}`);
    }

    if (data.access_token) {
      console.log('\n✅ Access Token obtido:', data.access_token.substring(0, 40) + '...');
      console.log('   Token Type:', data.token_type);
      console.log('   Expires In:', data.expires_in, 'segundos');
      console.log('   Scope:', data.scope);
      
      if (data.refresh_token) {
        console.log('   Refresh Token:', data.refresh_token.substring(0, 40) + '...');
      }
      
      return data.access_token;
    } else {
      throw new Error('Access token não encontrado na resposta');
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
    throw error;
  }
}

/**
 * Passo 3: Listar faturas do TOConline
 */
async function listarFaturas(accessToken) {
  console.log('\n\n📍 PASSO 3: Listando faturas do TOConline...\n');

  const faturasUrl = `${API_BASE_URL}/commercial_sales_documents`;
  
  console.log('📤 GET:', faturasUrl);

  try {
    const response = await fetch(faturasUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    console.log('\n📡 Resposta:', {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      console.error('\n❌ Erro ao listar faturas:', data);
      throw new Error(`API error: ${data.error || 'Unknown'}`);
    }

    if (data.data && Array.isArray(data.data)) {
      console.log(`\n✅ ${data.data.length} faturas encontradas:\n`);
      
      data.data.slice(0, 5).forEach((fatura, index) => {
        console.log(`   ${index + 1}. Fatura #${fatura.id}`);
        console.log(`      Número: ${fatura.attributes?.document_number || 'N/A'}`);
        console.log(`      Cliente: ${fatura.attributes?.customer_business_name || 'N/A'}`);
        console.log(`      Data: ${fatura.attributes?.date || 'N/A'}`);
        console.log(`      Total: ${fatura.attributes?.total_value || 'N/A'} €`);
        console.log(`      Estado: ${fatura.attributes?.status || 'N/A'}`);
        console.log('');
      });

      if (data.data.length > 5) {
        console.log(`   ... e mais ${data.data.length - 5} faturas\n`);
      }

      // Salvar resultado completo em arquivo JSON
      const fs = await import('fs');
      const outputPath = './resultado-faturas-toconline.json';
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`💾 Resultado completo salvo em: ${outputPath}\n`);

      return data.data;
    } else {
      console.log('\n⚠️ Nenhuma fatura encontrada ou formato de resposta inesperado');
      console.log('   Resposta:', JSON.stringify(data, null, 2));
      return [];
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error.message);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    // Passo 1: Obter authorization code
    const authCode = await getAuthorizationCode();
    
    if (!authCode) {
      throw new Error('Falha ao obter authorization code');
    }

    // Passo 2: Trocar code por access token
    const accessToken = await getAccessToken(authCode);
    
    if (!accessToken) {
      throw new Error('Falha ao obter access token');
    }

    // Passo 3: Listar faturas
    const faturas = await listarFaturas(accessToken);

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Total de faturas: ${faturas.length}`);
    console.log(`   Access token válido: ${accessToken.substring(0, 20)}...`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n\n❌ ERRO NO TESTE:\n');
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    console.error('\n');
    process.exit(1);
  }
}

// Executar
main();
