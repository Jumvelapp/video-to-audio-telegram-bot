const axios = require('axios');
const logger = require('../utils/logger');
const { QueueError } = require('../utils/errorHandler');
const { getPlatform } = require('../utils/urlUtils');
const { updateUserUsage } = require('./authService');

// In-memory queue for demo purposes
// In production, this would be stored in a database or message queue
const conversionQueue = [];
let queueCounter = 0;

/**
 * Add a conversion request to the queue
 * @param {Object} request - The conversion request
 * @param {number} request.userId - Telegram user ID
 * @param {string} request.url - Video URL
 * @param {number|null} request.timestamp - Starting timestamp in seconds
 * @param {number} request.chatId - Telegram chat ID
 * @param {number} request.messageId - Telegram message ID for the processing message
 * @returns {Promise<Object>} - Queue position information
 */
async function addToQueue(request) {
  try {
    // In a real implementation, this would call the conversion service
    // For now, we'll simulate the queue
    
    // Get video information (in production, this would be done by the conversion service)
    const videoInfo = await simulateGetVideoInfo(request.url);
    
    // Create queue item
    const queueItem = {
      id: ++queueCounter,
      userId: request.userId,
      url: request.url,
      timestamp: request.timestamp,
      chatId: request.chatId,
      messageId: request.messageId,
      platform: getPlatform(request.url),
      title: videoInfo.title,
      duration: videoInfo.duration,
      status: 'queued',
      createdAt: new Date(),
      estimatedTimeRemaining: calculateEstimatedTime(videoInfo.duration, conversionQueue.length)
    };
    
    // Add to queue
    conversionQueue.push(queueItem);
    
    // In a real implementation, we would notify the conversion service
    // For now, we'll simulate processing
    simulateProcessQueue();
    
    return {
      position: conversionQueue.length,
      estimatedTime: queueItem.estimatedTimeRemaining
    };
  } catch (error) {
    logger.error(`Error adding to queue: ${error.message}`);
    throw new QueueError('Failed to add conversion to queue');
  }
}

/**
 * Check queue status for a user
 * @param {number} userId - Telegram user ID
 * @returns {Promise<Array>} - User's queue items
 */
async function checkQueueStatus(userId) {
  try {
    // Filter queue for user's items
    return conversionQueue.filter(item => item.userId === userId);
  } catch (error) {
    logger.error(`Error checking queue status: ${error.message}`);
    throw new QueueError('Failed to check queue status');
  }
}

/**
 * Simulate getting video information
 * @param {string} url - Video URL
 * @returns {Promise<Object>} - Video information
 */
async function simulateGetVideoInfo(url) {
  // In a real implementation, this would call a service to get video info
  // For now, we'll generate random data
  
  // Extract video ID or use part of the URL
  let videoId;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube')) {
      videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
    } else {
      videoId = urlObj.pathname.split('/').pop();
    }
  } catch (error) {
    videoId = url.substring(url.lastIndexOf('/') + 1);
  }
  
  // Generate a title based on the platform
  const platform = getPlatform(url);
  const titles = {
    'YouTube': [
      'How to Build a Web App in 10 Minutes',
      'The Future of AI Explained',
      'Learn JavaScript in 2023',
      'Top 10 Programming Languages',
      'Building Microservices Architecture'
    ],
    'Twitch': [
      'Coding Session: Building a Game',
      'Live Coding: React App from Scratch',
      'Gaming Stream Highlights',
      'Tech Talk: Future of Web Development',
      'Hackathon Live Stream'
    ],
    'Instagram': [
      'Travel Vlog: Tokyo Adventure',
      'Cooking Tutorial: Perfect Pasta',
      'Fitness Routine for Developers',
      'Tech Review: Latest Gadgets',
      'Day in the Life of a Developer'
    ],
    'Facebook': [
      'Conference Talk: Scaling Applications',
      'Product Launch Event',
      'Tech Meetup Highlights',
      'Interview with Tech Leaders',
      'Workshop: Cloud Deployment'
    ],
    'Unknown': [
      'Interesting Video Content',
      'Educational Tutorial',
      'Entertainment Stream',
      'Informative Presentation',
      'Creative Content'
    ]
  };
  
  const platformTitles = titles[platform] || titles['Unknown'];
  const title = platformTitles[Math.floor(Math.random() * platformTitles.length)];
  
  // Random duration between 3 and 30 minutes
  const duration = Math.floor(Math.random() * 27 * 60) + 3 * 60;
  
  return {
    id: videoId,
    title,
    duration,
    platform
  };
}

/**
 * Calculate estimated time for conversion
 * @param {number} duration - Video duration in seconds
 * @param {number} queuePosition - Position in queue
 * @returns {string} - Estimated time string
 */
function calculateEstimatedTime(duration, queuePosition) {
  // Assume conversion takes roughly 1/4 of the video duration
  // plus 30 seconds of overhead per video
  const conversionTime = Math.ceil(duration / 4) + 30;
  
  // Add time for videos ahead in queue (simplified)
  const queueTime = queuePosition * 60; // Assume 1 minute per queued item
  
  const totalSeconds = conversionTime + queueTime;
  
  // Format as minutes or hours and minutes
  if (totalSeconds < 60) {
    return 'less than a minute';
  } else if (totalSeconds < 3600) {
    return `about ${Math.ceil(totalSeconds / 60)} minutes`;
  } else {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.ceil((totalSeconds % 3600) / 60);
    return `about ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

/**
 * Simulate processing the queue
 */
function simulateProcessQueue() {
  // Process the first item in the queue
  if (conversionQueue.length > 0 && conversionQueue[0].status === 'queued') {
    const item = conversionQueue[0];
    item.status = 'processing';
    
    logger.info(`Processing queue item: ${item.id}`);
    
    // Simulate conversion time (faster for demo purposes)
    const processingTime = Math.min(item.duration / 10, 10) * 1000; // Max 10 seconds
    
    setTimeout(() => {
      item.status = 'completed';
      logger.info(`Completed queue item: ${item.id}`);
      
      // In a real implementation, this would send the audio file to the user
      // and update the user's usage statistics
      simulateSendAudio(item);
      updateUserUsage(item.userId);
      
      // Remove from queue after a delay
      setTimeout(() => {
        const index = conversionQueue.findIndex(i => i.id === item.id);
        if (index !== -1) {
          conversionQueue.splice(index, 1);
        }
        
        // Process next item
        simulateProcessQueue();
      }, 5000);
    }, processingTime);
  }
}

/**
 * Simulate sending audio to the user
 * @param {Object} item - Queue item
 */
function simulateSendAudio(item) {
  logger.info(`Simulating sending audio for queue item: ${item.id}`);
  
  // In a real implementation, this would use the Telegram bot to send the audio file
  // For now, we'll just log it
  logger.info(`Audio for "${item.title}" would be sent to chat ${item.chatId}`);
}

module.exports = {
  addToQueue,
  checkQueueStatus
}; 