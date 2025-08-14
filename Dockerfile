# --- Estágio 1: Build do Front-end (Cliente) ---
FROM node:18-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client .
RUN npm run build


# --- Estágio 2: Build do Back-end (Servidor) ---
FROM node:18-alpine AS server-build

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server .

# Roda o script de build para compilar o TypeScript
RUN npm run build


# --- Estágio 3: Imagem Final (Produção) ---
# Usa uma imagem Node.js mais leve para o runtime do servidor
FROM node:18-alpine AS final

WORKDIR /app

# Copia os arquivos do servidor compilados do estágio anterior
COPY --from=server-build /app/server/dist /app/server/dist

# Copia os arquivos do front-end buildados do estágio anterior
COPY --from=client-build /app/client/dist /app/client/dist

# Copia os arquivos de configuração do servidor
COPY server/package*.json /app/server/
COPY server/package-lock.json /app/server/
COPY server/.env /app/server/

# Define os diretórios de trabalho
WORKDIR /app/server

# Instala as dependências de produção para o servidor
RUN npm ci --only=production

# Expõe as portas necessárias
EXPOSE 3000

# Comando para iniciar o servidor, que servirá o front-end
CMD ["npm", "start"]