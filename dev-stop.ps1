# Development Environment Stop Script

Write-Host "🛑 Stopping SYblock Development Environment..." -ForegroundColor Red

# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Clean up
docker container prune -f

Write-Host "✅ Development environment stopped!" -ForegroundColor Green
