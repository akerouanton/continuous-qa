FROM node:6.9-slim

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    build-essential \
    libzmq3-dev \
    python \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install -g yarn && \
    yarn install

COPY ./ /usr/src/app/

ENTRYPOINT ["npm", "run"]
CMD ["start"]
