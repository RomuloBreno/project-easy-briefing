# Etapa de build do frontend
FROM node:22
WORKDIR /project

RUN cd /client

RUN npm install && npm run build

RUN cd ..

RUN cd /server && npm install --production

EXPOSE 3000
# Comando para iniciar a aplicação

CMD npm run start
