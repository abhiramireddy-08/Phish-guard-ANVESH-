FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for layer caching)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create logs directory
RUN mkdir -p logs

EXPOSE 5000

CMD ["node", "src/index.js"]
