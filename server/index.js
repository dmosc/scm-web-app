import mongoose, { Schema } from 'mongoose';
import events from 'events';
import 'moment/locale/es';
import sequelize from './sequelize-db';
import server from './graphql';
import { mongoDB, auroraDB, api } from './config/loggers';
import { API_PORT, MONGO_DB_URI, AWS_CONFIG } from './config';

const { AURORA_DB_NAME } = AWS_CONFIG;

(async () => {
  try {
    mongoDB.await('Connecting with MongoDB database');
    auroraDB.await('Connecting with AuroraDB database');

    await Promise.all([
      mongoose.connect(MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      }),
      sequelize.sync(),
      sequelize.authenticate()
    ]);

    Schema.Types.String.checkRequired(v => v !== null);
    mongoDB.success(`📀 Succesfully connected to database: ${MONGO_DB_URI}`);
    auroraDB.success(`📀 Successfully connected to database: ${AURORA_DB_NAME}`);

    const { url, subscriptionsUrl } = await server.listen(API_PORT);
    api.success(`🚀  Server ready at ${url}`);
    api.success(`🚀  Subscriptions ready at ${subscriptionsUrl}`);

    events.EventEmitter.defaultMaxListeners = 100;
  } catch (e) {
    console.error.bind(console, e);
  }
})();
