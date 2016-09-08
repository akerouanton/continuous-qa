import App from '../lib/App';

new App({
 "mongo_uri": process.env.MONGO_URI || "mongodb://localhost:27017/artifact",
 "http_port": process.env.HTTP_PORT || '8000'
});
