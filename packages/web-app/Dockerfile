FROM node:18-slim AS builder

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Production image
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"] 