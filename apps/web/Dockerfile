# Build stage
FROM node:24-bullseye AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy app package files
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web

# Build the application
RUN pnpm --filter=web build

# Production stage
FROM node:24-bullseye AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/package.json ./

# Install production dependencies only
RUN pnpm install --prod

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]