# Сферум.Кабинет

Веб-сервис и чат-бот для учителей, классных руководителей и школьной администрации в экосистеме Сферум / MAX.

Проект разработан для хакатона «Идея фикс» (номинация «Продвинутая разработка»).

---

## Ссылки проекта

* **Чат-бот в мессенджере MAX:** [https://max.ru/ideya_fiks_23_bot](https://max.ru/ideya_fiks_23_bot) (`@ideya_fiks_23_bot`)
* **Мини-приложение (Web-версия):** [https://sferum-cabinet.pages.dev](https://sferum-cabinet.pages.dev)
* **VK Mini App:** [https://vk.com/app54807964](https://vk.com/app54807964)
* **Репозиторий:** [https://github.com/basovmatveyy-web/xakaton](https://github.com/basovmatveyy-web/xakaton)

---

## Архитектура и стек

* **Frontend:** React 19, TypeScript, VKUI, Vite, KaTeX, jsPDF
* **Backend:** ASP.NET Core Web API (.NET 9 / 10), Entity Framework Core, SQLite
* **Bot:** Python 3.11, MAX Bot API (Long Polling + Webhook)
* **Инфраструктура:** Docker, Docker Compose, Nginx, Supervisor

---

## Запуск в Docker

### Быстрый старт через Docker Compose

```bash
git clone https://github.com/basovmatveyy-web/xakaton.git
cd xakaton
docker compose up --build -d
```

После запуска:
* Веб-интерфейс доступен на порту `80`: [http://localhost](http://localhost)
* REST API доступен на порту `5050`: [http://localhost:5050/api/system/status](http://localhost:5050/api/system/status)
* Swagger UI: [http://localhost:5050/swagger](http://localhost:5050/swagger)

Контейнер объединяет Nginx (раздача фронтенда и reverse proxy), .NET API и Python-демона бота MAX под управлением Supervisor.

### Сборка и запуск через Docker CLI

```bash
docker build -t sferum-cabinet:latest .

docker run -d \
  -p 80:80 \
  -p 5050:5050 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e MAX_BOT_TOKEN="ВАШ_ТОКЕН_БОТА" \
  --name sferum-cabinet-app \
  sferum-cabinet:latest
```

Просмотр логов:
```bash
docker logs -f sferum-cabinet-app
```

Остановка контейнера:
```bash
docker compose down
# или
docker stop sferum-cabinet-app && docker rm sferum-cabinet-app
```

---

## Локальный запуск без Docker

### 1. Бэкенд (.NET)

```bash
cd backend/SferumCabinet.Api
dotnet run --urls "http://127.0.0.1:5050"
```

### 2. Фронтенд (React)

```bash
cd frontend
npm install
npm run dev
```

Интерфейс откроется на `http://localhost:5173`.

### 3. Чат-бот MAX (Python)

```bash
pip install -r requirements.txt
python bot_daemon.py
```

---

## Зависимости (requirements.txt / Requierments.txt)

В корне репозитория размещены файлы `requirements.txt` и `Requierments.txt`:

```txt
requests>=2.32.3
urllib3>=2.3.0
python-docx>=1.2.0
python-pptx>=1.0.2
Pillow>=11.0.0
xlsxwriter>=3.2.2
openpyxl>=3.1.5
typing_extensions>=4.12.2
```
