FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
RUN npm install pnpm -g
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 4173

CMD ["pnpm", "run", "preview", "--host"]
