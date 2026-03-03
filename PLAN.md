# План Реализации: Фитнес-Платформа с AI и Онлайн-Консультациями

## 📋 Контекст

Создание полнофункционального веб-приложения для управления персональными фитнес-целями с интегрированной системой онлайн-консультаций с тренерами и AI-рекомендациями. Проект должен соответствовать высоким стандартам безопасности и включать защиту от распространенных атак (DDoS, SQL-инъекции, XSS).

**Проблема:** Пользователю нужно комплексное решение для трекинга фитнес-целей, общения с тренерами и получения персональных рекомендаций, реализованное с использованием современного стека технологий и best practices.

**Ожидаемый результат:** Готовое к production приложение с полным функционалом, развертываемое одной командой на macOS через Docker Compose.

---

## 🎯 Технологический Стек

### Backend
- **Runtime:** Node.js 20+ с TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 16 (3 нормальные формы)
- **ORM:** Prisma (type-safe queries + автогенерация миграций)
- **Authentication:** JWT (access + refresh tokens)
- **Real-time:** Socket.io для чата
- **Validation:** Zod для типобезопасной валидации
- **Security:** helmet, express-rate-limit, bcryptjs, DOMPurify
- **Email:** Nodemailer с SMTP
- **AI:** Google Gemini API (бесплатный tier)
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18 с TypeScript
- **Architecture:** FSD (Feature-Sliced Design)
- **Routing:** React Router v6
- **State Management:** Zustand
- **Server State:** TanStack Query (React Query)
- **HTTP Client:** Axios с interceptors
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod
- **Real-time:** Socket.io-client
- **Testing:** Vitest + React Testing Library

### DevOps
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx (с rate limiting и SSL)
- **CI/CD:** GitHub Actions (опционально)

---

## 🗄️ Архитектура Базы Данных (3NF)

### Prisma Schema

Вся структура БД определяется в декларативном файле `prisma/schema.prisma`. Prisma автоматически создаст PostgreSQL таблицы, индексы, foreign keys и triggers.

**Пример schema.prisma (полная версия будет ~500 строк):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                        Int       @id @default(autoincrement())
  email                     String    @unique
  passwordHash              String    @map("password_hash")
  firstName                 String    @map("first_name")
  lastName                  String    @map("last_name")
  dateOfBirth               DateTime? @map("date_of_birth") @db.Date
  gender                    Gender?
  height                    Decimal?  @db.Decimal(5, 2)
  weight                    Decimal?  @db.Decimal(5, 2)
  phone                     String?
  avatarUrl                 String?   @map("avatar_url")
  emailVerified             Boolean   @default(false) @map("email_verified")
  emailVerificationToken    String?   @map("email_verification_token")
  emailVerificationExpires  DateTime? @map("email_verification_expires")
  refreshToken              String?   @map("refresh_token")
  isActive                  Boolean   @default(true) @map("is_active")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  // Relations
  trainer               Trainer?
  fitnessGoals         FitnessGoal[]
  workouts             Workout[]
  nutritionPlans       NutritionPlan[]
  meals                Meal[]
  consultationsAsUser  Consultation[]      @relation("UserConsultations")
  sentMessages         Message[]           @relation("SentMessages")
  receivedMessages     Message[]           @relation("ReceivedMessages")
  aiRecommendations    AIRecommendation[]
  customExercises      Exercise[]

  @@index([email])
  @@index([emailVerified])
  @@map("users")
}

enum Gender {
  male
  female
  other
  prefer_not_to_say
}

model Trainer {
  id               Int       @id @default(autoincrement())
  userId           Int       @unique @map("user_id")
  specialization   String[]
  bio              String?
  experienceYears  Int?      @map("experience_years")
  certifications   String[]
  hourlyRate       Decimal?  @map("hourly_rate") @db.Decimal(10, 2)
  rating           Decimal   @default(0) @db.Decimal(3, 2)
  totalReviews     Int       @default(0) @map("total_reviews")
  availability     Json?
  isVerified       Boolean   @default(false) @map("is_verified")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Relations
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  consultations Consultation[]

  @@index([userId])
  @@index([rating(sort: Desc)])
  @@map("trainers")
}

model FitnessGoal {
  id                  Int       @id @default(autoincrement())
  userId              Int       @map("user_id")
  goalType            GoalType  @map("goal_type")
  title               String
  description         String?
  targetValue         Decimal?  @map("target_value") @db.Decimal(10, 2)
  currentValue        Decimal?  @map("current_value") @db.Decimal(10, 2)
  unit                String?
  startDate           DateTime  @map("start_date") @db.Date
  targetDate          DateTime  @map("target_date") @db.Date
  status              GoalStatus @default(active)
  progressPercentage  Decimal   @default(0) @map("progress_percentage") @db.Decimal(5, 2)
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // Relations
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  workouts       Workout[]
  nutritionPlans NutritionPlan[]

  @@index([userId])
  @@index([status])
  @@index([targetDate])
  @@index([userId, status])
  @@map("fitness_goals")
}

enum GoalType {
  weight_loss
  muscle_gain
  endurance
  flexibility
  general_fitness
}

enum GoalStatus {
  active
  completed
  paused
  abandoned
}

// ... (остальные models: Exercise, Workout, WorkoutExercise, NutritionPlan, Meal, Consultation, Message, AIRecommendation)
```

### Основные Таблицы (будут созданы Prisma)

1. **users** - Пользователи системы
   - Поля: id, email, password_hash, first_name, last_name, date_of_birth, gender, height, weight, phone, avatar_url, email_verified, email_verification_token, refresh_token, is_active
   - Индексы: email, email_verified, created_at

2. **trainers** - Профили тренеров
   - Связь: ONE-TO-ONE с users
   - Поля: id, user_id, specialization[], bio, experience_years, certifications[], hourly_rate, rating, total_reviews, availability (JSONB), is_verified
   - Индексы: user_id, specialization (GIN), rating

3. **fitness_goals** - Фитнес-цели пользователей
   - Связь: MANY-TO-ONE с users
   - Поля: id, user_id, goal_type, title, description, target_value, current_value, unit, start_date, target_date, status, progress_percentage
   - Индексы: user_id, status, target_date, (user_id, status)

4. **exercises** - Библиотека упражнений
   - Поля: id, name, description, category, muscle_groups[], equipment[], difficulty, instructions, video_url, image_url, is_custom, created_by
   - Индексы: category, muscle_groups (GIN), difficulty, created_by

5. **workouts** - Тренировки пользователей
   - Связь: MANY-TO-ONE с users, optional MANY-TO-ONE с fitness_goals
   - Поля: id, user_id, goal_id, title, description, workout_type, scheduled_date, duration_minutes, calories_burned, intensity, status, notes, completed_at
   - Индексы: user_id, goal_id, scheduled_date, status, (user_id, scheduled_date)

6. **workout_exercises** - Упражнения в тренировках (связующая таблица)
   - Связь: MANY-TO-ONE с workouts и exercises
   - Поля: id, workout_id, exercise_id, sets, reps, weight, duration_seconds, distance_meters, notes, order_index
   - Индексы: workout_id, exercise_id

7. **nutrition_plans** - Планы питания
   - Связь: MANY-TO-ONE с users, optional MANY-TO-ONE с fitness_goals
   - Поля: id, user_id, goal_id, title, description, daily_calories_target, protein_grams_target, carbs_grams_target, fats_grams_target, start_date, end_date, is_active
   - Индексы: user_id, goal_id, is_active

8. **meals** - Приемы пищи
   - Связь: MANY-TO-ONE с nutrition_plans и users
   - Поля: id, nutrition_plan_id, user_id, meal_type, date, title, description, calories, protein_grams, carbs_grams, fats_grams, notes
   - Индексы: nutrition_plan_id, user_id, date, (user_id, date)

9. **consultations** - Консультации с тренерами
   - Связь: MANY-TO-ONE с users и trainers
   - Поля: id, user_id, trainer_id, session_type, title, description, scheduled_date, duration_minutes, status, meeting_link, price, payment_status, notes, completed_at
   - Индексы: user_id, trainer_id, scheduled_date, status, (user_id, trainer_id)

10. **messages** - Сообщения в чатах
    - Связь: MANY-TO-ONE с users (sender/receiver), optional MANY-TO-ONE с consultations
    - Поля: id, consultation_id, sender_id, receiver_id, content, message_type, file_url, is_read, read_at
    - Индексы: consultation_id, sender_id, receiver_id, created_at, (sender_id, receiver_id), (receiver_id, is_read) WHERE is_read = FALSE

11. **ai_recommendations** - AI рекомендации
    - Связь: MANY-TO-ONE с users
    - Поля: id, user_id, recommendation_type, context (JSONB), prompt, recommendation_text, ai_model, metadata (JSONB), is_applied, user_feedback
    - Индексы: user_id, recommendation_type, created_at

### Нормализация (3NF)
- ✅ 1NF: Все поля атомарны, нет повторяющихся групп
- ✅ 2NF: Нет частичных зависимостей от составных ключей
- ✅ 3NF: Нет транзитивных зависимостей

---

## 🏗️ Структура Проекта

### Backend Structure
```
backend/
├── prisma/
│   ├── schema.prisma     # Prisma schema (определение БД)
│   ├── migrations/       # Автогенерированные миграции
│   └── seed.ts          # Seed данные
├── src/
│   ├── config/           # Конфигурация (database, jwt, env, ai, email)
│   ├── repositories/     # Data access layer (Prisma Client)
│   ├── services/         # Business logic
│   │   ├── auth/        # AuthService, TokenService, EmailVerificationService
│   │   ├── user/        # UserService
│   │   ├── fitness/     # GoalService, WorkoutService, ExerciseService
│   │   ├── nutrition/   # NutritionService
│   │   ├── consultation/# ConsultationService
│   │   ├── chat/        # ChatService
│   │   └── ai/          # AIService (Gemini integration)
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # auth, validation, rateLimiter, sanitize, errorHandler
│   ├── validators/      # Zod schemas для валидации
│   ├── socket/          # Socket.io handlers
│   ├── utils/           # Helpers
│   ├── app.ts          # Express app setup
│   └── server.ts       # Entry point
├── tests/
│   ├── unit/           # Unit tests (services, utils)
│   └── integration/    # Integration tests (API endpoints)
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Frontend Structure (FSD)
```
frontend/src/
├── app/                 # Инициализация приложения
│   ├── providers/      # AuthProvider, QueryProvider, RouterProvider
│   ├── styles/         # Глобальные стили
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx      # Routing configuration
├── pages/              # Страницы приложения
│   ├── auth/          # login, register, verify-email
│   ├── dashboard/     # Главная страница
│   ├── fitness-goals/ # Список и детали целей
│   ├── workouts/      # Тренировки
│   ├── nutrition/     # Питание
│   ├── consultations/ # Консультации и чат
│   ├── trainers/      # Список тренеров
│   └── profile/       # Профиль пользователя
├── widgets/            # Сложные композитные компоненты
│   ├── header/
│   ├── sidebar/
│   ├── goals-dashboard/
│   ├── workout-tracker/
│   ├── chat-widget/
│   └── ai-recommendations/
├── features/           # Бизнес-фичи
│   ├── auth/          # LoginForm, RegisterForm, api, authStore
│   ├── goals/         # Goal CRUD forms, api
│   ├── workouts/      # Workout forms, api
│   ├── nutrition/     # Meal tracking, api
│   ├── consultations/ # Booking, calendar, api
│   ├── chat/          # Message components, chatStore
│   └── ai-assistant/  # AI recommendations UI
├── entities/           # Бизнес-сущности
│   ├── user/
│   ├── trainer/
│   ├── goal/
│   ├── workout/
│   └── message/
└── shared/             # Переиспользуемый код
    ├── ui/            # UI компоненты (Button, Input, Card, Modal)
    ├── lib/           # Библиотеки (axios, socket, validation, sanitize)
    ├── api/           # Base API setup
    ├── config/        # Константы, env
    └── hooks/         # Хуки (useAuth, useWebSocket, useDebounce)
```

---

## 🔒 Security Implementation

### 1. SQL Injection Protection
- **Метод:** Prisma автоматически параметризует все запросы (prepared statements)
- **Правило:** ВСЕГДА использовать Prisma Client API, избегать `$queryRaw` с интерполяцией
- **Пример:**
  ```typescript
  // ✅ БЕЗОПАСНО - Prisma Client
  await prisma.user.findUnique({
    where: { email: userEmail }
  });

  // ✅ БЕЗОПАСНО - $queryRaw с параметрами
  await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userEmail}`;

  // ❌ ОПАСНО - строковая интерполяция
  await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${userEmail}'`);
  ```

### 2. XSS Attack Protection
- **Frontend:**
  - DOMPurify для sanitization HTML контента
  - Escaping всех пользовательских данных перед рендером
  - React автоматически экранирует JSX выражения
- **Backend:**
  - Sanitization middleware для всех input данных
  - helmet.js для установки security headers
  - Content Security Policy (CSP) headers
  ```typescript
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
  ```

### 3. DDoS Protection (Multi-Layer)
- **Layer 1: Nginx** (первая линия защиты)
  - Rate limiting на уровне сервера: `limit_req_zone` с разными зонами
  - Connection limiting: `limit_conn_zone`
  - Request size limits: `client_max_body_size 10M`

- **Layer 2: Express Middleware**
  - `express-rate-limit` для API endpoints
  - Разные лимиты для разных endpoints:
    - General: 10 req/sec
    - Auth: 5 req/15min (stricter)
    - AI: 20 req/hour

- **Layer 3: Application Level**
  - Database connection pooling (min: 2, max: 10)
  - Query optimization с индексами
  - Caching для частых запросов

### 4. JWT Authentication
- **Access Token:** Short-lived (15 min), в header Authorization
- **Refresh Token:** Long-lived (7 days), сохраняется в БД и localStorage
- **Rotation:** Refresh token обновляется при использовании
- **Secure Storage:**
  - Backend: JWT secrets в переменных окружения (32+ символов)
  - Frontend: Refresh token в localStorage (persistent), Access token только в памяти
- **Middleware:** Проверка токена на каждый protected endpoint

### 5. Email Verification
- **Flow:**
  1. Регистрация → генерация verification token (UUID)
  2. Отправка email с ссылкой подтверждения
  3. Клик на ссылку → верификация токена → активация аккаунта
- **Security:**
  - Token expires через 24 часа
  - Token одноразовый (удаляется после использования)
  - Rate limiting на resend verification email

---

## 🤖 AI Integration: Google Gemini

### Выбор: Gemini 1.5 Flash

**Обоснование:**
- ✅ **Бесплатный tier:** 60 req/min, 1500 req/day
- ✅ **Быстрый:** Low latency для хорошего UX
- ✅ **Качественный:** Актуальные рекомендации
- ✅ **Простой API:** REST без сложных SDK
- ✅ **Multimodal:** Будущее расширение с изображениями

### Use Cases
1. **Workout Recommendations** - Персональные планы тренировок на основе целей, возраста, уровня
2. **Nutrition Advice** - Рекомендации по питанию и калориям
3. **Goal Suggestions** - Умные предложения целей на основе прогресса
4. **Motivational Messages** - Генерация мотивационных сообщений
5. **Q&A Assistant** - Ответы на вопросы пользователей

### Implementation
- **Backend Service:** `AIService.ts` с методами для каждого use case
- **Rate Limiting:** 20 AI requests/hour per user
- **Caching:** Сохранение рекомендаций в БД (таблица `ai_recommendations`)
- **User Feedback:** Система оценки рекомендаций (helpful/not_helpful)

**API Key:** Получить на https://ai.google.dev/ (бесплатно)

---

## 🚀 Quick Start для MacOS

### Шаг 1: Установка Prerequisites
```bash
# Установить Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установить Node.js 20
brew install node@20

# Установить Docker Desktop
# Скачать: https://www.docker.com/products/docker-desktop/

# Проверка
node -v  # v20+
docker -v
docker-compose -v
```

### Шаг 2: Инициализация Проекта
```bash
# Перейти в директорию
cd "/Users/kirills/ Учеба/4 курс/Диплом/web-diplom"

# Запустить setup script
chmod +x setup.sh
./setup.sh
```

### Шаг 3: Настройка Environment Variables
```bash
# Редактировать .env
nano .env

# Обязательно обновить:
# 1. DB_PASSWORD - безопасный пароль
# 2. SMTP_* - настройки email (Gmail или SendGrid)
# 3. GEMINI_API_KEY - получить на https://ai.google.dev/
# 4. JWT секреты (автоматически генерируются setup.sh)
```

### Шаг 4: Запуск Development
```bash
# Собрать и запустить все сервисы
npm run dev:build

# Проверить статус
docker ps

# Выполнить миграции
npm run migrate

# Загрузить тестовые данные (опционально)
npm run seed
```

### Шаг 5: Проверка
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health
- Database: localhost:5432 (postgres/your_password/fitness_dev)

---

## 📝 Критические Файлы для Реализации

### Core Configuration Files

1. **Backend Core**
   - `backend/src/config/database.ts` - Knex connection и configuration
   - `backend/src/config/env.ts` - Environment validation с Zod
   - `backend/src/config/jwt.ts` - JWT token generation и verification
   - `backend/src/app.ts` - Express app setup с middleware

2. **Authentication & Security**
   - `backend/src/middleware/auth.middleware.ts` - JWT authentication middleware
   - `backend/src/middleware/rateLimiter.middleware.ts` - Rate limiting configuration
   - `backend/src/middleware/sanitize.middleware.ts` - XSS protection
   - `backend/src/services/auth/AuthService.ts` - Registration, login, verification

3. **Database**
   - `backend/src/database/migrations/` - Все 12 миграций (создание таблиц)
   - `backend/src/database/seeds/` - Seed данные для development

4. **AI Integration**
   - `backend/src/services/ai/AIService.ts` - Gemini API integration
   - `backend/src/config/ai.ts` - AI configuration

5. **Frontend Core**
   - `frontend/src/app/router.tsx` - Routing configuration
   - `frontend/src/shared/lib/axios/axiosInstance.ts` - Axios setup с interceptors
   - `frontend/src/features/auth/model/authStore.ts` - Zustand auth store
   - `frontend/src/shared/lib/socket/socketClient.ts` - Socket.io client

6. **Real-time Chat**
   - `backend/src/socket/socket.ts` - Socket.io server setup
   - `backend/src/socket/handlers/chatHandler.ts` - Chat event handlers

7. **Infrastructure**
   - `docker-compose.yml` - Production orchestration
   - `docker-compose.dev.yml` - Development environment
   - `nginx/conf.d/default.conf` - Nginx с rate limiting и proxy
   - `backend/Dockerfile` - Multi-stage production build
   - `frontend/Dockerfile` - Frontend build с nginx

8. **Testing**
   - `backend/tests/integration/auth.test.ts` - Auth endpoints testing
   - `frontend/src/features/auth/ui/LoginForm.test.tsx` - Component testing

---

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests:** Jest для services и utils
  - `tests/unit/services/` - AuthService, GoalService, WorkoutService
  - Coverage target: 80%+

- **Integration Tests:** Supertest для API endpoints
  - `tests/integration/` - Полное тестирование API flows
  - Тестирование с реальной БД (test environment)

### Frontend Testing
- **Component Tests:** Vitest + React Testing Library
  - Unit тесты для форм и UI компонентов
  - Тестирование user interactions

- **E2E Tests (Optional):** Playwright или Cypress
  - Critical user flows: registration → login → create goal → book consultation

### Validation Testing
- **Backend:** Zod schemas для всех API endpoints
- **Frontend:** React Hook Form + Zod для всех форм
- **Integration:** Тестирование validation на обеих сторонах

---

## 📊 Последовательность Реализации (12 недель)

### Week 1: Infrastructure
- ✅ Инициализация проекта и структуры
- ✅ Docker + docker-compose setup
- ✅ PostgreSQL + миграции
- ✅ Nginx configuration
- ✅ Backend и Frontend base setup

### Week 2: Authentication & Security
- ✅ JWT authentication (access + refresh)
- ✅ Email verification
- ✅ Security middleware (rate limiting, sanitization)
- ✅ Auth unit tests

### Week 3: Users & Profiles
- ✅ User CRUD
- ✅ Trainer registration
- ✅ Profile management UI
- ✅ Integration tests

### Week 4: Fitness Goals
- ✅ Goals CRUD
- ✅ Progress tracking
- ✅ Goals dashboard UI
- ✅ Charts и visualization

### Week 5: Workouts & Exercises
- ✅ Exercise library
- ✅ Workout CRUD с упражнениями
- ✅ Workout logging UI
- ✅ Scheduling

### Week 6: Nutrition
- ✅ Nutrition plans CRUD
- ✅ Meal tracking
- ✅ Nutrition dashboard
- ✅ Macros calculations

### Week 7: Consultations
- ✅ Booking system
- ✅ Trainer availability
- ✅ Calendar UI
- ✅ Consultation management

### Week 8: Real-time Chat
- ✅ Socket.io setup
- ✅ Message CRUD
- ✅ Chat UI
- ✅ Real-time delivery

### Week 9: AI Integration
- ✅ Gemini API integration
- ✅ Workout recommendations
- ✅ Nutrition recommendations
- ✅ AI UI components

### Week 10: Testing & Optimization
- ✅ Comprehensive unit tests
- ✅ Integration tests
- ✅ Frontend tests
- ✅ Performance optimization

### Week 11: Deployment
- ✅ Production setup
- ✅ CI/CD pipeline
- ✅ SSL certificates
- ✅ Monitoring

### Week 12: Final Polish
- ✅ UI/UX improvements
- ✅ Documentation
- ✅ Final testing
- ✅ Production deployment

---

## ✅ Verification & Testing Plan

### End-to-End Testing Scenarios

1. **User Registration & Authentication**
   - ✅ Регистрация нового пользователя
   - ✅ Получение email с verification link
   - ✅ Подтверждение email
   - ✅ Login с credentials
   - ✅ Получение JWT токенов
   - ✅ Refresh token rotation

2. **Fitness Goals Management**
   - ✅ Создание новой цели (weight loss)
   - ✅ Обновление progress
   - ✅ Просмотр dashboard с графиками
   - ✅ Завершение цели

3. **Workout Tracking**
   - ✅ Создание workout плана
   - ✅ Добавление упражнений из библиотеки
   - ✅ Логирование выполненной тренировки
   - ✅ Просмотр истории тренировок

4. **Nutrition Planning**
   - ✅ Создание nutrition плана
   - ✅ Логирование приемов пищи
   - ✅ Просмотр macros breakdown
   - ✅ Отслеживание калорий

5. **Trainer Consultation**
   - ✅ Поиск тренера
   - ✅ Бронирование консультации
   - ✅ Real-time chat с тренером
   - ✅ Завершение консультации

6. **AI Recommendations**
   - ✅ Запрос workout рекомендации
   - ✅ Запрос nutrition рекомендации
   - ✅ Оценка рекомендации (feedback)
   - ✅ Просмотр истории рекомендаций

### Security Validation

1. **SQL Injection Testing**
   - ✅ Попытка инъекции в login form
   - ✅ Попытка инъекции в search/filter endpoints
   - ✅ Проверка, что Knex параметризует запросы

2. **XSS Testing**
   - ✅ Попытка вставки `<script>` в текстовые поля
   - ✅ Проверка sanitization на backend
   - ✅ Проверка escaping на frontend
   - ✅ Валидация CSP headers

3. **DDoS Protection Testing**
   - ✅ Отправка 100+ requests за секунду (должны быть заблокированы)
   - ✅ Проверка rate limiting на auth endpoints
   - ✅ Проверка nginx rate limiting
   - ✅ Мониторинг response times под нагрузкой

4. **JWT Security Testing**
   - ✅ Попытка доступа без токена (401)
   - ✅ Попытка с expired token (401 → refresh)
   - ✅ Попытка с invalid token (401)
   - ✅ Token rotation при refresh

### Performance Testing

1. **Database Performance**
   - ✅ Query execution time < 100ms для простых запросов
   - ✅ Query execution time < 500ms для сложных joins
   - ✅ Проверка использования индексов (EXPLAIN ANALYZE)

2. **API Performance**
   - ✅ Response time < 200ms для GET endpoints
   - ✅ Response time < 500ms для POST/PUT endpoints
   - ✅ Concurrent users handling (100+ simultaneous)

3. **Frontend Performance**
   - ✅ Initial load time < 3s
   - ✅ Time to Interactive < 5s
   - ✅ Bundle size < 500KB (gzipped)

### Validation Testing

1. **Backend Validation**
   - ✅ Email format validation (Zod schema)
   - ✅ Password strength validation (min 8 chars, uppercase, lowercase, number)
   - ✅ Required fields validation
   - ✅ Type validation (numbers, dates, enums)
   - ✅ Range validation (weight, height, age limits)

2. **Frontend Validation**
   - ✅ Real-time validation с React Hook Form
   - ✅ Error messages на русском языке
   - ✅ Disabled submit при invalid форме
   - ✅ Visual feedback (red borders, error text)

---

## 📚 Дополнительные Рекомендации

### Email Configuration (для development)
**Gmail:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password  # Получить в Google Account Settings
```

**SendGrid (recommended для production):**
- Регистрация: https://sendgrid.com/
- Free tier: 100 emails/day
- API Key в Dashboard

### Database Backup Strategy
```bash
# Ручной backup
docker exec fitness-db pg_dump -U postgres fitness_app > backup.sql

# Automated backup (cron)
0 2 * * * docker exec fitness-db pg_dump -U postgres fitness_app > /backups/$(date +\%Y\%m\%d).sql
```

### Monitoring & Logging
- **Winston:** Structured logging в файлы (`logs/` directory)
- **Error tracking:** Sentry.io (опционально, free tier)
- **Uptime monitoring:** UptimeRobot или Pingdom

### Production Checklist
- [ ] SSL certificates настроены (Let's Encrypt)
- [ ] Environment variables в production безопасны
- [ ] Database backups автоматизированы
- [ ] Rate limiting протестирован
- [ ] Security headers проверены (securityheaders.com)
- [ ] Monitoring настроен
- [ ] Error tracking настроен
- [ ] Performance оптимизирован (bundle size, images)

---

## 🎯 Итоговые Метрики Успеха

### Функциональность
- ✅ Все 7 основных модулей работают (Auth, Goals, Workouts, Nutrition, Consultations, Chat, AI)
- ✅ Real-time chat функционирует
- ✅ AI рекомендации генерируются
- ✅ Email verification работает

### Безопасность
- ✅ SQL Injection: 0 уязвимостей
- ✅ XSS: 0 уязвимостей
- ✅ DDoS protection активна
- ✅ JWT authentication надежна

### Тестирование
- ✅ Backend coverage > 80%
- ✅ All integration tests pass
- ✅ Frontend component tests pass
- ✅ E2E критических flows работают

### Performance
- ✅ API response time < 500ms
- ✅ Frontend load time < 3s
- ✅ Database queries оптимизированы

### Развертывание
- ✅ Docker Compose запускает все сервисы одной командой
- ✅ Development environment работает на macOS
- ✅ Production-ready конфигурация готова

---

## 🔧 Prisma Workflow Guide

### Основные команды

```bash
# 1. Создание schema.prisma (первый шаг)
# Создать файл prisma/schema.prisma вручную

# 2. Генерация Prisma Client (после изменений в schema)
npx prisma generate

# 3. Создание и применение миграции (development)
npx prisma migrate dev --name init
# Создаст SQL миграцию в prisma/migrations/ и применит к БД

# 4. Применение миграций (production)
npx prisma migrate deploy

# 5. Просмотр данных в GUI
npx prisma studio
# Откроется http://localhost:5555

# 6. Форматирование schema
npx prisma format

# 7. Валидация schema
npx prisma validate

# 8. Сброс БД (WARNING: удалит все данные!)
npx prisma migrate reset
```

### Типичный Development Workflow

1. **Создать/изменить model в schema.prisma:**
```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
}
```

2. **Создать миграцию:**
```bash
npx prisma migrate dev --name add_user_model
```
Prisma автоматически:
- Создаст SQL миграцию
- Применит её к БД
- Сгенерирует TypeScript типы

3. **Использовать в коде:**
```typescript
import { prisma } from './config/database';

// Type-safe queries!
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'John Doe'
  }
});
// TypeScript знает все поля user
```

### Environment Variables для Prisma

```bash
# .env файл
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Пример для local development:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitness_dev?schema=public"

# Пример для Docker:
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/fitness_app?schema=public"

# Пример для production (с SSL):
DATABASE_URL="postgresql://user:password@prod-host:5432/fitness_app?schema=public&sslmode=require"
```

### Prisma vs Knex - Ключевые Преимущества

| Feature | Prisma | Knex.js |
|---------|--------|---------|
| Type Safety | ✅ Full auto-generated | ⚠️ Manual types |
| Migrations | ✅ Auto-generated SQL | ⚠️ Manual SQL |
| Relations | ✅ Declarative | ⚠️ Manual joins |
| IDE Support | ✅ Excellent autocomplete | ⚠️ Limited |
| Schema as Code | ✅ Single source of truth | ⚠️ SQL in migrations |
| Learning Curve | ✅ Simple API | ⚠️ SQL knowledge required |

### Важные Замечания

1. **Prisma создает РЕАЛЬНЫЕ PostgreSQL таблицы** - можно подключиться к БД любым SQL клиентом
2. **Миграции хранятся в `prisma/migrations/`** - коммитить в git для version control
3. **После изменения schema** - всегда запускать `npx prisma generate` для обновления типов
4. **Production migrations** - использовать `npx prisma migrate deploy` (без интерактивности)
5. **Seed данные** - создать `prisma/seed.ts` и запускать `npx prisma db seed`
