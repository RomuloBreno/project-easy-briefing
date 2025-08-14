# Use a imagem oficial do Node.js
FROM node:22

# Definir diretório de trabalho
WORKDIR /project

# Copiar arquivos de configuração primeiro para aproveitar o cache de build do Docker
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instalar dependências de todos os pacotes
RUN npm install
RUN npm run install:all

# Copiar todo o restante do código
COPY . .

# Build do frontend (Vite)
RUN npm run build --prefix client

# Copiar build do frontend para o backend servir
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# Expor apenas a porta do backend (que também serve o frontend)
EXPOSE 3000 80

# Usar a forma de shell para o comando
# Isso garante que o shell (como /bin/sh) procure o comando npm no PATH
CMD npm run start