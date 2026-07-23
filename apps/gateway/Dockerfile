FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/gateway/package.json apps/gateway/package.json
COPY apps/ai-service/package.json apps/ai-service/package.json
COPY packages ./packages

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev", "--workspace", "@devsync/gateway"]
