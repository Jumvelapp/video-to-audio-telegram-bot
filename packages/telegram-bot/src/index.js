require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { validateUrl, extractTimestamp } = require('./utils/urlUtils');
const { handleError } = require('./utils/errorHandler');
const { checkUserSubscription } = require('./services/authService');
const { addToQueue, checkQueueStatus } = require('./services/queueService');

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Telegisto_bot';
const bot = new TelegramBot(token, { polling: true });

// Welcome message
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;
  
  await bot.sendMessage(
    chatId,
    `Welcome to Telegisto, ${username}! 🎧\n\n` +
    `I can convert videos from YouTube, Twitch, Instagram, and Facebook into audio format, ` +
    `so you can listen to them like podcasts without using excessive data.\n\n` +
    `Simply send me a video link, and I'll convert it to audio for you.\n\n` +
    `Type /help to see all available commands.\n\n` +
    `You can also share me with your friends: @${botUsername}`
  );
});

// Help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(
    chatId,
    `*Telegisto Commands:*\n\n` +
    `/start - Start the bot\n` +
    `/help - Show this help message\n` +
    `/status - Check your subscription status\n` +
    `/queue - Check your conversion queue\n` +
    `/about - Learn more about Telegisto\n\n` +
    `*How to use:*\n` +
    `Simply send a video link from YouTube, Twitch, Instagram, or Facebook, and I'll convert it to audio.\n\n` +
    `*Pro Tip:*\n` +
    `If you send a YouTube link with a timestamp (e.g., ?t=120s), I'll start the conversion from that point.\n\n` +
    `Share me with your friends: @${botUsername}`,
    { parse_mode: 'Markdown' }
  );
});

// About command
bot.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(
    chatId,
    `*About Telegisto*\n\n` +
    `Telegisto helps you save data and battery by converting videos to audio format.\n\n` +
    `*Benefits:*\n` +
    `• Save on data costs\n` +
    `• Listen offline without premium subscriptions\n` +
    `• Enjoy video content as podcasts\n` +
    `• Save battery life\n` +
    `• Listen in the background\n\n` +
    `Visit our website at [telegisto.com](https://telegisto.com) to learn more and manage your subscription.\n\n` +
    `Share me with your friends: @${botUsername}`,
    { parse_mode: 'Markdown' }
  );
});

// Status command
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const subscription = await checkUserSubscription(userId);
    
    let message = `*Your Subscription:* ${subscription.plan}\n`;
    message += `*Status:* ${subscription.status}\n`;
    
    if (subscription.expiresAt) {
      message += `*Expires:* ${new Date(subscription.expiresAt).toLocaleDateString()}\n`;
    }
    
    message += `\n*Conversions:*\n`;
    message += `• This month: ${subscription.usageThisMonth}/${subscription.monthlyLimit || 'Unlimited'}\n`;
    message += `• Simultaneous: ${subscription.simultaneousLimit}\n`;
    
    if (subscription.plan === 'free') {
      message += `\n*Upgrade to Premium* for more conversions and no waiting time between conversions!`;
    }
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    handleError(bot, chatId, error);
  }
});

// Queue command
bot.onText(/\/queue/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const queueStatus = await checkQueueStatus(userId);
    
    if (queueStatus.length === 0) {
      await bot.sendMessage(chatId, "You don't have any conversions in the queue.");
      return;
    }
    
    let message = "*Your Conversion Queue:*\n\n";
    
    queueStatus.forEach((item, index) => {
      message += `${index + 1}. ${item.title || 'Unknown'}\n`;
      message += `   Status: ${item.status}\n`;
      if (item.estimatedTimeRemaining) {
        message += `   Est. time: ${item.estimatedTimeRemaining}\n`;
      }
      message += '\n';
    });
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    handleError(bot, chatId, error);
  }
});

// Handle video links
bot.on('message', async (msg) => {
  // Skip commands
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;
  
  // Check if the message contains a URL
  if (!messageText || !validateUrl(messageText)) return;
  
  try {
    // Check user subscription
    const subscription = await checkUserSubscription(userId);
    
    // Check if user can convert more videos
    if (subscription.usageThisMonth >= subscription.monthlyLimit && subscription.monthlyLimit !== null) {
      await bot.sendMessage(
        chatId,
        "You've reached your monthly conversion limit. Please upgrade your subscription to continue."
      );
      return;
    }
    
    // Check if user is on cooldown (free tier)
    if (subscription.plan === 'free' && subscription.onCooldown) {
      await bot.sendMessage(
        chatId,
        `You need to wait ${subscription.cooldownRemaining} minutes before your next conversion. ` +
        `Upgrade to a paid plan to remove this restriction!`
      );
      return;
    }
    
    // Extract timestamp if present
    const timestamp = extractTimestamp(messageText);
    
    // Send acknowledgment
    const processingMessage = await bot.sendMessage(
      chatId,
      "I'm processing your request. This may take a few minutes depending on the video length..."
    );
    
    // Add to conversion queue
    const queueResult = await addToQueue({
      userId,
      url: messageText,
      timestamp,
      chatId,
      messageId: processingMessage.message_id
    });
    
    // Send queue position message
    if (queueResult.position > 1) {
      await bot.sendMessage(
        chatId,
        `Your video has been added to the queue at position ${queueResult.position}. ` +
        `I'll send you the audio once it's ready!`
      );
    }
  } catch (error) {
    handleError(bot, chatId, error);
  }
});

// Start Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Telegram bot service running on port ${PORT}`);
  logger.info(`Bot username: @${botUsername}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  bot.stopPolling();
  process.exit(0);
}); 