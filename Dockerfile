# Estágio de construção do frontend
FROM node:22 AS frontend-builder
WORKDIR /project/client

# 1. Copia primeiro apenas o necessário para instalação
COPY client/package*.json ./
RUN npm install

# 2. Copia o restante do código e executa o build
COPY client .
RUN npm run build && \
    ls -la dist && \
    [ -f dist/index.html ] || (echo "❌ Build do frontend falhou - index.html não encontrado" && exit 1)

# Estágio de produção
FROM node:22
WORKDIR /project

# 1. Instala apenas o backend
COPY server/package*.json ./server/
WORKDIR /project/server
RUN npm install --production

# 2. Copia o backend
COPY server .

# 3. Cria diretório public e copia o frontend
RUN mkdir -p public
COPY --from=frontend-builder /project/client/dist ./public

# 4. Verificação final
RUN ls -la public && \
    [ -f public/index.html ] || (echo "❌ Arquivos do frontend não encontrados" && exit 1)

EXPOSE 3000
CMD ["node", "server.js"]