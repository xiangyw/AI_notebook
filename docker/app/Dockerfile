# ===========================================
# Notebook App - Multi-stage Dockerfile
# ===========================================

# -------------------------------------------
# Stage 1: Build Client
# -------------------------------------------
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./

RUN npm run build

# -------------------------------------------
# Stage 2: Build Server
# -------------------------------------------
FROM node:20-alpine AS server-builder

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server/ ./

RUN npm run build

# -------------------------------------------
# Stage 3: Production
# -------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./
RUN npm install --only=production

# Copy built files
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server/dist ./server/dist

# Create data directories
RUN mkdir -p /app/data/notes /app/data/config

# Install curl for health check
RUN apk add --no-cache curl

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server/dist/index.js"]
