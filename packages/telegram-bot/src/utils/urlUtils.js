/**
 * Validates if a string is a URL from a supported platform
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid and from a supported platform
 */
function validateUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Check if the URL is from a supported platform
    const supportedDomains = [
      'youtube.com', 'youtu.be',
      'twitch.tv',
      'instagram.com',
      'facebook.com', 'fb.com',
      'vimeo.com',
      'dailymotion.com',
      'tiktok.com'
    ];
    
    return supportedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (error) {
    return false;
  }
}

/**
 * Extracts timestamp from a URL if present
 * @param {string} url - The URL to extract timestamp from
 * @returns {number|null} - The timestamp in seconds, or null if not found
 */
function extractTimestamp(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // YouTube timestamp formats
    const tParam = urlObj.searchParams.get('t');
    if (tParam) {
      // Handle formats like t=120s, t=2m30s, t=1h2m30s
      if (tParam.includes('h') || tParam.includes('m') || tParam.includes('s')) {
        let seconds = 0;
        
        // Extract hours
        const hoursMatch = tParam.match(/(\d+)h/);
        if (hoursMatch) {
          seconds += parseInt(hoursMatch[1]) * 3600;
        }
        
        // Extract minutes
        const minutesMatch = tParam.match(/(\d+)m/);
        if (minutesMatch) {
          seconds += parseInt(minutesMatch[1]) * 60;
        }
        
        // Extract seconds
        const secondsMatch = tParam.match(/(\d+)s/);
        if (secondsMatch) {
          seconds += parseInt(secondsMatch[1]);
        }
        
        return seconds;
      }
      
      // Handle numeric format
      return parseInt(tParam);
    }
    
    // YouTube timestamp in URL fragment
    const hashParams = urlObj.hash.substring(1).split('&');
    for (const param of hashParams) {
      if (param.startsWith('t=')) {
        return parseInt(param.substring(2));
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the platform name from a URL
 * @param {string} url - The URL to get platform from
 * @returns {string} - The platform name
 */
function getPlatform(url) {
  if (!url) return 'Unknown';
  
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtube') || urlObj.hostname.includes('youtu.be')) {
      return 'YouTube';
    } else if (urlObj.hostname.includes('twitch')) {
      return 'Twitch';
    } else if (urlObj.hostname.includes('instagram')) {
      return 'Instagram';
    } else if (urlObj.hostname.includes('facebook') || urlObj.hostname.includes('fb.com')) {
      return 'Facebook';
    } else if (urlObj.hostname.includes('vimeo')) {
      return 'Vimeo';
    } else if (urlObj.hostname.includes('dailymotion')) {
      return 'Dailymotion';
    } else if (urlObj.hostname.includes('tiktok')) {
      return 'TikTok';
    } else {
      return 'Unknown';
    }
  } catch (error) {
    return 'Unknown';
  }
}

module.exports = {
  validateUrl,
  extractTimestamp,
  getPlatform
}; 