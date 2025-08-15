# Estágio de construção do frontend
FROM node:22 AS frontend-builder
WORKDIR /project/client

# 1. Copia arquivos de dependência primeiro (otimização de cache)
COPY client/package*.json ./
COPY client/vite.config.ts ./

# 2. Instala dependências com verificação
RUN npm install || (echo "❌ Falha na instalação das dependências" && exit 1)

# 3. Copia o restante do código fonte
COPY client .

# 4. Executa o build com verificação em etapas
RUN echo "Iniciando build do frontend..." && \
    npm run build || (echo "❌ Build script falhou" && exit 1) && \
    echo "Verificando arquivos gerados..." && \
    ls -la dist && \
    if [ ! -f dist/index.html ]; then \
      echo "❌ index.html não encontrado após build"; \
      echo "Conteúdo do diretório dist:"; \
      ls -la dist; \
      exit 1; \
    fi && \
    echo "✅ Build do frontend concluído com sucesso"

# Estágio de produção
FROM node:22
WORKDIR /project

# 1. Cria estrutura de diretórios
RUN mkdir -p server/public

# 2. Instala backend
COPY server/package*.json ./server/
WORKDIR /project/server
RUN npm install --production

# 3. Copia backend
COPY server .

# 4. Copia frontend construído
COPY --from=frontend-builder /project/client/dist ./public

# 5. Verificação final
RUN echo "Verificando arquivos estáticos finais..." && \
    ls -la public && \
    [ -f public/index.html ] || (echo "❌ Arquivo index.html não encontrado" && exit 1)

EXPOSE 3000
CMD ["node", "server.js"]