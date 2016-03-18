module.exports =  {
  "oauth": {
    "server": {
      "protocol": "http",
      "host": process.env.OAUTH_ENDPOINT || 'localhost',
      "callback": "/connected",
      "transport": "session"
    },
    "github": {
      "key": process.env.GITHUB_OAUTH_TOKEN,
      "secret": process.env.GITHUB_OAUTH_SECRET,
      "scope": []
    }
  },
  "session": {
    "secret": process.env.SESSION_SECRET || 'ThisIsNotASecret!'
  },
  "mongo_uri": process.env.MONGO_URI || "mongodb://localhost:27017/user",
  "http_port": process.env.HTTP_PORT || '3000',
  amqp: {
    host: process.env.AMQP_HOST || 'localhost',
    port: process.env.AMQP_PORT || 5672
  },
};
