FROM node:5-slim

WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install

COPY ./ /usr/src/app/
RUN mkdir /home/user-api \
  && useradd user-api \
  && chown -R user-api:user-api /home/user-api/ /usr/src/app/

USER user-api
ENTRYPOINT ["npm", "run"]
CMD ["app"]
