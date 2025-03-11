FROM node:18-slim

# Install FFmpeg and other dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install youtube-dl
RUN pip3 install youtube-dl

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3002

# Start the conversion service
CMD ["node", "src/index.js"] 