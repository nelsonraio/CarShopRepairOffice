
import { NextResponse } from 'next/server';
import { db } from '@/db/connection';
import { clientes, faturas, ordensTrabalho } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api7.toconline.pt';
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '8f753cea78d995b5b6c877933495bf2b';
const OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'https://app7.toconline.pt/oauth';
const DEFAULT_REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
const SCOPE = 'commercial';

function resolveRedirectUri(redirectUriFromRequest) {
  const fromRequest = typeof redirectUriFromRequest === 'string' ? redirectUriFromRequest.trim() : '';
  if (fromRequest) {
    return fromRequest;
  }

  const fromEnv = typeof DEFAULT_REDIRECT_URI === 'string' ? DEFAULT_REDIRECT_URI.trim() : '';
  if (fromEnv) {
    return fromEnv;
  }

  throw new Error('redirect_uri não configurado. Defina NEXT_PUBLIC_REDIRECT_URI ou envie redirectUri no pedido.');
}

async function getOAuthToken(code, redirectUri) {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  console.log('🔐 Tentando obter token com:');
  console.log('   CLIENT_ID:', CLIENT_ID);
  console.log('   REDIRECT_URI:', redirectUri);
  console.log('   Code length:', code?.length || 0);
  console.log('   Auth header:', `Basic ${basicAuth.substring(0, 20)}...`);
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code.trim(),
    redirect_uri: redirectUri,
    scope: SCOPE
  });

  console.log('📤 Body params:', params.toString());
  
  const res = await fetch(`${OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    },
    body: params
  });
  
  const json = await res.json();
  
  console.log('📡 Resposta TOConline:', {
    status: res.status,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries()),
    data: json
  });
  
  if (!json.access_token) {
    let errorMsg = 'Falha ao obter access_token: ' + JSON.stringify(json);
    
    // Mensagens mais específicas baseadas no erro
    if (json.error === 'unauthorized_client') {
      errorMsg = '❌ Cliente não autorizado. Verifique se CLIENT_ID e CLIENT_SECRET estão corretos.';
    } else if (json.error === 'invalid_grant') {
      errorMsg = '❌ Código de autorização inválido ou expirado. Por favor, gere um novo código (os códigos OAuth expiram em poucos minutos).';
    } else if (json.error === 'invalid_request') {
      errorMsg = '❌ Requisição inválida. Verifique se todos os parâmetros estão corretos.';
    }
    
    throw new Error(errorMsg);
  }
  return json.access_token;
}

export async function POST(req) {
  try {
    const { payload, authCode, accessToken, redirectUri, percentual_imposto, subtotal, valor_desconto, ordem_trabalho_id } = await req.json();
    
    let token;
    
    // Se recebeu accessToken, usa diretamente (token já obtido anteriormente)
    if (accessToken) {
      console.log('✅ Usando access_token existente');
      console.log('   Comprimento recebido:', accessToken.length);
      console.log('   Primeiros 20 chars:', accessToken.substring(0, 20) + '...');
      console.log('   Últimos 10 chars:', '...' + accessToken.substring(accessToken.length - 10));
      token = accessToken;
    }
    // Se recebeu authCode, troca por access_token (primeira vez)
    else if (authCode) {
      console.log('🔄 Trocando código de autorização por access_token...');
      token = await getOAuthToken(authCode, resolveRedirectUri(redirectUri));
    }
    // Se não tem nenhum dos dois, erro
    else {
      throw new Error('Código de autorização ou access_token não fornecido.');
    }
    
    // Se não há payload, só retorna o token (usado para obter token inicial)
    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ success: true, data: { access_token: token } });
    }
    
    // Caso contrário, cria fatura normalmente
    const res = await fetch(`${BASE_URL}/api/v1/commercial_sales_documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('🔄 Enviando para TOConline com token:');
    console.log('   Comprimento do token usado:', token.length);
    console.log('   Primeiros 20 chars:', token.substring(0, 20) + '...');
    console.log('   Últimos 10 chars:', '...' + token.substring(token.length - 10));
    console.log('   Status resposta:', res.status, res.ok);
    
    const data = await res.json();
    
    console.log('📡 Resposta TOConline completa:', JSON.stringify(data, null, 2));
    
    if (res.ok && data?.id) {
      // Finalizar fatura no TOConline
      console.log('🔒 Finalizando fatura no TOConline com ID:', data.id);
      try {
        const finalizeRes = await fetch(`${BASE_URL}/api/commercial_sales_documents`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              type: 'commercial_sales_documents',
              id: String(data.id),
              attributes: {
                status: 1
              }
            }
          })
        });
        const finalizeData = await finalizeRes.json();
        console.log('📡 Resposta finalização HTTP:', finalizeRes.status, finalizeRes.ok);
        console.log('📡 Resposta finalização completa:', JSON.stringify(finalizeData, null, 2));
        if (finalizeRes.ok) {
          console.log('✅ Fatura finalizada no TOConline - Status:', finalizeData?.data?.attributes?.status);
        } else {
          console.error('❌ Erro ao finalizar:', finalizeData);
        }
      } catch (finalizeErr) {
        console.error('⚠️ Erro ao finalizar fatura no TOConline:', finalizeErr.message);
      }
      
      let localError = null;
      let faturaLocal = null;
      let errorDetails = null;
      
      try {
        const faturaOnline = data;  // Dados vêm diretos, não em data.data
        
        console.log('💾 Gravando fatura local...');
        console.log('   Número:', faturaOnline.document_no);
        console.log('   Cliente:', faturaOnline.customer_business_name);
        console.log('   Data emissão:', faturaOnline.date);
        console.log('   Data vencimento:', faturaOnline.due_date);
        
        // Calcular valor_imposto em euros a partir da percentagem
        const valorImpostoEmEuros = subtotal ? (subtotal * percentual_imposto / 100) : 0;
        
        // Buscar cliente pelo NIF (campo único)
        const nomeCliente = faturaOnline.customer_business_name || 'Consumidor Final';
        const nifCliente = faturaOnline.customer_tax_registration_number || '';
        console.log('🔍 Procurando cliente por NIF:', nifCliente);
        let cliente = (await db.select().from(clientes).where(eq(clientes.nif, nifCliente)).limit(1))[0];
        
        if (!cliente) {
          console.log('👤 Cliente não encontrado, criando novo...');
          // Criar cliente se não existir
          try {
            const insertResult = await db.insert(clientes).values({
              nome: nomeCliente,
              nif: nifCliente,
              endereco: faturaOnline.customer_address_detail || '',
              telefone: '',
              email: '',
              // perfil: 'Normal' // Remove or map if not in schema
            });
            const insertedId = insertResult.insertId || insertResult[0]?.insertId || insertResult[0]?.id;
            cliente = (await db.select().from(clientes).where(eq(clientes.id, insertedId)).limit(1))[0];
            console.log('✅ Cliente criado com ID:', cliente.id);
          } catch (clienteErr) {
            console.error('❌ Erro ao criar cliente:', clienteErr);
            throw new Error('Falha ao criar cliente: ' + clienteErr.message);
          }
        } else {
          console.log('✅ Cliente encontrado com ID:', cliente.id);
          // Atualizar nome e endereço se diferentes do que foi enviado ao TOConline
          if (cliente.nome !== nomeCliente || cliente.endereco !== (faturaOnline.customer_address_detail || '')) {
            console.log('📝 Atualizando dados do cliente...');
            console.log('   Nome anterior:', cliente.nome);
            console.log('   Nome novo:', nomeCliente);
            try {
              await db.update(clientes)
                .set({ nome: nomeCliente, endereco: faturaOnline.customer_address_detail || cliente.endereco })
                .where(eq(clientes.id, cliente.id));
              cliente = (await db.select().from(clientes).where(eq(clientes.id, cliente.id)).limit(1))[0];
              console.log('✅ Cliente atualizado');
            } catch (updateErr) {
              console.error('⚠️ Erro ao atualizar cliente:', updateErr);
              // Não falha a fatura se não conseguir atualizar o cliente
            }
          }
        }
        
        const numeroFaturaToconline =
          faturaOnline.document_number ||
          faturaOnline.document_no ||
          faturaOnline.number ||
          null;

        if (!numeroFaturaToconline) {
          throw new Error('TOConline não devolveu o número da fatura (document_number/document_no).');
        }

        const valorDesconto = parseFloat(valor_desconto) || 0;
        const valorSubtotal = parseFloat(subtotal) || 0;
        const valorImpostoRounded = Math.round(valorImpostoEmEuros * 100) / 100;
        const valorTotalCalculado = valorSubtotal + valorImpostoRounded - valorDesconto;

        console.log('📊 Valores calculados:');
        console.log('   Número TOConline:', numeroFaturaToconline);
        console.log('   Subtotal:', valorSubtotal);
        console.log('   Imposto:', valorImpostoRounded);
        console.log('   Desconto:', valorDesconto);
        console.log('   Total:', valorTotalCalculado);

        const ordemTrabalhoIdParsed = ordem_trabalho_id ? parseInt(ordem_trabalho_id) : null;

        if (ordemTrabalhoIdParsed) {
          const faturaExistente = (await db.select({ id: faturas.id, numeroFatura: faturas.numeroFatura })
            .from(faturas)
            .where(eq(faturas.ordemTrabalhoId, ordemTrabalhoIdParsed))
            .limit(1))[0];

          if (faturaExistente) {
            throw new Error(`A ordem de trabalho já está faturada (fatura ${faturaExistente.numeroFatura}).`);
          }

          const ordemTrabalho = (await db.select({ id: ordensTrabalho.id, refOrdemTrabalho: ordensTrabalho.refOrdemTrabalho, faturaId: ordensTrabalho.faturaId })
            .from(ordensTrabalho)
            .where(eq(ordensTrabalho.id, ordemTrabalhoIdParsed))
            .limit(1))[0];

          if (!ordemTrabalho) {
            throw new Error('Ordem de trabalho não encontrada.');
          }

          if (ordemTrabalho.faturaId) {
            const faturaPorVinculo = (await db.select({ id: faturas.id, numeroFatura: faturas.numeroFatura })
              .from(faturas)
              .where(eq(faturas.id, ordemTrabalho.faturaId))
              .limit(1))[0];

            if (faturaPorVinculo) {
              throw new Error(`A ordem ${ordemTrabalho.refOrdemTrabalho} já está associada à fatura ${faturaPorVinculo.numeroFatura}.`);
            }

            await db.update(ordensTrabalho)
              .set({ faturaId: null })
              .where(eq(ordensTrabalho.id, ordemTrabalhoIdParsed));
            console.warn('⚠️ Vínculo órfão limpo em ordensTrabalho.faturaId:', ordemTrabalhoIdParsed);
          }
        }

        const dataParaGravar = {
          numeroFatura: numeroFaturaToconline,
          clienteId: cliente.id,
          ordemTrabalhoId: ordemTrabalhoIdParsed,
          dataEmissao: faturaOnline.date || null,
          dataVencimento: faturaOnline.due_date || null,
          subtotal: valorSubtotal,
          valorImposto: valorImpostoRounded,
          valorDesconto: valorDesconto,
          valorTotal: valorTotalCalculado,
          estado: 'pendente', // Sempre pendente inicialmente
          notas: faturaOnline.notes || ''
          // Nota: toconline_id e toconline_customer_id serão gravados após criação com update se necessário
        };

        console.log('📝 Dados para gravar:', {
          numero_fatura: dataParaGravar.numeroFatura,
          cliente_id: dataParaGravar.clienteId,
          ordem_trabalho_id: dataParaGravar.ordemTrabalhoId?.toString(),
          data_emissao: dataParaGravar.dataEmissao,
          data_vencimento: dataParaGravar.dataVencimento,
          subtotal: dataParaGravar.subtotal,
          valor_imposto: dataParaGravar.valorImposto,
          valor_desconto: dataParaGravar.valorDesconto,
          valor_total: dataParaGravar.valorTotal
        });

        try {
          const insertResult = await db.insert(faturas).values(dataParaGravar);
          const insertedId = insertResult.insertId || insertResult[0]?.insertId || insertResult[0]?.id;
          faturaLocal = (await db.select().from(faturas).where(eq(faturas.id, insertedId)).limit(1))[0];
          console.log('✅ Fatura local gravada com ID:', Number(faturaLocal.id));

          // Atualizar com toconline_id e toconline_customer_id
          if (faturaOnline.id) {
            console.log('📝 Atualizando toconline_id:', faturaOnline.id);
            await db.update(faturas)
              .set({
                toconlineId: String(faturaOnline.id),
                toconlineCustomerId: faturaOnline.customer_id ? String(faturaOnline.customer_id) : null
              })
              .where(eq(faturas.id, faturaLocal.id));
            faturaLocal = (await db.select().from(faturas).where(eq(faturas.id, faturaLocal.id)).limit(1))[0];
            console.log('✅ toconline_id atualizado');
          }

          if (ordemTrabalhoIdParsed) {
            await db.update(ordensTrabalho)
              .set({ faturaId: faturaLocal.id })
              .where(eq(ordensTrabalho.id, ordemTrabalhoIdParsed));
            console.log('✅ Ordem de trabalho associada à fatura:', ordemTrabalhoIdParsed);
          }
        } catch (err) {
          console.error('❌ Erro Drizzle detalhado:', err);
          throw new Error(`Erro ao criar fatura no BD: ${err.message}`);
        }
        
      } catch (err) {
        localError = err.message || String(err);
        errorDetails = {
          message: err.message,
          stack: err.stack,
          code: err.code,
          meta: err.meta
        };
        console.error('❌ Erro ao gravar fatura local:', err);
      }
      
      if (localError || !faturaLocal?.id) {
        return NextResponse.json({ 
          success: false,
          error: localError || 'A fatura foi criada no TOConline mas falhou a gravação local.',
          details: errorDetails,
          externalSuccess: true,
          data,
          faturaLocalId: null
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        data, 
        localError: null,
        errorDetails: null,
        faturaLocalId: Number(faturaLocal.id)
      });
    } else {
      return NextResponse.json({ error: data?.error || 'Erro ao criar fatura', details: data }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
