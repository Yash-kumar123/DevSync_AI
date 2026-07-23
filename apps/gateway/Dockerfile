FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/gateway/package.json apps/gateway/package.json
COPY apps/ai-service/package.json apps/ai-service/package.json
COPY packages ./packages

RUN npm ci

COPY . .

RUN npm run build --workspace=@devsync/shared-types
RUN npx prisma generate --schema=apps/gateway/prisma/schema.prisma
RUN npm run build --workspace=@devsync/gateway

EXPOSE 4000

CMD ["npm", "run", "start", "--workspace", "@devsync/gateway"]

