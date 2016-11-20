FROM debian:jessie

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    libpcap0.8 \
  && rm -rf /var/lib/apt/lists/*

ENV VERSION=5.0.0 ARCH=linux-x86_64 EXTENSION=tar.gz
ENV FILENAME=packetbeat-${VERSION}-${ARCH}.${EXTENSION}

RUN curl -L -O https://artifacts.elastic.co/downloads/beats/packetbeat/${FILENAME} && \
  tar zxvf ${FILENAME} && \
  mv packetbeat-${VERSION}-${ARCH} /packetbeat

WORKDIR packetbeat
ADD packetbeat.yml packetbeat.yml

CMD ["./packetbeat", "-e", "-c=packetbeat.yml", "-d", "\"httpdetailed\""]
