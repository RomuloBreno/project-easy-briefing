# Estágio de build para a aplicação cliente (front-end)
FROM node:18-alpine AS build

# Define o diretório de trabalho dentro do contêiner para a pasta 'client'
# Isso significa que todos os comandos seguintes (COPY, RUN) serão executados
# a partir de /app/client
WORKDIR /app/client

# Copia os arquivos package.json e package-lock.json (ou yarn.lock)
# da sua máquina host (assumindo que estão na pasta 'client') para o WORKDIR do contêiner
COPY client/package*.json ./

# Instala as dependências do projeto. 'npm ci' é preferível para builds de produção
# pois usa o package-lock.json para instalações mais consistentes.
RUN npm ci

# Copia todo o restante do código-fonte do cliente
# da sua máquina host (pasta 'client') para o WORKDIR do contêiner
COPY client .

# Roda o comando de build do Vite para o front-end
RUN npm run build

# --- Estágio de Servir com Nginx ---
# Este estágio usa uma imagem Nginx limpa para servir os arquivos estáticos

FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia sua configuração customizada do Nginx para lidar com SPA (Single Page Application)
# Certifique-se de que 'nginx.conf' está na raiz do seu contexto de build
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos buildados do Vite (que estão em /app/client/dist no estágio 'build')
# para a pasta pública do Nginx
COPY --from=build /app/client/dist /usr/share/nginx/html

# Expõe a porta 80 do contêiner para o mundo exterior
EXPOSE 80

# Comando para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]