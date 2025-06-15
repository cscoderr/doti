# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as needed
ARG NODE_VERSION=22.15.1
FROM node:${NODE_VERSION} AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# ================================
# BUILD STAGE
# ================================
FROM base AS build

# Install packages needed to build native modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python-is-python3

# Install dependencies
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy .env and app source code
COPY . .

# Create XMTP data directory
RUN mkdir -p .data/xmtp

# Build the application
RUN npm run build

# Prune dev dependencies
RUN npm prune --omit=dev

# ================================
# FINAL PRODUCTION STAGE
# ================================
FROM base

# Optional: Install curl to help with runtime debugging (network, XMTP endpoint etc.)
RUN apt-get update && apt-get install --no-install-recommends -y curl

# Copy built app and pruned dependencies
COPY --from=build /app /app

# Ensure .data is writable at runtime
RUN mkdir -p /app/.data/xmtp && chmod -R 777 /app/.data

# Expose your app port
EXPOSE 3000

# Default command
CMD [ "npm", "run", "start" ]
