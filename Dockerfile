FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ ./
COPY --from=client-build /app/client/dist ./public
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV DB_PATH=/app/data/quizfire.db
EXPOSE 3001
CMD ["node", "index.js"]
