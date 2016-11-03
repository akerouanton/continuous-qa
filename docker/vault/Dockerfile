FROM vault:0.6.2

RUN apk add --no-cache openssl && \
  mkdir /vault/ssl && \
  openssl \
    req -x509 -nodes -days 365 -newkey rsa:4096 \
    -keyout /vault/ssl/ca.key -out /vault/ssl/ca.crt \
    -subj "/C=FR/ST=Loire-Atlantique/L=Nantes/O=KnpLabs/OU=IT Department/CN=*"
