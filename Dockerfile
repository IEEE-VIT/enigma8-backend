FROM node:14-buster-slim

WORKDIR /app

ENV NODE_ENV=production


COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]