FROM node:6.5-slim

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install

COPY ./ /usr/src/app/

ENV NODE_ENV dev

ENTRYPOINT ["npm", "run"]
CMD ["app"]
