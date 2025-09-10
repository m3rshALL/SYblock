# Development Logs Script

Write-Host "📋 SYblock Development Logs" -ForegroundColor Green

$services = @("web", "db", "redis")

foreach ($service in $services) {
    Write-Host "" 
    Write-Host "🔍 Logs for $service:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    docker-compose -f docker-compose.dev.yml logs --tail=20 $service
    Write-Host "----------------------------------------" -ForegroundColor Gray
}

Write-Host ""
Write-Host "💡 Tip: To follow live logs for a specific service:" -ForegroundColor Cyan
Write-Host "docker-compose -f docker-compose.dev.yml logs -f web" -ForegroundColor Gray
