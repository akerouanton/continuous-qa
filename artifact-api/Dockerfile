FROM node:5-slim

RUN apt-get update && \
  apt-get install -y --no-install-recommends libmagic-dev python build-essential && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install

COPY ./ /usr/src/app/
RUN mkdir /home/artifact-api \
  && useradd artifact-api \
  && chown -R artifact-api:artifact-api /home/artifact-api/ /usr/src/app/

USER artifact-api
ENTRYPOINT npm run app
