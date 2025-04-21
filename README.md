# AvitoCRM – Система управления проектами

Краткое описание: современная web‑система для управления проектами с канбан‑досками, аналитикой и адаптивным интерфейсом.

## ✨ Ключевые возможности
- Канбан‑доски с drag‑and‑drop (@hello-pangea/dnd)
- Полноценное управление задачами и тегами
- Расширенный поиск и фильтрация
- Аналитика прогресса команды

## 🛠️ Технологический стек
### Frontend
- React 20 + TypeScript + Vite
- MUI 5, React Query, Redux Toolkit  
### Backend
- Go, PostgreSQL, Redis  
### DevOps & Testing
- Docker, GitHub Actions, Jest, React Testing Library

## 🏗 Архитектура
```
avito/
├── public/                 # Статические ресурсы
├── server/                 # Backend (Go)
│   ├── cmd/                # Точки входа
│   ├── api/                # API контроллеры
│   ├── internal/           # Бизнес‑логика
│   ├── models/             # Модели данных
│   └── middleware/         # Middleware
└── src/
    ├── assets/             # Графика
    ├── components/         # Общие React‑компоненты
    ├── features/           # Feature‑модули
    ├── pages/              # Страницы
    ├── routes/             # Роутинг
    ├── shared/
    │   ├── api/            # API‑клиент
    │   ├── hooks/          # Общие хуки
    │   ├── contexts/       # React‑контексты
    │   └── utils/          # Утилиты
    ├── store/              # Redux‑store
    └── types/              # Типы
```

## 🚀 Быстрый старт
```bash
git clone https://github.com/Eduard-Bosak/AvitoCRM.git
cd AvitoCRM
docker-compose up -d   # полный стек
```
Frontend отдельно:
```bash
npm install
npm run dev
```
Backend (Go) отдельно:
```bash
cd server
go mod download
go run cmd/service/main.go
```

## 📄 Лицензия
MIT © 2025 AvitoCRM
