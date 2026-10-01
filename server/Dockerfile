FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma/
RUN npm install
COPY tsconfig.json ./
COPY jest.config.ts ./
COPY src ./src/
RUN npm run build
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3001
CMD ["/bin/sh", "docker-entrypoint.sh"]
