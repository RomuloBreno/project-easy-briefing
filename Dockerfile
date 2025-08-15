# Estágio de construção do frontend
FROM node:22 AS frontend-builder
WORKDIR /project/client

# Copia e instala dependências do frontend
COPY client/package*.json ./
RUN npm install

# Copia e build do frontend
COPY client .
RUN npm run build

# Estágio de produção
FROM node:22
WORKDIR /app

# 1. Instala apenas o backend
COPY server/package*.json ./server/
WORKDIR /project/server
RUN npm install --production

# 2. Copia o backend
COPY server .

# 3. Copia o frontend construído
COPY --from=frontend-builder /project/client/dist ./public

# 4. Verificação rápida
RUN ls -la public && \
    [ -f public/index.html ] || (echo "Erro: index.html não encontrado" && exit 1)

CMD ["node", "server.js"]
