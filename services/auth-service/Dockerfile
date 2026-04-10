FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
# Clean install excluding the prisma local platform issues
RUN npm install
COPY prisma ./prisma/
COPY . .
RUN npx prisma generate
EXPOSE 5001
# Push DB schema before starting the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
