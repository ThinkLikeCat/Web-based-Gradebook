# Web-based Gradebook

## Структура серверной части

```
server/
├── src/
│   ├── domain/                   # Слой домена — бизнес-сущности и правила
│   │   ├── entities/             # Сущности (Student, Course, Grade, etc.)
│   │   ├── value-objects/        # Value-объекты (неизменяемые типы)
│   │   └── errors/               # Доменные ошибки
│   ├── application/              # Слой приложения — сценарии использования
│   │   ├── usecases/             # Интеракторы (оркестрация бизнес-логики)
│   │   ├── ports/
│   │   │   ├── in/               # Входящие порты (контракты для usecase'ов)
│   │   │   └── out/              # Исходящие порты (контракты репозиториев)
│   │   └── dtos/                 # Data Transfer Objects
│   ├── infrastructure/           # Слой инфраструктуры — адаптеры фреймворков
│   │   ├── database/
│   │   │   ├── models/           # ORM/модели базы данных
│   │   │   ├── repositories/     # Реализация исходящих портов
│   │   │   └── migrations/       # Миграции БД
│   │   ├── webserver/
│   │   │   ├── routes/           # Маршруты Express
│   │   │   ├── middleware/       # Middleware Express
│   │   │   └── server.ts         # Настройка Express-сервера
│   │   └── external/             # Интеграции с внешними сервисами
│   ├── interfaces/               # Слой представления — HTTP, валидация
│   │   ├── controllers/          # Контроллеры (запрос → usecase)
│   │   ├── validators/           # Схемы валидации входных данных
│   │   └── serializers/          # Трансформеры ответов
│   ├── config/                   # Конфигурация приложения (env, константы)
│   └── index.ts                  # Точка входа
├── tests/
│   ├── unit/                     # Модульные тесты
│   ├── integration/              # Интеграционные тесты
│   └── e2e/                      # E2E-тесты
├── package.json
└── tsconfig.json
```
