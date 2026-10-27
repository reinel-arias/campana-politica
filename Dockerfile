# Etapa 1: instalar dependencias y compilar
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: imagen final, solo lo necesario para correr
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY next.config.mjs users.txt ./
EXPOSE 3000
CMD ["npm", "start"]
