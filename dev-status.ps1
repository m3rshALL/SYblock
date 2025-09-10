# Development Status Check Script

Write-Host "🔍 Checking SYblock Development Environment Status..." -ForegroundColor Green

# Check if containers are running
Write-Host "`n📦 Container Status:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps

# Check logs if containers are running
$containers = docker-compose -f docker-compose.dev.yml ps -q
if ($containers) {
    Write-Host "`n📋 Recent Logs:" -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml logs --tail=10
    
    Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host "Web App: http://localhost:3000" -ForegroundColor White
    Write-Host "Database: localhost:5433" -ForegroundColor White
    Write-Host "Redis: localhost:6379" -ForegroundColor White
} else {
    Write-Host "`n❌ No containers running. Use .\dev-start.ps1 to start." -ForegroundColor Red
}
