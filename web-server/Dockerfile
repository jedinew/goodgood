FROM node:18-alpine

WORKDIR /app

# Context is root (.)
COPY web-server/package.json ./
# No deps

COPY web-server/src ./src

# Copy static assets into the image
COPY web ./public

# Default env vars
ENV PORT=3000 \
    PUBLIC_DIR=/app/public \
    DATA_DIR=/data

CMD ["node", "src/server.js"]
