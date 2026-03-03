# Fitness Platform

Веб-приложение для управления персональными фитнес-целями с онлайн-консультациями с тренерами и AI-рекомендациями.

## 🎯 Основной функционал

- ✅ Управление фитнес-целями и трекинг прогресса
- ✅ Планирование и логирование тренировок
- ✅ Управление питанием и подсчет калорий
- ✅ Онлайн-консультации с тренерами
- ✅ Real-time чат с тренерами
- ✅ AI-рекомендации (Google Gemini)
- ✅ Система аутентификации с JWT
- ✅ Email-верификация пользователей

## 🛠️ Технологический стек

### Backend
- Node.js 20+ + TypeScript
- Express.js
- Prisma ORM + PostgreSQL 16
- Socket.io для real-time чата
- JWT аутентификация
- Google Gemini AI API

### Frontend
- React 18 + TypeScript
- Vite
- FSD архитектура
- Zustand + TanStack Query
- Tailwind CSS
- Socket.io-client

### DevOps
- Docker + Docker Compose
- Nginx (reverse proxy + rate limiting)
- PostgreSQL 16

## 🚀 Quick Start

### Требования
- Node.js 20+
- Docker Desktop
- macOS / Linux

### Установка

1. **Клонировать репозиторий:**
```bash
git clone <repository-url>
cd web-diplom
```

2. **Запустить setup script:**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Настроить переменные окружения:**
```bash
cp .env.example .env
nano .env
```

Обязательно обновите:
- `DB_PASSWORD` - пароль для PostgreSQL
- `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET` (генерируются автоматически)
- `SMTP_*` - настройки для отправки email
- `GEMINI_API_KEY` - API ключ от Google Gemini (https://ai.google.dev/)

4. **Запустить development окружение:**
```bash
npm run dev:build
```

5. **Выполнить миграции базы данных:**
```bash
npm run migrate
```

6. **Загрузить тестовые данные (опционально):**
```bash
npm run seed
```

### Доступ к приложению

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health
- Prisma Studio (GUI для БД): `npm run db:studio`

## 📜 Доступные команды

### Development
```bash
npm run dev          # Запустить dev окружение
npm run dev:build    # Пересобрать и запустить
npm run dev:down     # Остановить dev окружение
npm run logs         # Посмотреть логи всех сервисов
npm run logs:backend # Логи backend
npm run logs:frontend # Логи frontend
```

### Production
```bash
npm run start       # Запустить production
npm run start:build # Пересобрать и запустить production
npm run stop        # Остановить production
npm run stop:clean  # Остановить и удалить volumes
```

### Database
```bash
npm run migrate        # Создать и применить миграции (dev)
npm run migrate:deploy # Применить миграции (production)
npm run seed           # Загрузить seed данные
npm run db:studio      # Открыть Prisma Studio
```

### Testing
```bash
npm test              # Запустить все тесты
npm run test:backend  # Backend тесты
npm run test:frontend # Frontend тесты
npm run lint          # Проверить код линтером
```

## 🔒 Безопасность

### Реализованные меры защиты

1. **SQL Injection Prevention**
   - Prisma ORM с prepared statements
   - Все запросы параметризованы

2. **XSS Protection**
   - DOMPurify для sanitization
   - Helmet.js security headers
   - Content Security Policy

3. **DDoS Protection**
   - Nginx rate limiting (3 уровня)
   - Express-rate-limit middleware
   - Connection limiting

4. **Authentication**
   - JWT access + refresh tokens
   - Email verification
   - Secure password hashing (bcrypt)

## 📊 Структура проекта

```
web-diplom/
├── backend/          # Express.js API
│   ├── prisma/      # Prisma schema и миграции
│   ├── src/         # Исходный код
│   └── tests/       # Тесты
├── frontend/         # React приложение
│   └── src/         # FSD структура
├── nginx/           # Nginx конфигурация
├── docker-compose.yml
└── setup.sh         # Setup script
```

## 📝 API Documentation

API документация доступна по адресу: `/api/v1/docs` (если настроена Swagger)

### Основные эндпоинты:

- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/goals` - Получить цели
- `POST /api/v1/workouts` - Создать тренировку
- `POST /api/v1/consultations` - Забронировать консультацию
- `POST /api/v1/ai/recommend` - Получить AI рекомендацию

## 🤖 AI Integration

Проект интегрирован с Google Gemini API для персональных рекомендаций:
- Планы тренировок
- Советы по питанию
- Рекомендации по целям

**Получение API ключа:**
1. Перейти на https://ai.google.dev/
2. Создать проект
3. Получить API key
4. Добавить в `.env`: `GEMINI_API_KEY=your_key`

## 📈 Roadmap

- [x] Infrastructure setup
- [x] Authentication system
- [ ] Frontend UI components
- [ ] Backend API endpoints
- [ ] Real-time chat
- [ ] AI recommendations
- [ ] Testing & optimization
- [ ] Production deployment

## 🤝 Contributing

1. Fork репозиторий
2. Создать feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Открыть Pull Request

## 📄 License

MIT License - см. [LICENSE](LICENSE) файл

## 👥 Authors

- Ваше имя

## 🙏 Acknowledgments

- Google Gemini AI
- Prisma
- React Community
- Express.js Team
