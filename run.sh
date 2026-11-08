#!/bin/bash
# ========================================================
# «СФЕРУМ.КАБИНЕТ» — Скрипт быстрого запуска платформы
# Стек: C# (.NET 10) + MySQL/SQLite + React (VKUI) + Cloudflare
# ========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "🚀 Запуск «СФЕРУМ.КАБИНЕТ» (МАОУ ЛИТ г. Новосибирск)"
echo "=================================================="

# 1. Запуск C# .NET 10 API бэкенда на порту 5050
echo "▶ [1/3] Запуск C# .NET 10 ASP.NET Core API (порт 5050)..."
cd "$DIR/backend/SferumCabinet.Api"
dotnet run --urls "http://127.0.0.1:5050" &
BACKEND_PID=$!
cd "$DIR"

# Ждем старта бэкенда
sleep 2

# 2. Запуск Vite React VKUI фронтенда на порту 5173
echo "▶ [2/3] Запуск React/VKUI фронтенда (порт 5173)..."
cd "$DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd "$DIR"

echo ""
echo "=================================================="
echo "✅ Платформа успешно запущена локально!"
echo "👉 Локальный адрес: http://localhost:5173"
echo "👉 API Swagger / Core: http://localhost:5050"
echo "=================================================="
echo ""
echo "🌐 Для публикации в Cloudflare Tunnel выполните в соседнем терминале:"
echo "   cloudflared tunnel --url http://localhost:5173"
echo ""
echo "   (Либо через npx localtunnel --port 5173)"
echo "=================================================="

# Остановка обоих процессов при выходе
trap "echo 'Остановка серверов...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
