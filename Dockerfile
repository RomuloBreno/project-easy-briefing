FROM node:22

# Definir diretório de trabalho
WORKDIR /project

# Copiar arquivos de configuração primeiro para aproveitar cache de build
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Instalar dependências de todos os pacotes
RUN npm install
RUN npm run install:all

# Copiar todo o restante do código
COPY . .

# Expor portas do backend e frontend
EXPOSE 3000 80

# Rodar ambos usando o script prd
CMD ["npm", "run", "prd"]
