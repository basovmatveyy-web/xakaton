# «Сферум.Кабинет» — Единое цифровое рабочее место учителя

> **Всероссийский хакатон «Идея фикс» (Сферум / VK Образование / Минпросвещения России)**  
> **Номинация:** «Продвинутая разработка» (Docker, React/VKUI, .NET Core Web API, MAX Bot API)  
> **Команда №23:** «Девелопы»  
> **Образовательная организация:** МАОУ «Лицей Информационных Технологий» г. Новосибирска  

---

## 📌 Ключевые ссылки для жюри и экспертов

| Ресурс | Ссылка | Описание |
| :--- | :--- | :--- |
| 📱 **Мини-приложение в ВКонтакте / Сферум** | **[https://vk.com/app54807964](https://vk.com/app54807964)** | Официальное приложение VK Mini Apps (`ID: 54807964`) |
| 🤖 **Проект в мессенджере MAX** | **[https://max.ru/ideya_fiks_23_bot](https://max.ru/ideya_fiks_23_bot)** | Официальный чат-бот проекта (`@ideya_fiks_23_bot`) |
| 🌐 **Развернутое WebApp (Production)** | **[https://sferum-cabinet.pages.dev](https://sferum-cabinet.pages.dev)** | Полная веб-версия сервиса (Cloudflare Pages) |
| 🐙 **Репозиторий на GitHub** | **[https://github.com/basovmatveyy-web/xakaton](https://github.com/basovmatveyy-web/xakaton)** | Исходный код, Docker-образ и скрипты |
| 🔑 **Токен проекта в платформе MAX** | `f9LHodD0cOJX1binrlWBycWED-mAlS-161FfBX83BtJMMXcyGKxxnz7oOhr9zWHrnXlyFVf9AeDTHSLo9m8o` | Авторизационный токен Bot API |

---

## 📋 Чек-лист соответствия требованиям сдачи

* [x] **Docker-образ:** Многоэтапная сборка (`Dockerfile`, `docker-compose.yml`, `.dockerignore`) с Nginx, .NET API и Python-ботом.
* [x] **Файл зависимостей:** `requirements.txt` (и алиас `Requierments.txt`) с точным перечнем библиотек и версий.
* [x] **Файл README:** Исчерпывающая инструкция по сборке, запуску контейнера и запуску через командную строку.
* [x] **Ссылка на проект в MAX:** Чат-бот и мини-приложение зарегистрированы и подключены к платформе MAX.

---

## 📖 О проекте

**«Сферум.Кабинет»** — это комплексный цифровой ассистент и рабочее пространство учителя, классного руководителя и администрации школы, бесшовно интегрированное в экосистему **Сферум / MAX**. 

Сервис снимает до 8,5 часов бумажной рутины в неделю и решает ключевые задачи современной школы:
1. **Закон о запрете смартфонов у детей на уроках (ФЗ № 618):** конструктор проверочных карточек А4 на 2 или 4 варианта с оптическим форматированием, линиями отреза ножницами (`✂`), шкалой оценивания ФГОС и печатью эталонных ключей для экспресс-проверки.
2. **Анти-ГДЗ и Банк ФИПИ:** моментальная генерация уникальных вариантов задач ОГЭ/ЕГЭ по кодификаторам ФИПИ 2026 года без совпадений в решебниках и ГДЗ.
3. **Цифровая приемная классного руководителя:** электронный учет заявлений и справок от родителей с экспортом готового ежемесячного архива завучу в 1 клик.
4. **Сферум.Планер & Навигатор кабинетов:** интерактивная схема 3 этажей лицея (МАОУ ЛИТ), статус занятости аудиторий в реальном времени и кнопка быстрого SOS-тикета завхозу.
5. **Чат-бот ассистент в MAX:** оперативная мобильная сводка по классу, генератор задач и заявки завхозу прямо из диалога в мессенджере.

---

## 🛠 Архитектура и стек технологий

* **Frontend:** React 19, TypeScript, VKUI 7, Lucide Icons, Vite, KaTeX (математическая верстка), jsPDF (клиентский экспорт А4).
* **Backend:** C# / .NET (ASP.NET Core Web API), Entity Framework Core, SQLite (полная автономность).
* **Bot Service:** Python 3.11 / MAX Platform API (`platform-api2.max.ru`), Long Polling и WebApp Bridge.
* **Контейнеризация и оркестрация:** Docker (Multi-stage build), Docker Compose, Nginx (reverse proxy), Supervisor.

---

## 🚀 Инструкция по сборке и запуску через Docker

### Требования
* Установленный **Docker Engine** (версии 20.10+)
* Установленный **Docker Compose** (версии v2.0+)
* Свободные порты `80` (веб-интерфейс) и `5050` (REST API)

### 1. Клонирование репозитория
```bash
git clone https://github.com/basovmatveyy-web/xakaton.git
cd xakaton
```

### 2. Запуск через Docker Compose (Рекомендуемый способ)
Сборка и запуск всего стека сервисов (фронтенд, бэкенд, Nginx и бот MAX) выполняются одной командой:
```bash
docker compose up --build -d
```

Команда автоматически:
1. Соберёт оптимизированный продакшен-бандл фронтенда.
2. Скомпилирует и опубликует .NET Web API бэкенд.
3. Установит зависимости Python и запустит Nginx на порту `80`, API на порту `5050` и фонового демона бота MAX под управлением Supervisor.

### 3. Запуск напрямую через Docker CLI (Альтернативный способ)
Если вы хотите собрать и запустить контейнер вручную без `docker compose`:
```bash
# Сборка Docker-образа
docker build -t sferum-cabinet:latest .

# Запуск контейнера
docker run -d \
  -p 80:80 \
  -p 5050:5050 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e MAX_BOT_TOKEN="f9LHodD0cOJX1binrlWBycWED-mAlS-161FfBX83BtJMMXcyGKxxnz7oOhr9zWHrnXlyFVf9AeDTHSLo9m8o" \
  --name sferum-cabinet-app \
  sferum-cabinet:latest
```

### 4. Проверка статуса и логов работы
```bash
# Проверка запущенного контейнера
docker ps

# Просмотр логов в реальном времени
docker logs -f sferum-cabinet-app
```

### 5. Доступ к запущенным сервисам
* 🌐 **Веб-интерфейс «Сферум.Кабинет»:** [http://localhost](http://localhost)
* 📡 **REST API Status / Healthcheck:** [http://localhost:5050/api/system/status](http://localhost:5050/api/system/status)
* 📖 **API Swagger UI:** [http://localhost:5050/swagger](http://localhost:5050/swagger)

### 6. Остановка и удаление контейнера
```bash
# Если запускали через Docker Compose:
docker compose down

# Если запускали через Docker CLI:
docker stop sferum-cabinet-app && docker rm sferum-cabinet-app
```

---

## 💻 Пример запуска через командную строку (CLI без Docker)

Для локальной разработки и отладки компоненты можно запустить раздельно:

### 1. Запуск бэкенда (.NET ASP.NET Core)
```bash
cd backend/SferumCabinet.Api
dotnet run --urls "http://127.0.0.1:5050"
```

### 2. Запуск фронтенда (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
Фронтенд будет доступен по адресу: `http://localhost:5173`

### 3. Запуск бота MAX (Python)
```bash
# Установка библиотек из requirements.txt
pip install -r requirements.txt

# Запуск фонового демона бота
python bot_daemon.py
```

---

## 📦 Файл зависимостей (Requierments.txt)

В соответствии с требованиями регламента хакатона «Идея фикс», в корне репозитория размещены файлы `requirements.txt` и `Requierments.txt`:
```
requests>=2.32.3
urllib3>=2.3.0
python-docx>=1.2.0
python-pptx>=1.0.2
Pillow>=11.0.0
xlsxwriter>=3.2.2
openpyxl>=3.1.5
typing_extensions>=4.12.2
```

---

## 👥 Команда №23 «Девелопы» (МАОУ ЛИТ г. Новосибирска)

* **Басов Матвей** — Автор проекта, разработчик (МАОУ ЛИТ г. Новосибирска)
* **Лосив Роман Борисович** — Наставник команды, педагог МАОУ ЛИТ
