# Stage 1: Build
FROM node:22 AS builder
WORKDIR /app

# Copy package files first to optimize cache
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code & build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22 AS production

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app

# Copy only necessary artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3000
CMD ["npm", "start"]