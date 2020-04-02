const dotenv = require('dotenv');

dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGO_DB_URI,
    databaseName: process.env.MONGO_MIGRATIONS_DB_NAME,
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true // removes a deprecating warning when connecting
    }
  },
  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'server/mongo-db/migrations',
  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog'
};

// Return the config as a promise
module.exports = config;
