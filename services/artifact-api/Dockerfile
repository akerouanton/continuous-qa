FROM node:6.9-slim

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    build-essential \
    libmagic-dev \
    python \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY ./package.json ./yarn.lock /usr/src/app/
RUN npm install -g yarn && \
    yarn install

COPY ./ /usr/src/app/
RUN mkdir /home/artifact-api \
  && useradd artifact-api \
  && chown -R artifact-api:artifact-api /home/artifact-api/ /usr/src/app/

USER artifact-api
ENTRYPOINT ["npm", "run"]
CMD ["app"]
