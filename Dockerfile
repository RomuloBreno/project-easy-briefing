# Etapa de construção (Build Stage)
FROM node:22 AS build-stage

# Define o diretório de trabalho dentro do container
WORKDIR /project

# Copia apenas os arquivos de dependência do servidor para aproveitar o cache
COPY server/package*.json ./server/

# Copia apenas os arquivos de dependência do cliente para aproveitar o cache
COPY client/package*.json ./client/

# Instala as dependências do servidor
WORKDIR /project/server
RUN npm install

# Instala as dependências do cliente
WORKDIR /project/client
RUN npm install

# Volta para o diretório raiz do projeto
WORKDIR /project

# Copia o restante do código da aplicação
COPY . .

# Constrói o frontend
RUN npm run build --prefix client

# Cria o diretório public no servidor e copia os arquivos construídos do cliente para lá
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# Etapa final de produção (Production Stage)
FROM node:22 AS production-stage

# Define o diretório de trabalho dentro do container
WORKDIR /project/server

# Copia os arquivos de dependência do servidor da etapa de construção
COPY --from=build-stage /project/server/package*.json ./

# Instala apenas as dependências de produção do servidor
RUN npm install --production

# Copia o restante do código do servidor, incluindo o frontend construído
COPY --from=build-stage /project/server/ ./

# Expõe a porta em que o servidor irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD npm run start
