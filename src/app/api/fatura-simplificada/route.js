
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://api7.toconline.pt';
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'pt999999990_c101423-6604ef0f5744561b';
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '8f753cea78d995b5b6c877933495bf2b';
const OAUTH_URL = process.env.NEXT_PUBLIC_OAUTH_URL || 'https://app7.toconline.pt/oauth';
const REDIRECT_URI = 'https://oauth.pstmn.io/v1/callback';
const SCOPE = 'commercial';

async function getOAuthToken(code) {
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  console.log('🔐 Tentando obter token com:');
  console.log('   CLIENT_ID:', CLIENT_ID);
  console.log('   REDIRECT_URI:', REDIRECT_URI);
  console.log('   Code length:', code?.length || 0);
  console.log('   Auth header:', `Basic ${basicAuth.substring(0, 20)}...`);
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code.trim(),
    redirect_uri: REDIRECT_URI,
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
    const { payload, authCode, accessToken, percentual_imposto, subtotal, valor_desconto, ordem_trabalho_id } = await req.json();
    
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
      token = await getOAuthToken(authCode);
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
        let cliente = await prisma.clientes.findFirst({
          where: { nif: nifCliente }
        });
        
        if (!cliente) {
          console.log('👤 Cliente não encontrado, criando novo...');
          // Criar cliente se não existir
          try {
            cliente = await prisma.clientes.create({
              data: {
                nome: nomeCliente,
                nif: nifCliente,
                endereco: faturaOnline.customer_address_detail || '',
                telefone: '',
                email: '',
                perfil: 'Normal'
              }
            });
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
              cliente = await prisma.clientes.update({
                where: { id: cliente.id },
                data: {
                  nome: nomeCliente,
                  endereco: faturaOnline.customer_address_detail || cliente.endereco
                }
              });
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
          const faturaExistente = await prisma.faturas.findFirst({
            where: { ordem_trabalho_id: ordemTrabalhoIdParsed },
            select: { id: true, numero_fatura: true }
          });

          if (faturaExistente) {
            throw new Error(`A ordem de trabalho já está faturada (fatura ${faturaExistente.numero_fatura}).`);
          }

          const ordemTrabalho = await prisma.ordens_trabalho.findUnique({
            where: { id: BigInt(ordemTrabalhoIdParsed) },
            select: { id: true, ref_ordem_trabalho: true, fatura_id: true }
          });

          if (!ordemTrabalho) {
            throw new Error('Ordem de trabalho não encontrada.');
          }

          if (ordemTrabalho.fatura_id) {
            const faturaPorVinculo = await prisma.faturas.findUnique({
              where: { id: ordemTrabalho.fatura_id },
              select: { id: true, numero_fatura: true }
            });

            if (faturaPorVinculo) {
              throw new Error(`A ordem ${ordemTrabalho.ref_ordem_trabalho} já está associada à fatura ${faturaPorVinculo.numero_fatura}.`);
            }

            await prisma.ordens_trabalho.update({
              where: { id: BigInt(ordemTrabalhoIdParsed) },
              data: { fatura_id: null }
            });
            console.warn('⚠️ Vínculo órfão limpo em ordens_trabalho.fatura_id:', ordemTrabalhoIdParsed);
          }
        }

        const dataParaGravar = {
          numero_fatura: numeroFaturaToconline,
          cliente_id: cliente.id,
          ordem_trabalho_id: ordemTrabalhoIdParsed,
          data_emissao: new Date(faturaOnline.date),
          data_vencimento: new Date(faturaOnline.due_date),
          subtotal: valorSubtotal,
          valor_imposto: valorImpostoRounded,
          valor_desconto: valorDesconto,
          valor_total: valorTotalCalculado,
          estado: 'pendente', // Sempre pendente inicialmente
          notas: faturaOnline.notes || ''
          // Nota: toconline_id e toconline_customer_id serão gravados após criação com update se necessário
        };

        console.log('📝 Dados para gravar:', {
          numero_fatura: dataParaGravar.numero_fatura,
          cliente_id: dataParaGravar.cliente_id,
          ordem_trabalho_id: dataParaGravar.ordem_trabalho_id?.toString(),
          data_emissao: dataParaGravar.data_emissao,
          data_vencimento: dataParaGravar.data_vencimento,
          subtotal: dataParaGravar.subtotal,
          valor_imposto: dataParaGravar.valor_imposto,
          valor_desconto: dataParaGravar.valor_desconto,
          valor_total: dataParaGravar.valor_total
        });

        try {
          faturaLocal = await prisma.faturas.create({
            data: dataParaGravar
          });
          console.log('✅ Fatura local gravada com ID:', Number(faturaLocal.id));
          
          // Atualizar com toconline_id e toconline_customer_id
          if (faturaOnline.id) {
            console.log('📝 Atualizando toconline_id:', faturaOnline.id);
            faturaLocal = await prisma.faturas.update({
              where: { id: faturaLocal.id },
              data: {
                toconline_id: String(faturaOnline.id),
                toconline_customer_id: faturaOnline.customer_id ? String(faturaOnline.customer_id) : null
              }
            });
            console.log('✅ toconline_id atualizado');
          }

          if (ordemTrabalhoIdParsed) {
            await prisma.ordens_trabalho.update({
              where: { id: BigInt(ordemTrabalhoIdParsed) },
              data: { fatura_id: faturaLocal.id }
            });
            console.log('✅ Ordem de trabalho associada à fatura:', ordemTrabalhoIdParsed);
          }
        } catch (prismaErr) {
          console.error('❌ Erro Prisma detalhado:', {
            message: prismaErr.message,
            code: prismaErr.code,
            meta: prismaErr.meta,
            stack: prismaErr.stack
          });
          throw new Error(`Erro ao criar fatura no BD: ${prismaErr.message} (${prismaErr.code})`);
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
      
      return NextResponse.json({ 
        success: true, 
        data, 
        localError,
        errorDetails,
        faturaLocalId: faturaLocal?.id ? Number(faturaLocal.id) : null
      });
    } else {
      return NextResponse.json({ error: data?.error || 'Erro ao criar fatura', details: data }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
