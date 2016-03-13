FROM node:5-slim

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install

COPY ./ /usr/src/app/
RUN mkdir /home/analyzer \
  && groupadd -g 999 docker \
  && useradd -u 1000 -G docker analyzer \
  && chown -R analyzer:analyzer /usr/src/app/ /home/analyzer

USER analyzer
