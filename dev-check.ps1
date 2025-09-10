# Development Status Script

Write-Host "📊 SYblock Development Status" -ForegroundColor Green
Write-Host ""

# Check container status
Write-Host "🐳 Container Status:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps

Write-Host ""
Write-Host "🌐 Service URLs:" -ForegroundColor Yellow
Write-Host "Web App:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Database: localhost:5433" -ForegroundColor Cyan
Write-Host "Redis:    localhost:6379" -ForegroundColor Cyan

Write-Host ""
Write-Host "💻 Quick Commands:" -ForegroundColor Yellow
Write-Host "View logs:    .\dev-logs.ps1" -ForegroundColor Gray
Write-Host "Stop all:     .\dev-stop.ps1" -ForegroundColor Gray
Write-Host "Restart:      .\dev-start.ps1" -ForegroundColor Gray
