# Etapa de build
FROM node:22 AS build-stage

WORKDIR /project

# Declare os argumentos de build para as variáveis Vite aqui.
# Estes ARG devem vir antes de qualquer instrução COPY ou RUN que os utilize.
ARG VITE_API_URL
ARG VITE_MERCADO_PAGO

# Copiar dependências do cliente e servidor
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instalar dependências
RUN cd client && npm install
RUN cd server && npm install

# Copiar todo o código
COPY . .

# Rodar build do frontend (Vite já gera em server/public)
# Passe os argumentos VITE_ como variáveis de ambiente para o comando npm run build
RUN cd client && VITE_API_BASE_URL=${VITE_API_URL} \
                VITE_MERCADO_PAGO_PUBLIC_KEY=${VITE_MERCADO_PAGO} \
                npm run build

# Etapa de produção
FROM node:22 AS production-stage

WORKDIR /project/server

# Copiar servidor com a pasta public já preenchida
COPY --from=build-stage /project/server ./

# Instalar só dependências de produção
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
