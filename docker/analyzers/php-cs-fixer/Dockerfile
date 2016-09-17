FROM php:7-cli
MAINTAINER "Albin Kerouanton <albin.kerouanton@knplabs.com>"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        zlib1g-dev \
        libxslt1-dev \
        git \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install zip xsl \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && mkdir -p /home/analyzer/.composer /src /artifacts \
    && useradd analyzer \
    && chown -R analyzer:analyzer /home/analyzer /src /artifacts

WORKDIR /src
COPY ./entrypoint /entrypoint
RUN chmod +x /entrypoint
ENTRYPOINT ["/entrypoint"]

USER analyzer
RUN composer global require --prefer-dist hirak/prestissimo \
  && composer global require --prefer-dist fabpot/php-cs-fixer

VOLUME ["/artifacts"]
