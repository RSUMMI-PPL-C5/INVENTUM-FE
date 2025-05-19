# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to optimize cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy all source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy package.json for runtime
COPY --from=builder /app/package.json ./package.json

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Install only production dependencies
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]