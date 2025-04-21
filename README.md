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
Установка зависимостей
Установка Docker и Make
macOS
Установка Docker Desktop:

Перейдите на официальный сайт Docker и скачайте установщик Docker Desktop для macOS.
Откройте скачанный файл .dmg и перетащите иконку Docker в папку "Программы".
Откройте Docker из папки "Программы" и дождитесь, пока он полностью загрузится.
Установка Make:

Откройте терминал и выполните следующую команду для установки Homebrew (если еще не установлен):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Установите Make:
brew install make
Linux
Установка Docker:

Откройте терминал и выполните следующие команды:
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
Проверьте установку:

Убедитесь, что Docker установлен, выполнив команду:
docker --version
Установка Make:

Выполните следующую команду:
sudo apt-get install -y make
Windows
Рекомендуется делать действия для Linux через WSL. Альтернатива представлена ниже

Установка Docker Desktop:

Перейдите на официальный сайт Docker и скачайте установщик Docker Desktop для Windows.
Запустите скачанный установщик и следуйте инструкциям на экране.
После установки запустите Docker Desktop и дождитесь, пока он полностью загрузится.
Установка Make:

Откройте PowerShell от имени администратора и выполните следующую команду для установки Chocolatey (если еще не установлен):
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
или https://chocolatey.org/install

Установите Make:
choco install make
Проверка установки
После установки Docker и Make, вы можете проверить их работоспособность, выполнив следующие команды в терминале или командной строке:

docker --version
make --version
Если обе команды возвращают версии, значит, установка прошла успешно!

Управление Docker-контейнером
Для управления Docker-контейнером приложения доступны следующие команды:

Основные команды
make initial-start - Полная перезапуск приложения (очистка + сборка + запуск)
make build - Собрать Docker-образ приложения
make run - Запустить контейнер с приложением
make stop - Остановить контейнер
make clean - Остановить и удалить контейнер
make clean-image - Удалить Docker-образ
make clean-all - Полная очистка (удаление контейнера и образа)
Пример использования
Первый запуск приложения:

make initial-start
Остановка приложения:

make stop
Удаление контейнера:

make clean
Полная очистка:

make clean-all
Альтернативный запуск через Go
Если вы хотите запустить приложение напрямую через Go, выполните следующие шаги:

Убедитесь, что у вас установлен Go. Вы можете скачать его с официального сайта Go.
Из директории, где находится этот файл (README.md), выполните:
go run сmd/service/main.go
После этого приложение будет доступно по адресу http://127.0.0.1:8080.

Документация
После запуска контейнера документация будет доступна по ссылке http://127.0.0.1:8080/swagger/index.html

## 📄 Лицензия
MIT © 2025 AvitoCRM
