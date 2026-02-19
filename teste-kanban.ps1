$orderID = "OR-2026-TVDE0001"

Write-Host "`n========== TESTE COMPLETO DO KANBAN ==========" -ForegroundColor Cyan
Write-Host "Ordem de Trabalho: $orderID`n" -ForegroundColor Yellow

# Estado 1: Em Andamento
Write-Host "1️⃣ Mudando estado para 'Em Andamento'" -ForegroundColor Cyan
$body = @{ id = $orderID; estado = "Em Andamento" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/ordens-trabalho" -Method PATCH -Body $body -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 1
$order = (Invoke-RestMethod -Uri "http://localhost:3000/api/ordens-trabalho")[0]
Write-Host "   Estado: $($order.status)" -ForegroundColor Green
Write-Host "   Data Conclusão: $($order.closeDate)" -ForegroundColor Green

# Estado 2: Aguarda Peças
Write-Host "`n2️⃣ Mudando estado para 'Aguarda Peças'" -ForegroundColor Cyan
$body = @{ id = $orderID; estado = "Aguarda Peças" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/ordens-trabalho" -Method PATCH -Body $body -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 1
$order = (Invoke-RestMethod -Uri "http://localhost:3000/api/ordens-trabalho")[0]
Write-Host "   Estado: $($order.status)" -ForegroundColor Green
Write-Host "   Data Conclusão: $($order.closeDate)" -ForegroundColor Green

# Estado 3: Concluído
Write-Host "`n3️⃣ Mudando estado para 'Concluído'" -ForegroundColor Cyan
$body = @{ id = $orderID; estado = "Concluído" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/ordens-trabalho" -Method PATCH -Body $body -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 1
$order = (Invoke-RestMethod -Uri "http://localhost:3000/api/ordens-trabalho")[0]
Write-Host "   Estado: $($order.status)" -ForegroundColor Green
Write-Host "   Data Conclusão: $($order.closeDate)" -ForegroundColor Green

# Estado 4: Entregue
Write-Host "`n4️⃣ Mudando estado para 'Entregue'" -ForegroundColor Cyan
$body = @{ id = $orderID; estado = "Entregue" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/ordens-trabalho" -Method PATCH -Body $body -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 1
$order = (Invoke-RestMethod -Uri "http://localhost:3000/api/ordens-trabalho")[0]
Write-Host "   Estado: $($order.status)" -ForegroundColor Green
Write-Host "   Data Conclusão: $($order.closeDate)" -ForegroundColor Green

# Estado 5: Voltara Em Andamento (para testar limpeza de data)
Write-Host "`n5️⃣ Voltar a 'Em Andamento' (teste de limpeza de data)" -ForegroundColor Cyan
$body = @{ id = $orderID; estado = "Em Andamento" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/ordens-trabalho" -Method PATCH -Body $body -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 1
$order = (Invoke-RestMethod -Uri "http://localhost:3000/api/ordens-trabalho")[0]
Write-Host "   Estado: $($order.status)" -ForegroundColor Green
Write-Host "   Data Conclusão: $($order.closeDate)" -ForegroundColor Green
if ([string]::IsNullOrWhiteSpace($order.closeDate) -or $order.closeDate -eq "undefined") {
    Write-Host "   ✅ Data foi limpada corretamente!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Data não foi limpada!" -ForegroundColor Yellow
}

Write-Host "`n========== TESTE FINALIZADO ==========" -ForegroundColor Cyan
Write-Host "`nAbra o Kanban em http://localhost:3000/kanban para ver a sincronização" -ForegroundColor Yellow
