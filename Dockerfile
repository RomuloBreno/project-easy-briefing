# Build da aplicação
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Servir build estática com nginx
FROM nginx:alpine

# Remover configuração default
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada do nginx para lidar com SPA
COPY client/nginx.conf /etc/nginx/conf.d/

# Copiar os arquivos buildados do Vite para pasta pública do nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
