# Production Management Scripts
# Управление production окружением SYblock

Write-Host "🐳 PRODUCTION DOCKER MANAGEMENT" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to check Docker status
function Check-DockerStatus {
    Write-Host "📊 Проверка статуса контейнеров..." -ForegroundColor Yellow
    docker-compose ps
}

# Function to start production
function Start-Production {
    Write-Host "🚀 Запуск production окружения..." -ForegroundColor Green
    docker-compose up -d
    Write-Host "⏳ Ожидание запуска сервисов..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Check-DockerStatus
}

# Function to stop production
function Stop-Production {
    Write-Host "🛑 Остановка production окружения..." -ForegroundColor Red
    docker-compose down
}

# Function to restart production
function Restart-Production {
    Write-Host "🔄 Перезапуск production окружения..." -ForegroundColor Blue
    docker-compose restart
}

# Function to view logs
function Show-Logs {
    param([string]$Service = "web")
    Write-Host "📋 Просмотр логов сервиса: $Service" -ForegroundColor Magenta
    docker-compose logs $Service --tail=50 -f
}

# Function to run database migrations
function Run-Migrations {
    Write-Host "🗄️ Применение миграций базы данных..." -ForegroundColor Cyan
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/syblock?schema=public"
    npx prisma migrate deploy
}

# Function to seed achievements
function Seed-Achievements {
    Write-Host "🏆 Создание достижений в базе данных..." -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/syblock?schema=public"
    curl.exe -X POST http://localhost:3000/api/seed-achievements
}

# Function to rebuild and restart
function Rebuild-Production {
    Write-Host "🔨 Пересборка и перезапуск production..." -ForegroundColor Green
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Start-Sleep -Seconds 15
    Check-DockerStatus
}

# Main menu
Write-Host "Доступные команды:" -ForegroundColor White
Write-Host "1. Start-Production      - Запустить production" -ForegroundColor Green
Write-Host "2. Stop-Production       - Остановить production" -ForegroundColor Red  
Write-Host "3. Restart-Production    - Перезапустить production" -ForegroundColor Blue
Write-Host "4. Check-DockerStatus    - Проверить статус" -ForegroundColor Yellow
Write-Host "5. Show-Logs [service]   - Показать логи (web, db, redis, worker)" -ForegroundColor Magenta
Write-Host "6. Run-Migrations        - Применить миграции" -ForegroundColor Cyan
Write-Host "7. Seed-Achievements     - Создать достижения" -ForegroundColor Yellow
Write-Host "8. Rebuild-Production    - Пересобрать все" -ForegroundColor Green

Write-Host "`n💡 Пример использования:" -ForegroundColor White
Write-Host "   Start-Production" -ForegroundColor Gray
Write-Host "   Show-Logs web" -ForegroundColor Gray
Write-Host "   Check-DockerStatus" -ForegroundColor Gray
