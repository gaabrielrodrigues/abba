# Restart both servers

Write-Host "🔄 Parando servidores..." -ForegroundColor Yellow

# Kill processes on ports 3001 and 5173
$processes = Get-NetTCPConnection -LocalPort 3001,5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($proc in $processes) {
    Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Servidores parados" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host "🚀 Iniciando backend (porta 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

Start-Sleep -Seconds 3

Write-Host "🚀 Iniciando frontend (porta 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "✨ Servidores iniciados!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 Backend: http://localhost:3001" -ForegroundColor Cyan
