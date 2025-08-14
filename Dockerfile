# Use a imagem oficial do Node.js 22 como base para o ambiente de build
FROM node:22 AS build-stage

# Define o diretório de trabalho dentro do container.
# Todos os comandos subsequentes serão executados a partir deste diretório.
WORKDIR /project

# Copia os arquivos package.json primeiro para aproveitar o cache do Docker.
# Se esses arquivos não mudarem, o Docker não precisa reinstalar as dependências.
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instala todas as dependências do projeto.
# 'npm install' para o diretório raiz e 'npm run install:all' para sub-projetos.
RUN npm install
RUN npm run install:all

# Copia todo o restante do código da sua máquina local para o diretório de trabalho no container.
COPY . .

# Constrói o aplicativo frontend usando Vite.
# O '--prefix client' indica que o comando deve ser executado no diretório 'client'.
# O resultado da build (arquivos estáticos) será geralmente colocado em 'client/dist'.
RUN npm run build --prefix client

# --- Etapa de Produção (para um container menor e mais seguro) ---
# Você pode usar a mesma imagem node:22 ou uma imagem mais leve como node:22-alpine
# para a etapa final, se preferir um container de produção menor.
# Para simplicidade e já que você já usa node:22, vamos continuar com ela.
FROM node:22 AS production-stage

WORKDIR /project

# Copia apenas o que é essencial para rodar o backend em produção.
# Isso inclui:
# 1. package.json e package-lock.json (para instalar apenas dependências de produção)
# 2. A pasta 'server' (que contém o código do backend)
# 3. A pasta 'client/dist' (que foi criada na etapa de build e contém o frontend)
COPY --from=build-stage /project/package*.json ./
COPY --from=build-stage /project/server ./server
COPY --from=build-stage /project/client/dist ./client/dist

# Opcional: Se seu 'server/public' não for criado pelo 'cp', crie-o aqui.
# No entanto, a linha abaixo já cuida disso.
# RUN mkdir -p server/public

# Copia o build do frontend (client/dist) para o diretório que o backend vai servir (server/public).
# Isso é crucial para que o servidor Node.js possa servir os arquivos HTML, CSS e JS do frontend.
RUN cp -r client/dist/* server/public/

# Instala as dependências de produção apenas para o backend.
# Isso garante que o container final seja o menor possível.
WORKDIR /project/server
RUN npm install --production

# Volta ao diretório raiz do projeto para o comando de inicialização
WORKDIR /project

# Expor as portas que o backend vai usar.
# 3000 é a porta que seu servidor Node.js/Express deve estar escutando.
# 80 é uma porta comum para HTTP, caso você esteja usando-a de alguma forma.
EXPOSE 3000 80

# Comando para iniciar o servidor backend.
# A forma de "shell" (sem colchetes) é usada para garantir que o 'npm' seja encontrado no PATH.
# Este comando deve iniciar seu servidor Node.js/Express que servirá tanto o frontend quanto as APIs.
CMD npm run start:server