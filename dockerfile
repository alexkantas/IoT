FROM node:10.15.3

LABEL maintainer="alexk"

COPY . /src

WORKDIR /src

RUN  npm install

EXPOSE 5000

ENTRYPOINT ["node","index.js" ]