# Estágio de build para o front-end
FROM node:18-alpine AS build

# Define o diretório de trabalho para o front-end
WORKDIR /app/client

# Copia os arquivos de configuração do npm
COPY client/package*.json ./

# Instala as dependências
RUN npm ci

# Copia o código-fonte
COPY client .

# Roda o script de build do Vite
RUN npm run build

# --- Estágio para servir com Nginx ---
FROM nginx:alpine

# Remove a configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração customizada do Nginx
COPY client/nginx.conf /etc/nginx/conf.d/

# Copia os arquivos buildados do Vite para o Nginx
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]