FROM node:5-slim

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install

COPY ./ /src
RUN chown -R 1000:1000 /usr/src/app/
USER 1000
