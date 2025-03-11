const logger = require('./logger');

/**
 * Handles errors in the Telegram bot
 * @param {TelegramBot} bot - The Telegram bot instance
 * @param {number} chatId - The chat ID to send error message to
 * @param {Error} error - The error object
 */
function handleError(bot, chatId, error) {
  logger.error(`Error: ${error.message}`, { stack: error.stack });
  
  // Determine user-friendly error message
  let userMessage = 'Sorry, something went wrong. Please try again later.';
  
  if (error.name === 'ValidationError') {
    userMessage = 'The URL you provided is not valid or not from a supported platform.';
  } else if (error.name === 'DownloadError') {
    userMessage = 'I could not download the video. It might be private, age-restricted, or unavailable.';
  } else if (error.name === 'ConversionError') {
    userMessage = 'I had trouble converting the video to audio. Please try a different video.';
  } else if (error.name === 'SubscriptionError') {
    userMessage = 'There was an issue with your subscription. Please check your status with /status.';
  } else if (error.name === 'QueueError') {
    userMessage = 'There was an issue adding your request to the queue. Please try again.';
  } else if (error.name === 'TimeoutError') {
    userMessage = 'The operation timed out. This might happen with very long videos. Please try a shorter video.';
  }
  
  // Send error message to user
  bot.sendMessage(chatId, userMessage).catch(err => {
    logger.error(`Failed to send error message: ${err.message}`);
  });
}

/**
 * Custom error classes
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DownloadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DownloadError';
  }
}

class ConversionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConversionError';
  }
}

class SubscriptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

class QueueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'QueueError';
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

module.exports = {
  handleError,
  ValidationError,
  DownloadError,
  ConversionError,
  SubscriptionError,
  QueueError,
  TimeoutError
}; 