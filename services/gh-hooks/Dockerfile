FROM node:6.8-slim

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install

COPY ./ /usr/src/app/

ENTRYPOINT ["npm", "run"]
CMD ["start"]
