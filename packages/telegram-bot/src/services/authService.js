const axios = require('axios');
const logger = require('../utils/logger');
const { SubscriptionError } = require('../utils/errorHandler');

/**
 * Check user subscription status
 * @param {number} userId - Telegram user ID
 * @returns {Promise<Object>} - User subscription details
 */
async function checkUserSubscription(userId) {
  try {
    // In a real implementation, this would call the user service
    // For now, we'll simulate the response
    
    // Simulate API call to user service
    // const response = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}/subscription`);
    // return response.data;
    
    // Simulated response
    const subscriptionPlans = {
      free: {
        plan: 'free',
        status: 'active',
        monthlyLimit: 5,
        simultaneousLimit: 1,
        cooldownMinutes: 15
      },
      standard: {
        plan: 'standard',
        status: 'active',
        monthlyLimit: 50,
        simultaneousLimit: 5,
        cooldownMinutes: 0
      },
      premium: {
        plan: 'premium',
        status: 'active',
        monthlyLimit: null, // unlimited
        simultaneousLimit: 10,
        cooldownMinutes: 0
      }
    };
    
    // Simulate user data - in production this would come from the database
    const mockUserData = {
      userId,
      plan: userId % 10 === 0 ? 'premium' : (userId % 3 === 0 ? 'standard' : 'free'),
      status: 'active',
      expiresAt: userId % 5 === 0 ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      usageThisMonth: userId % 7, // Random usage
      lastConversionTime: userId % 3 === 0 ? new Date(Date.now() - 20 * 60 * 1000) : null // 20 minutes ago for some users
    };
    
    const planDetails = subscriptionPlans[mockUserData.plan];
    
    // Check if user is on cooldown (for free tier)
    let onCooldown = false;
    let cooldownRemaining = 0;
    
    if (planDetails.cooldownMinutes > 0 && mockUserData.lastConversionTime) {
      const cooldownEnds = new Date(mockUserData.lastConversionTime.getTime() + planDetails.cooldownMinutes * 60 * 1000);
      const now = new Date();
      
      if (cooldownEnds > now) {
        onCooldown = true;
        cooldownRemaining = Math.ceil((cooldownEnds - now) / (60 * 1000)); // minutes remaining
      }
    }
    
    return {
      ...planDetails,
      ...mockUserData,
      onCooldown,
      cooldownRemaining
    };
  } catch (error) {
    logger.error(`Error checking user subscription: ${error.message}`);
    throw new SubscriptionError('Failed to check subscription status');
  }
}

/**
 * Validate Telegram username
 * @param {string} username - Telegram username to validate
 * @returns {Promise<boolean>} - Whether the username is valid
 */
async function validateTelegramUsername(username) {
  try {
    // In a real implementation, this would verify the username with Telegram API
    // or check against our database of registered users
    
    // For now, we'll just do basic validation
    if (!username) return false;
    
    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    
    // Basic validation: 5+ alphanumeric chars or underscores
    return /^[a-zA-Z0-9_]{5,}$/.test(cleanUsername);
  } catch (error) {
    logger.error(`Error validating Telegram username: ${error.message}`);
    return false;
  }
}

/**
 * Update user's conversion usage
 * @param {number} userId - Telegram user ID
 * @returns {Promise<void>}
 */
async function updateUserUsage(userId) {
  try {
    // In a real implementation, this would call the user service to update usage
    // For now, we'll just log it
    logger.info(`Updated usage for user ${userId}`);
  } catch (error) {
    logger.error(`Error updating user usage: ${error.message}`);
    // We don't throw here to avoid interrupting the conversion process
  }
}

module.exports = {
  checkUserSubscription,
  validateTelegramUsername,
  updateUserUsage
}; 