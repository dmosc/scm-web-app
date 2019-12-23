import mongoose, {Schema} from 'mongoose';
import sequelize from './sequelize-db';
import server from './graphql';
import {ENV, API_PORT, MONGO_DB_URI, AWS_CONFIG} from './config';

const {AURORA_DB_NAME} = AWS_CONFIG;

(async () => {
  try {
    server
      .listen(ENV.production ? API_PORT : 80)
      .then(({url, subscriptionsUrl}) => {
        console.log(`🚀  Server ready at ${url}`);
        console.log(`🚀  Subscriptions ready at ${subscriptionsUrl}`);
      });

    await mongoose
      .connect(MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .then(() => {
        Schema.Types.String.checkRequired(v => v !== null);
        console.log(`📀 Succesfully connected to database: ${MONGO_DB_URI}`);
      });

    await sequelize.sync();
    await sequelize
      .authenticate()
      .then(() => {
        console.log(`📀 Succesfully connected to database: ${AURORA_DB_NAME}`);
      })
      .catch(err => {
        console.error('Unable to connect to the database:', err);
      });
  } catch (e) {
    console.error.bind(console, e);
  }
})();
