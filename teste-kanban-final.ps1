Write-Host "`n🔄 TESTE DE SINCRONIZAÇÃO EM TEMPO REAL" -ForegroundColor Cyan
Write-Host "Mudando ordem OR-2026-TVDE0001 para 'Concluído'...`n" -ForegroundColor Yellow

$body = @{ id = "OR-2026-TVDE0001"; estado = "Concluído" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/ordens-trabalho" -Method PATCH -Body $body -ContentType "application/json"
Write-Host "✅ Resposta: $($response.StatusCode)" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host "`n🔍 Verificando dados do Kanban..." -ForegroundColor Cyan
$orders = Invoke-RestMethod -Uri "http://localhost:3000/api/ordens-trabalho"
$order = $orders[0]

Write-Host "`n📋 Dados Sincronizados:" -ForegroundColor Yellow
Write-Host "  Ordem: $($order.id)" -ForegroundColor White
Write-Host "  Estado: $($order.status)" -ForegroundColor Green
Write-Host "  Veículo: $($order.vehicle)" -ForegroundColor White
Write-Host "  Mecânico: $($order.mechanic)" -ForegroundColor White
Write-Host "  Data Conclusão: $($order.closeDate)" -ForegroundColor White
Write-Host "  Total: €$($order.total)" -ForegroundColor White

Write-Host "`n✅ O Kanban deve mostrar 'OR-2026-TVDE0001' na coluna 'Concluído'" -ForegroundColor Green
Write-Host "   Atualize o navegador (F5) ou confirme na página aberta" -ForegroundColor Yellow
