FROM node:18-slim

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
EXPOSE 3004

# Start the payment service
CMD ["node", "src/index.js"] 