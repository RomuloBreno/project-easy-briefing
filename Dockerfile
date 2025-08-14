FROM node:22 AS build-stage
WORKDIR /project

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install
RUN npm run install:all

COPY . .

RUN npm run build --prefix client
RUN mkdir -p server/public && cp -r client/dist/* server/public/

FROM node:22 AS production-stage
WORKDIR /project

COPY --from=build-stage /project/server/package*.json ./server/
COPY --from=build-stage /project/server ./server
COPY --from=build-stage /project/server/public ./server/public

WORKDIR /project/server
RUN npm install --production

EXPOSE 3000

CMD npm run start