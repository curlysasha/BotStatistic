#!/bin/bash

echo "🚀 Запуск BotStatisticMCP серверов..."

# Запуск Flask API в фоне
echo "📊 Запуск Flask API сервера..."
python3 server.py &
FLASK_PID=$!

# Ждем запуска Flask
sleep 3

# Запуск React фронтенда
echo "⚛️  Запуск React фронтенда..."
cd frontend
npm run dev

# Если React остановлен, останавливаем Flask
echo "🛑 Остановка серверов..."
kill $FLASK_PID