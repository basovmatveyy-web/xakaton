#!/bin/bash
# ========================================================
# «СФЕРУМ.КАБИНЕТ» — Деплой на Cloudflare Pages
# ========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "⚡ Сборка и деплой «СФЕРУМ.КАБИНЕТ» на Cloudflare Pages"
echo "=================================================="

# 1. Сборка фронтенда
echo "▶ [1/3] Сборка оптимизированного продакшн-бандла..."
cd "$DIR/frontend"
npm run build
cp public/_redirects dist/_redirects 2>/dev/null || true
cp public/_headers dist/_headers 2>/dev/null || true
cd "$DIR"

echo "▶ [2/3] Бандл готов в папке frontend/dist!"

# 2. Деплой через Wrangler
echo "▶ [3/3] Отправка на Cloudflare Pages..."
echo "Если вы еще не авторизованы в Cloudflare, сейчас откроется браузер для входа."
echo ""

npx wrangler pages deploy "$DIR/frontend/dist" --project-name sferum-cabinet --commit-dirty=true

echo ""
echo "=================================================="
echo "🎉 Проект успешно развернут на Cloudflare Pages!"
echo "👉 Скопируйте полученную ссылку https://sferum-cabinet.pages.dev"
echo "👉 Вставьте её в dev.vk.com в настройки вашего VK Mini App!"
echo "=================================================="
