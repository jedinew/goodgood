FROM node:18-alpine

WORKDIR /app

COPY package.json ./
# No deps

COPY src ./src

# Default env vars
ENV PORT=3000 \
    PUBLIC_DIR=/app/public \
    DATA_DIR=/data

CMD ["node", "src/server.js"]
