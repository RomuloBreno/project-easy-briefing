# Estágio de construção do frontend
FROM node:22 AS frontend-builder
WORKDIR /project/client

# 1. Cria o diretório dist explicitamente
RUN mkdir -p dist

# 2. Copia e instala dependências do frontend
COPY client/package*.json ./
RUN npm install

# 3. Copia e build do frontend
COPY client .
RUN npm run build

# Verificação do build
RUN ls -la dist && \
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
RUN echo "Conteúdo de public:" && ls -la public && \
    [ -f public/index.html ] || (echo "❌ Arquivos do frontend não encontrados" && exit 1)

EXPOSE 3000
CMD ["node", "server.js"]