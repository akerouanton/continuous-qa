import App from '../lib/App';

new App({
  httpPort: process.env.HTTP_PORT || 8000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/artifact"
});
