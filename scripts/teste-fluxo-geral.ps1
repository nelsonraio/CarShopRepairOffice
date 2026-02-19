$ErrorActionPreference = 'Stop'

$baseUrl = 'http://localhost:3000'
$now = Get-Date
$runTag = $now.ToString('yyMMddHHmmss')

function New-TestMatricula {
  $letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.ToCharArray()
  $digits = '0123456789'.ToCharArray()

  $seg1 = -join (1..2 | ForEach-Object { $letters[(Get-Random -Maximum $letters.Length)] })
  $seg2 = -join (1..2 | ForEach-Object { $digits[(Get-Random -Maximum $digits.Length)] })
  $seg3 = -join (1..2 | ForEach-Object { $digits[(Get-Random -Maximum $digits.Length)] })

  return "$seg1-$seg2-$seg3"
}

Write-Host 'Carregar clientes...'
$clientes = Invoke-RestMethod -Uri "$baseUrl/api/clientes" -Method Get
$clientesDistinct = $clientes | Group-Object perfil | Where-Object { $_.Name } | Select-Object -First 4

if ($clientesDistinct.Count -lt 4) {
  Write-Host 'Criar 4 clientes de teste com perfis distintos...'
  $perfis = @('Normal', 'TVDE Interno', 'TVDE Externo', 'Empresa')
  $clientesCriados = @()
  for ($i = 0; $i -lt $perfis.Count; $i++) {
    $perfil = $perfis[$i]
    $clienteBody = @{
      nome = "Cliente Teste $($perfil.Replace(' ', ''))"
      email = "cliente.teste.$($i + 1)@example.com"
      telefone = "9100000$($i + 1)"
      nif = "99900000$($i + 1)"
      endereco = "Rua Teste $($i + 1)"
      perfil = $perfil
    } | ConvertTo-Json

    $cliente = Invoke-RestMethod -Uri "$baseUrl/api/clientes" -Method Post -ContentType 'application/json' -Body $clienteBody
    $clientesCriados += $cliente
  }

  $selectedClientes = $clientesCriados
} else {
  $selectedClientes = @()
  foreach ($group in $clientesDistinct) {
    $selectedClientes += $group.Group | Select-Object -First 1
  }
}

Write-Host 'Carregar pecas...'
$pecas = Invoke-RestMethod -Uri "$baseUrl/api/pecas" -Method Get
$pecasComFornecedor = $pecas | Where-Object { $_.fornecedor_id }
if ($pecasComFornecedor.Count -lt 2) {
  throw 'Nao ha pecas suficientes com fornecedor associado'
}
$grupoFornecedor = $pecasComFornecedor | Group-Object fornecedor_id | Where-Object { $_.Count -ge 2 } | Select-Object -First 1
if ($grupoFornecedor) {
  $pecasSelecionadas = $grupoFornecedor.Group | Select-Object -First 2
} else {
  $pecasSelecionadas = $pecasComFornecedor | Select-Object -First 2
}

Write-Host 'Carregar servicos...'
$servicos = Invoke-RestMethod -Uri "$baseUrl/api/servicos" -Method Get
$servico = $servicos | Select-Object -First 1
if (-not $servico) {
  throw 'Nao ha servicos disponiveis'
}

Write-Host 'Criar veiculos e agendamentos...'
$veiculos = @()
$agendamentos = @()
for ($i = 0; $i -lt 4; $i++) {
  $cliente = $selectedClientes[$i]
  $plate = New-TestMatricula

  $vehicleBody = @{
    clientId = $cliente.id
    clientName = $cliente.nome
    make = 'MarcaTest'
    model = "Modelo$($i + 1)"
    licensePlate = $plate
    year = 2018 + $i
  } | ConvertTo-Json

  $veiculo = Invoke-RestMethod -Uri "$baseUrl/api/veiculos" -Method Post -ContentType 'application/json' -Body $vehicleBody
  $veiculos += $veiculo

  $data = $now.AddDays($i + 1).ToString('yyyy-MM-dd')
  $hora = "09:0$($i)"

  $agendamentoBody = @{
    cliente = $cliente.nome
    marca = 'MarcaTest'
    modelo = "Modelo$($i + 1)"
    ano = (2018 + $i).ToString()
    matricula = $plate
    data = $data
    hora = $hora
    tipoServico = 'Revisao'
    mecanico = "Mec $($i + 1)"
    descricao = 'Teste fluxo geral'
  } | ConvertTo-Json

  $agendamento = Invoke-RestMethod -Uri "$baseUrl/api/agendamentos" -Method Post -ContentType 'application/json' -Body $agendamentoBody
  $agendamentos += $agendamento
}

Write-Host 'Criar orcamentos...'
$orcamentos = @()
for ($i = 0; $i -lt 4; $i++) {
  $cliente = $selectedClientes[$i]
  $veiculo = $veiculos[$i]
  $ref = "ORC-$($runTag)-$($i + 1)"

  $peca1 = $pecasSelecionadas[0]
  $peca2 = $pecasSelecionadas[1]

  $peca1Total = [double]$peca1.preco_venda * 2
  $peca2Total = [double]$peca2.preco_venda * 1
  $maoObra = if ($servico.preco_base) { [double]$servico.preco_base } else { 50 }

  $totalPecas = $peca1Total + $peca2Total
  $totalGeral = $totalPecas + $maoObra

  $items = @(
    @{ type = 'part'; id = $peca1.id; name = $peca1.nome; quantity = 2; unitPrice = $peca1.preco_venda; total = $peca1Total },
    @{ type = 'part'; id = $peca2.id; name = $peca2.nome; quantity = 1; unitPrice = $peca2.preco_venda; total = $peca2Total },
    @{ type = 'service'; id = $servico.id; name = $servico.nome; quantity = 1; unitPrice = $maoObra; total = $maoObra }
  )

  $orcamentoBody = @{
    ref_orcamento = $ref
    cliente_id = $cliente.id
    veiculo_id = $veiculo.id
    data_emissao = $now.ToString('yyyy-MM-dd')
    estado = 'pendente'
    kms = 100000 + ($i * 1000)
    contacto_nome = $cliente.nome
    contacto_telefone = $cliente.telefone
    contacto_email = $cliente.email
    total_pecas = $totalPecas
    total_mao_obra = $maoObra
    total_desconto = 0
    total_imposto = 0
    total_geral = $totalGeral
    notas = 'Fluxo geral teste'
    items = $items
  } | ConvertTo-Json -Depth 6

  $orcamento = Invoke-RestMethod -Uri "$baseUrl/api/orcamentos" -Method Post -ContentType 'application/json' -Body $orcamentoBody
  $orcamentos += [pscustomobject]@{
    orcamento = $orcamento
    ref = $ref
    total = $totalGeral
    clienteId = $cliente.id
  }
}

Write-Host 'Aprovar orcamentos e marcar pecas em falta...'
$ordensTrabalho = @()
foreach ($o in $orcamentos) {
  Invoke-RestMethod -Uri "$baseUrl/api/orcamentos?id=$($o.orcamento.orcamento.id)" -Method Put -ContentType 'application/json' -Body (@{ estado = 'Aprovado' } | ConvertTo-Json) | Out-Null

  $refOT = $o.ref -replace '^ORC-', 'OT-'
  $ordem = Invoke-RestMethod -Uri "$baseUrl/api/ordens-trabalho?id=$refOT" -Method Get

  $pecasOrdem = $ordem.itens_ordem_trabalho | Where-Object { $_.tipo_item -eq 'peca' } | Select-Object -First 2
  $idsPecas = $pecasOrdem | ForEach-Object { $_.id }

  Invoke-RestMethod -Uri "$baseUrl/api/ordens-trabalho" -Method Patch -ContentType 'application/json' -Body (@{ id = $refOT; estado = 'Aguarda Peças'; selectedPartIds = $idsPecas } | ConvertTo-Json) | Out-Null

  $ordensTrabalho += [pscustomobject]@{ ref = $refOT; id = $ordem.id }
}

Write-Host 'Criar encomendas de pecas...'
$partsToOrder = $pecasSelecionadas
$encomendas = @()
$partsToOrder | Group-Object fornecedor_id | ForEach-Object {
  $fid = $_.Name
  $items = @()
  foreach ($p in $_.Group) {
    $items += @{ peca_id = $p.id; quantidade_encomendada = 2; preco_unitario = $p.preco_venda }
  }

  $encomendaBody = @{
    fornecedor_id = $fid
    data_entrega_estimada = $now.AddDays(3).ToString('yyyy-MM-dd')
    itens = $items
  } | ConvertTo-Json -Depth 5

  $enc = Invoke-RestMethod -Uri "$baseUrl/api/encomendas" -Method Post -ContentType 'application/json' -Body $encomendaBody
  $encomendas += $enc
}

Write-Host 'Atualizar stock das pecas recebidas...'
foreach ($p in $partsToOrder) {
  $novoStock = [int]$p.quantidade_stock + 2
  $updateBody = @{
    id = $p.id
    nome = $p.nome
    referencia = $p.referencia
    categoria = $p.categoria
    stock = $novoStock
    minStock = $p.nivel_stock_minimo
    price = $p.preco_venda
    fornecedor_id = $p.fornecedor_id
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "$baseUrl/api/pecas" -Method Put -ContentType 'application/json' -Body $updateBody | Out-Null
}

Write-Host 'Atualizar estados das ordens de trabalho...'
foreach ($ordem in $ordensTrabalho) {
  Invoke-RestMethod -Uri "$baseUrl/api/ordens-trabalho" -Method Patch -ContentType 'application/json' -Body (@{ id = $ordem.ref; estado = 'Em Andamento' } | ConvertTo-Json) | Out-Null
  Invoke-RestMethod -Uri "$baseUrl/api/ordens-trabalho" -Method Patch -ContentType 'application/json' -Body (@{ id = $ordem.ref; estado = 'Concluído' } | ConvertTo-Json) | Out-Null
}

Write-Host 'Criar faturas e marcar como pagas...'
$faturas = @()
foreach ($o in $orcamentos) {
  $refOT = $o.ref -replace '^ORC-', 'OT-'
  $ordem = Invoke-RestMethod -Uri "$baseUrl/api/ordens-trabalho?id=$refOT" -Method Get

  $faturaBody = @{
    cliente_id = [int]$o.clienteId
    ordem_trabalho_id = [int]$ordem.id
    data_emissao = $now.ToString('yyyy-MM-dd')
    data_vencimento = $now.AddDays(30).ToString('yyyy-MM-dd')
    subtotal = $o.total
    valor_imposto = 0
    valor_desconto = 0
    valor_total = $o.total
    notas = 'Fatura teste fluxo geral'
  } | ConvertTo-Json

  $fatura = Invoke-RestMethod -Uri "$baseUrl/api/faturas" -Method Post -ContentType 'application/json' -Body $faturaBody
  $faturas += $fatura

  Invoke-RestMethod -Uri "$baseUrl/api/faturas/$($fatura.data.id)" -Method Patch -ContentType 'application/json' -Body (@{ marcar_paga = $true; valor_pago = $o.total } | ConvertTo-Json) | Out-Null
}

Write-Host 'Fluxo completo.'
Write-Host ("Agendamentos: {0} | Veiculos: {1} | Orcamentos: {2} | Ordens: {3} | Encomendas: {4} | Faturas: {5}" -f $agendamentos.Count, $veiculos.Count, $orcamentos.Count, $ordensTrabalho.Count, $encomendas.Count, $faturas.Count)
