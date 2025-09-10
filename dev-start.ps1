# Development Environment Setup Script

Write-Host "🚀 Starting SYblock Development Environment..." -ForegroundColor Green

# Stop any running containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Remove orphaned containers
docker container prune -f

# Build and start development environment
Write-Host "🔨 Building and starting development containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up --build

Write-Host "✅ Development environment is ready!" -ForegroundColor Green
Write-Host "📱 App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️ Database: localhost:5433" -ForegroundColor Cyan
Write-Host "🔴 Redis: localhost:6379" -ForegroundColor Cyan
