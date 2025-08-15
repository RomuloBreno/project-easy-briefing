# Etapa de construção (Build Stage)
FROM node:22 AS build-stage

# Define o diretório de trabalho dentro do container
WORKDIR /project

# 1. Otimização de cache - Copia arquivos de configuração primeiro
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY server/tsconfig*.json ./server/
COPY client/vite.config.ts ./client/

# 2. Instala dependências com cache limpo
WORKDIR /project/server
RUN npm clean-install

WORKDIR /project/client
RUN npm clean-install

# 3. Copia o restante do código
WORKDIR /project
COPY . .

# 4. Adiciona variáveis de ambiente para o build
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 5. Constrói o frontend com cache dedicado
WORKDIR /project/client
RUN npm run build

# 6. Cria estrutura de diretórios de forma mais robusta
RUN mkdir -p ../server/public && \
    cp -r dist/* ../server/public/ && \
    cp ../client/src/assets/favicon.ico ../server/public/ || true

# Etapa final de produção (Production Stage)
FROM node:22 AS production-stage

# 7. Configura usuário não-root para segurança
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

WORKDIR /project/server

# 8. Copia apenas o necessário
COPY --from=build-stage --chown=appuser:appuser /project/server/package*.json ./
COPY --from=build-stage --chown=appuser:appuser /project/server/tsconfig*.json ./
RUN npm install --production

COPY --from=build-stage --chown=appuser:appuser /project/server/ ./

# 9. Configurações de saúde e monitoramento
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 10. Permissões e segurança
RUN chown -R appuser:appuser /project && \
    chmod -R 755 /project

USER appuser

EXPOSE 3000

# 11. Usando node diretamente é mais eficiente que npm run
CMD ["node", "server.js"]