FROM php:7-fpm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
    librabbitmq-dev \
    libssl-dev \
    zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*
RUN pecl install amqp-beta mongodb xdebug-beta \
  && docker-php-ext-install mbstring zip \
  && echo "extension=amqp.so" >> /usr/local/etc/php/php.ini \
  && echo "extension=mongodb.so" >> /usr/local/etc/php/php.ini \
  && echo "zend_extension/usr/local/lib/php/extensions/no-debug-non-zts-20151012/xdebug.so" >> /usr/local/etc/php/php.ini

WORKDIR /usr/src/app/
COPY composer.* /usr/src/app/
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && composer install --no-dev --prefer-dist

# Why does it contain ignored filed ?!
COPY ./ /usr/src/app/
RUN chown -R 1000:1000 /usr/src/app
USER 1000
