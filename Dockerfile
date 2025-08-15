# Etapa de build do frontend
FROM node:22
WORKDIR /project

# Copia e instala dependências do cliente
COPY client/package*.json ./client/
RUN cd client && npm install && npm run build

WORKDIR /project/server

# Copia e instala dependências do servidor
COPY server/package*.json ./server/
RUN cd server && npm install --production

EXPOSE 3000
# Comando para iniciar a aplicação
CMD npm run start
