# Use Node.js 24 latest official image
FROM node:24-alpine

# Create app directory inside container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application source
COPY . .

# Expose the bot's port
EXPOSE 3978

# Start the bot
CMD ["npm", "start"]