# Stage 1: Build
FROM node:22 AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
WORKDIR /app

# Accept build args for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_SENTRY_DSN

# Copy package files first for better caching
COPY package.json package-lock.json ./
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Create .env.local with the build args
RUN echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > .env.local && \
    echo "NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}" >> .env.local && \
    echo "NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}" >> .env.local && \
    echo "NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}" >> .env.local

# Add optional variables if provided
RUN if [ ! -z "${NEXT_PUBLIC_SENTRY_DSN}" ]; then \
        echo "NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}" >> .env.local; \
    fi

# Verify environment variables
RUN echo "=== Building with environment variables ===" && \
    cat .env.local

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]