FROM node:latest

LABEL maintainer="alexk"

COPY . /src

WORKDIR /src

RUN  npm install

EXPOSE 5000

ENTRYPOINT ["node","index.js" ]