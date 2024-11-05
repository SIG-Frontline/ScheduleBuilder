FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .

RUN npm i -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build
RUN pnpm prune --prod

FROM nginx:alpine AS deployer

WORKDIR /app

COPY --from=builder /app/frontend.conf /etc/nginx/conf.d/frontend.conf 
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]