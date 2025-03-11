const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/telegisto';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { connectDB }; 