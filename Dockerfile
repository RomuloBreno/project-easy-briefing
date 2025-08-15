# Etapa de build do frontend
FROM node:22 AS build-stage

WORKDIR /project

# Copia e instala dependências do cliente
COPY client/package*.json ./client/
RUN cd client && npm install

# Copia e instala dependências do servidor
COPY server/package*.json ./server/
RUN cd server && npm install

# Copia todo o restante do código
COPY . .

# Build do frontend
RUN cd client && npm run build

# Etapa final (produção)
FROM node:22 AS production-stage

WORKDIR /project/server

# Copia o servidor com o build do cliente
COPY --from=build-stage /project/server ./

# Instala apenas dependências de produção
RUN npm install --production

EXPOSE 3000
# Comando para iniciar a aplicação
CMD npm run start
