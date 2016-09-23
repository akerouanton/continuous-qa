FROM logstash:2.4.0-1

COPY logstash.conf /etc/logstash/conf.d/logstash.conf
RUN logstash-plugin install --version 2.0.5 logstash-output-mongodb

CMD ["-f", "/etc/logstash/conf.d/logstash.conf"]
