import mongoose, {Schema} from 'mongoose';
import sequelize from './sequelize-db';
import server from './graphql';
import {API_PORT, MONGO_DB_URI, AWS_CONFIG} from './config';

const {AURORA_DB_NAME} = AWS_CONFIG;

(async () => {
  try {
    server.listen(API_PORT).then(({url, subscriptionsUrl}) => {
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

    sequelize.sync();
    sequelize
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
