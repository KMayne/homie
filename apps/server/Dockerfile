FROM node:22-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy packages
COPY packages ./packages

# Copy server app
COPY apps/server ./apps/server

# Install dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to server
WORKDIR /app/apps/server

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["pnpm", "start"]
