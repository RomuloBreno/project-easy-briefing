FROM node:22 AS build-stage
WORKDIR /project

# Copia apenas os arquivos de dependências para aproveitar cache
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instala dependências separadamente para cache eficiente
RUN npm install --prefix server
RUN npm install --prefix client

# Copia o restante do código
COPY . .

# Build do frontend e cópia para o backend
RUN npm run build --prefix client
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# Etapa final de produção
FROM node:22 AS production-stage
WORKDIR /project

# Copia apenas o backend já com o build do frontend
COPY --from=build-stage /project/server ./server

# Garante que o package.json esteja no lugar antes de instalar dependências
WORKDIR /project/server
COPY --from=build-stage /project/server/package*.json ./

# Instala apenas dependências de produção
RUN npm install --production

EXPOSE 3000

CMD npm run start