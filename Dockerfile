# ==========================================
# 1. Сборка фронтенда (React + Vite + VKUI)
# ==========================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY frontend/ ./
RUN npm run build

# ==========================================
# 2. Сборка бэкенда (.NET ASP.NET Core)
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-builder
WORKDIR /src

COPY backend/SferumCabinet.Api/SferumCabinet.Api.csproj ./backend/SferumCabinet.Api/
RUN sed -i 's/<TargetFramework>net10.0<\/TargetFramework>/<TargetFramework>net9.0<\/TargetFramework>/g' ./backend/SferumCabinet.Api/SferumCabinet.Api.csproj || true
RUN dotnet restore ./backend/SferumCabinet.Api/SferumCabinet.Api.csproj

COPY backend/ ./backend/
RUN dotnet publish ./backend/SferumCabinet.Api/SferumCabinet.Api.csproj -c Release -o /app/publish /p:TargetFramework=net9.0

# ==========================================
# 3. Финальный образ (Nginx + .NET API + Python Bot)
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Установка Nginx, Python и зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Копируем опубликованный бэкенд
COPY --from=backend-builder /app/publish ./api

# Копируем собранный фронтенд в Nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Копируем Python-скрипты и зависимости
COPY requirements.txt bot_daemon.py ./
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Конфигурация Nginx
RUN rm /etc/nginx/sites-enabled/default
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location /api/ {\n\
        proxy_pass http://127.0.0.1:5050/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection keep-alive;\n\
        proxy_set_header Host $host;\n\
        proxy_cache_bypass $http_upgrade;\n\
    }\n\
}\n' > /etc/nginx/conf.d/sferum.conf

# Конфигурация Supervisor для запуска Nginx, .NET API и Python Bot
RUN printf '[supervisord]\n\
nodaemon=true\n\
user=root\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
\n\
[program:dotnet_api]\n\
directory=/app/api\n\
command=dotnet SferumCabinet.Api.dll --urls "http://127.0.0.1:5050"\n\
autostart=true\n\
autorestart=true\n\
environment=ASPNETCORE_ENVIRONMENT="Production"\n\
\n\
[program:max_bot]\n\
directory=/app\n\
command=/app/venv/bin/python bot_daemon.py\n\
autostart=true\n\
autorestart=true\n' > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:5050/api/system/status || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
