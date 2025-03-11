#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from .env.example"
fi

# Create logs directories
mkdir -p packages/telegram-bot/logs
mkdir -p packages/conversion-service/logs
mkdir -p packages/user-service/logs
mkdir -p packages/payment-service/logs

# Start the services
docker-compose up -d

echo "Development environment started!"
echo "Access the web app at: http://localhost:3000"
echo "Telegram bot is running with username: @Telegisto_bot"
echo ""
echo "To view logs: docker-compose logs -f [service-name]"
echo "To stop: docker-compose down" 