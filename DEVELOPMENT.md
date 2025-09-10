# SYblock Development Guide

## 🚀 Quick Start для разработки

### Запуск development окружения с hot reload

```powershell
# Запуск development окружения
.\dev-start.ps1

# Или вручную
docker-compose -f docker-compose.dev.yml up --build
```

### Остановка development окружения

```powershell
# Остановка development окружения
.\dev-stop.ps1

# Или вручную
docker-compose -f docker-compose.dev.yml down
```

## ✨ Особенности development режима

- **Hot Reload**: Изменения в коде автоматически отражаются в браузере
- **Volume Mounting**: Ваш код монтируется в контейнер
- **Fast Refresh**: Next.js автоматически перезагружает компоненты
- **Database Persistence**: PostgreSQL данные сохраняются между перезапусками

## 🔧 Доступные сервисы

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6379

## 📝 Development workflow

1. Внесите изменения в код
2. Сохраните файл (Ctrl+S)
3. Изменения автоматически отразятся в браузере
4. Никаких перезапусков контейнеров не требуется!

## 🐛 Troubleshooting

### Если hot reload не работает:
```powershell
# Перезапустите контейнеры
docker-compose -f docker-compose.dev.yml restart web
```

### Если нужно очистить кэш:
```powershell
# Остановите и удалите все
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f

# Запустите заново
.\dev-start.ps1
```

### Проблемы с базой данных:
```powershell
# Зайдите в контейнер с базой
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d syblock
```

## 📦 Production build

Для production используйте стандартный docker-compose.yml:

```powershell
docker-compose up --build
```
