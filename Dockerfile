FROM node:lts-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --silent

COPY . ./
EXPOSE 3000

CMD [ "yarn", "run", "start" ]