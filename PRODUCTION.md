# Production Quick Start Guide

## 🚀 Быстрый запуск production окружения

### 1. Запуск всех сервисов
```powershell
docker-compose up -d
```

### 2. Проверка статуса
```powershell  
docker-compose ps
```

### 3. Применение миграций (только при первом запуске)
```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/syblock?schema=public"
npx prisma migrate deploy
```

### 4. Создание достижений (только при первом запуске)
```powershell
curl.exe -X POST http://localhost:3000/api/seed-achievements
```

## 🔧 Управление

### Просмотр логов
```powershell
docker-compose logs web --tail=50 -f    # Логи веб-приложения
docker-compose logs db --tail=20        # Логи базы данных
docker-compose logs worker --tail=20    # Логи воркера
```

### Перезапуск сервисов
```powershell
docker-compose restart web     # Перезапуск только веб-приложения
docker-compose restart        # Перезапуск всех сервисов
```

### Остановка
```powershell
docker-compose down           # Остановка всех сервисов
docker-compose down -v        # Остановка + удаление volumes (ОСТОРОЖНО!)
```

## 🗄️ База данных

### Доступ к PostgreSQL
- **Host:** localhost
- **Port:** 5433
- **Database:** syblock
- **Username:** postgres  
- **Password:** postgres

### Подключение к базе
```powershell
# Через Docker
docker-compose exec db psql -U postgres -d syblock

# Через локальный клиент
psql -h localhost -p 5433 -U postgres -d syblock
```

## 🏆 Достижения

Система достижений автоматически инициализируется при первом запуске. 
Если нужно пересоздать:

```powershell
curl.exe -X POST http://localhost:3000/api/seed-achievements
```

## 🔍 Мониторинг

### Проверка здоровья приложения
```powershell
curl.exe http://localhost:3000/api/progress?name=test
curl.exe http://localhost:3000/api/leaderboard?category=xp
```

### Проверка Redis
```powershell
docker-compose exec redis redis-cli ping
```

## 🐛 Отладка

### Если контейнер не запускается
```powershell
docker-compose logs [service-name]
docker-compose build --no-cache [service-name]
```

### Сброс базы данных (ОСТОРОЖНО!)
```powershell  
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/syblock?schema=public"
npx prisma migrate reset --force
curl.exe -X POST http://localhost:3000/api/seed-achievements
```

## 📚 Полезные скрипты

Используйте `./prod-manage.ps1` для удобного управления:
```powershell
. ./prod-manage.ps1
Start-Production
Check-DockerStatus
Show-Logs web
```

## ⚠️ Важные замечания

### Worker отключен
Background worker для leaderboard отключен в production, так как:
- Leaderboard API работает напрямую с базой данных
- Результаты кэшируются в Redis на 60 секунд
- Worker не критичен для функционирования приложения
- Упрощает архитектуру и устраняет потенциальные проблемы

Если нужен worker:
1. Исправить путь к скомпилированному файлу в Dockerfile
2. Добавить worker сервис обратно в docker-compose.yml
