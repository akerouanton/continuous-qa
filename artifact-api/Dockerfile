FROM ruby:2.3

WORKDIR /usr/src/app
COPY Gemfile* /usr/src/app/
RUN bundle install

COPY ./ /usr/src/app/
RUN chown -R 1000:1000 /usr/src/app/
USER 1000

CMD ["unicorn"]
