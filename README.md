<div align="center">

# 📚 Web-based Gradebook

**Электронный журнал для учебных заведений**

Преподаватели ведут оценки и посещаемость, студенты просматривают успеваемость и расписание.

[![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)]()
[![Stack](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)]()
[![Stack](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)]()
[![Stack](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)]()
[![Stack](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)]()
[![Stack](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)]()

</div>

---

## 🚀 Быстрый старт

### 🐳 Docker (рекомендуемый способ)

```bash
# Если запускаете впервые или сбрасываете БД:
docker compose down -v && docker compose up --build -d

# При последующих запусках:
docker compose up -d
```

| Сервис | Адрес |
|--------|-------|
| Клиент | http://localhost:8080 |
| Сервер | http://localhost:3000 |

> **⚠️ Если PostgreSQL падает с ошибкой про пароль** — удалите старый volume: `docker compose down -v` и запустите заново. Флаг `-v` очищает битые данные.

### 💻 Локальная разработка

**Требования:** Node.js 20+, PostgreSQL (или Docker).

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка окружения
cp server/.env.example server/.env
# При необходимости отредактируйте server/.env

# 3. Запуск PostgreSQL (через Docker)
docker compose up postgres -d

# 4. Запуск сервера и клиента параллельно
npm run dev
```

| Сервис | Адрес |
|--------|-------|
| Клиент | http://localhost:5173 |
| Сервер | http://localhost:3000 |

> Клиент использует Vite proxy — запросы к `/api` автоматически направляются на сервер.

---

## 📋 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Сервер + клиент параллельно |
| `npm run dev:server` | Только сервер |
| `npm run dev:client` | Только клиент |
| `npm run build` | Сборка обеих частей |
| `npm test` | Все тесты сервера |
| `npm run test:unit` | Unit-тесты (без БД) |
| `npm run test:e2e` | E2E-тесты (нужна БД) |
| `npm run lint` | Линтинг сервера |
| `npm run typecheck` | Проверка типов сервера |

---

## 🔐 Тестовые учётные данные

### 👨‍🏫 Преподаватели

| ФИО | Пароль | Предметы |
|-----|--------|----------|
| **Вольфович Александр** | `Login123$` | Веб-программирование, Системы управления БД |
| Иванова Мария | `Teacher456$` | Компьютерные сети |
| Петров Сергей | `Teacher789$` | Тестирование ПО |

**Вход:** Фамилия + Имя + Пароль

### 👨‍🎓 Студенты

| ФИО | Пароль | Группа | Дата рождения |
|-----|--------|--------|---------------|
| **Вольфович Арсений** | `Student123$` | Т-394 | 2007-11-08 |
| Иванов Иван | `Student123$` | Т-394 | 2006-05-15 |
| Петров Петр | `Student123$` | Т-394 | 2006-08-22 |
| Кузнецов Алексей | `Student123$` | Т-395 | 2006-11-12 |
| Сидорова Анна | `Student123$` | Т-395 | 2007-01-30 |
| Смирнова Ольга | `Student123$` | Т-394 | 2007-03-18 |
| Федоров Дмитрий | `Student123$` | Т-395 | 2006-07-05 |
| Морозова Елена | `Student123$` | Т-394 | 2007-09-25 |

**Вход:** Фамилия + Имя + Дата рождения + Группа + Пароль

---

## 🏗️ Архитектура

```
web-based-gradebook/
├── client/                     # React 19 + Vite 8
│   ├── src/
│   │   ├── api/               # HTTP-клиенты для API
│   │   ├── components/        # UI-компоненты (Sidebar, Toast)
│   │   ├── pages/             # Страницы (student/, teacher/, settings)
│   │   ├── hooks/             # Кастомные хуки
│   │   ├── data/              # Мок-данные
│   │   ├── utils/             # Утилиты
│   │   ├── types.ts           # TypeScript-типы
│   │   └── App.tsx            # Корневой компонент
│   ├── nginx.conf             # Конфигурация nginx для Docker
│   └── Dockerfile
│
├── server/                     # Express 4 + TypeScript 6
│   ├── src/
│   │   ├── domain/            # Сущности, value-objects, ошибки
│   │   ├── application/       # Use cases, DTO, порты
│   │   ├── infrastructure/    # Express, PostgreSQL, middleware
│   │   ├── interfaces/        # Контроллеры
│   │   ├── config/            # Конфигурация из env
│   │   └── index.ts           # Точка входа
│   ├── tests/                 # Jest-тесты
│   └── Dockerfile
│
├── docker-compose.yml         # PostgreSQL + сервер + клиент
└── package.json               # Корневой package.json
```

### 🧱 Чистая архитектура (бэкенд)

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐
│  Routes  │────▶│ Controllers  │────▶│   Use Cases    │
└──────────┘     └──────────────┘     └───────┬────────┘
                                              │
                                     ┌────────▼────────┐
                                     │  Repositories   │
                                     └────────┬────────┘
                                              │
                                     ┌────────▼────────┐
                                     │   PostgreSQL    │
                                     └─────────────────┘
```

---

## 🌐 API

### Публичные (без токена)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register/student` | Регистрация студента |
| POST | `/api/auth/register/teacher` | Регистрация преподавателя |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/refresh` | Обновление access-токена |
| POST | `/api/auth/logout` | Выход |

### Преподаватель (требует `role: TEACHER`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/teacher/groups` | Группы и предметы преподавателя |
| GET | `/api/teacher/stats` | Статистика за месяц |
| GET | `/api/teacher/journal/:groupId/:subjectId` | Журнал группы по предмету |
| POST | `/api/teacher/grade` | Выставить оценку |
| POST | `/api/teacher/attendance` | Отметить посещаемость |
| POST | `/api/teacher/lesson` | Добавить занятие |
| GET | `/api/teacher/program/:subjectId` | Рабочая программа |
| POST | `/api/teacher/program` | Добавить пункт программы |
| PUT | `/api/teacher/program/:itemId` | Изменить пункт программы |
| DELETE | `/api/teacher/program/:itemId` | Удалить пункт программы |
| GET | `/api/teacher/labs/:programId/submissions` | Список сданных работ |
| POST | `/api/teacher/labs/submissions/:submissionId/grade` | Оценить работу |

### Студент (требует `role: STUDENT` или `TEACHER`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/students/:id/schedule` | Расписание студента |
| GET | `/api/students/:id/journal` | Журнал студента |
| GET | `/api/students/:id/subjects/:subjectId` | Прогресс по предмету |
| GET | `/api/students/:id/labs/:labId` | Детали лабораторной |

---

## ⚙️ Переменные окружения

### Сервер (`server/.env`)

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `PORT` | `3000` | Порт сервера |
| `JWT_SECRET` | — | Секрет JWT (обязательно в production) |
| `JWT_EXPIRES_IN_SECONDS` | `86400` | Время жизни access-токена |
| `REFRESH_TOKEN_EXPIRES_IN_SECONDS` | `604800` | Время жизни refresh-токена |
| `CORS_ORIGIN` | `http://localhost:5173` | Разрешённый origin |
| `DB_HOST` | `localhost` | Хост PostgreSQL |
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DB_NAME` | `gradebook` | Имя БД |
| `DB_USER` | `postgres` | Пользователь БД |
| `DB_PASSWORD` | `postgres` | Пароль БД |

### Клиент (`client/.env`)

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `VITE_API_URL` | `http://localhost:3000` | Базовый URL API |

---

## 🛠️ Стек технологий

| Компонент | Технология |
|-----------|------------|
| **Клиент** | React 19, TypeScript 6, Vite 8, Lucide React |
| **Сервер** | Express 4, TypeScript 6, PostgreSQL 16, Zod |
| **Аутентификация** | JWT + Refresh Tokens, bcryptjs |
| **Транспорт** | REST API (JSON) |
| **Инфраструктура** | Docker Compose, nginx |

---

## ❗ Устранение проблем

### PostgreSQL падает с ошибкой `"password is not specified"`

Удалите старый volume и перезапустите:

```bash
docker compose down -v
docker compose up -d
```

### Порт 3000 занят

```bash
# Узнать, кто занимает порт
netstat -ano | findstr :3000

# Завершить процесс (Windows)
taskkill /PID <ID> /F
```

### Ошибка `"relation does not exist"`

Миграции не выполнились. Перезапустите сервер:

```bash
docker compose restart server
```
